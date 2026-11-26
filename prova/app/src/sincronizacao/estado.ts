import { useStatus } from '@powersync/react-native';
import { useEffect, useRef, useState } from 'react';

import { banco, supabase } from '../dados/banco';
import { registrar } from '../dados/registro';

// Quem está logado neste aparelho (ou ninguém).
export function useUsuario(): string | null | undefined {
  const [id, setId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setId(data.session?.user.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => setId(sessao?.user.id ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return id;
}

// Quantas alterações esperam envio, e se a sincronização está ligada (SPEC, seção 4: indicador
// discreto com a contagem). Registra a contagem enquanto houver fila, para o roteiro da prova.
export function useFila(): { pendentes: number; conectado: boolean } {
  const status = useStatus();
  const [pendentes, setPendentes] = useState(0);
  useEffect(() => {
    let vivo = true;
    let ultimo = { n: -1, conectado: false };
    const ler = async () => {
      const { count } = await banco.getUploadQueueStats();
      if (!vivo) return;
      setPendentes(count);
      const conectado = banco.currentStatus.connected;
      if (count !== ultimo.n || conectado !== ultimo.conectado) registrar('fila', { n: count, conectado });
      ultimo = { n: count, conectado };
    };
    ler();
    const t = setInterval(ler, 1000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, []);
  return { pendentes, conectado: status.connected };
}

// Mede a maior pausa da tela (linha principal do JavaScript) com um relógio a cada 100 ms.
// Usa o relógio monotônico (performance.now), que não pula quando a hora do aparelho muda.
// Pausa acima de 250 ms vai para o registro. Critério do P7: nenhuma acima de 1 s.
export function useMaiorPausa(): number {
  const [maior, setMaior] = useState(0);
  const ultimo = useRef(performance.now());
  useEffect(() => {
    const t = setInterval(() => {
      const agora = performance.now();
      const pausa = Math.round(agora - ultimo.current - 100);
      ultimo.current = agora;
      if (pausa > 250) registrar('pausa', { ms: pausa });
      setMaior((m) => (pausa > m ? pausa : m));
    }, 100);
    return () => clearInterval(t);
  }, []);
  return maior;
}
