// Formulário da lista de espera (tela 15 do protótipo; SPEC, seção 7; decisão R3): só o e-mail e a
// caixa de consentimento, obrigatória. Erro com ícone, texto e ação; a falha de rede não apaga o
// e-mail digitado. Nada fica guardado no navegador. O campo armadilha (escondido de quem usa a
// página e do leitor de tela) pega robôs que preenchem tudo: preenchido, a página finge que
// enviou e não chama o servidor.
import { type FormEvent, useRef, useState } from 'react';

import { CaixaDeMarcar } from '../componentes/CaixaDeMarcar';
import { Mensagem, type TipoDeMensagem } from '../componentes/Mensagem';
import { config } from '../config';
import { textos } from '../textos';
import { entrarNaListaDeEspera, type ErroDoFormulario, formularioLiberado, type ResultadoDoEnvio, validarFormulario } from './listaDeEspera';

const t = textos.site;

const TEXTO_DO_ERRO: Record<ErroDoFormulario, string> = {
  emailVazio: t.emailVazio,
  emailInvalido: t.emailInvalido,
  semAceite: t.marqueACaixa,
};

const TEXTO_DO_RESULTADO: Record<ResultadoDoEnvio, { tipo: TipoDeMensagem; texto: string }> = {
  ok: { tipo: 'ok', texto: t.listaDeEsperaOk },
  invalido: { tipo: 'erro', texto: t.emailInvalido },
  muitasTentativas: { tipo: 'erro', texto: t.muitasTentativas },
  falhou: { tipo: 'erro', texto: t.semConexao },
};

/** O rascunho legal aparece marcado como rascunho, sem a marca técnica do arquivo de textos. */
function semMarcaDePendente(texto: string): string {
  return texto.replace(/^\[PENDENTE\]\s*/, '');
}

export function FormularioDeEspera() {
  const [email, setEmail] = useState('');
  const [aceite, setAceite] = useState(false);
  const [armadilha, setArmadilha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: TipoDeMensagem; texto: string } | null>(null);
  const [erroNoEmail, setErroNoEmail] = useState(false);
  const campoEmail = useRef<HTMLInputElement>(null);

  if (!formularioLiberado(t.consentimento, config.ambienteLocal)) {
    return (
      <div className="folha formulario">
        <Mensagem tipo="info" texto={t.esperaEmBreve} />
      </div>
    );
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;
    const erro = validarFormulario(email, aceite);
    if (erro) {
      setMensagem({ tipo: 'erro', texto: TEXTO_DO_ERRO[erro] });
      setErroNoEmail(erro !== 'semAceite');
      if (erro !== 'semAceite') campoEmail.current?.focus();
      return;
    }
    setErroNoEmail(false);
    if (armadilha !== '') {
      setMensagem(TEXTO_DO_RESULTADO.ok);
      return;
    }
    setEnviando(true);
    setMensagem(null);
    const resultado = await entrarNaListaDeEspera({ servidor: config.servidor, chavePublica: config.chavePublica, email });
    setEnviando(false);
    setErroNoEmail(resultado === 'invalido');
    setMensagem(TEXTO_DO_RESULTADO[resultado]);
  }

  return (
    <form className="folha formulario" noValidate onSubmit={(e) => void enviar(e)}>
      <label className="campo">
        <span className="campo-rotulo">{t.seuEmail}</span>
        <input
          ref={campoEmail}
          className="entrada"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={erroNoEmail}
          aria-describedby="espera-resposta"
        />
      </label>
      <div className="armadilha" aria-hidden="true">
        <label>
          {t.armadilha}
          <input type="text" name="empresa" tabIndex={-1} autoComplete="off" value={armadilha} onChange={(e) => setArmadilha(e.target.value)} />
        </label>
      </div>
      <CaixaDeMarcar rotulo={semMarcaDePendente(t.consentimento)} marcada={aceite} aoMudar={setAceite} descritaPor="espera-resposta" />
      <button type="submit" className="botao botao--principal botao--bloco" aria-disabled={enviando}>
        {enviando ? t.enviando : t.entrarNaListaDeEspera}
      </button>
      <Mensagem id="espera-resposta" tipo={mensagem?.tipo ?? null} texto={mensagem?.texto ?? ''} />
    </form>
  );
}
