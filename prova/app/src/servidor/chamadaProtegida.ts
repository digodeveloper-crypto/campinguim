// Chamada à função de teste protegida pela verificação do aparelho (F0-5). Usa só a interface
// própria (`../verificacao`), nunca a biblioteca do Expo direto.
import { config } from '../config';
import { criarVerificacao, resumoDoPedido } from '../verificacao';

const FUNCAO = 'prova_chamada_protegida';
const CAMINHO = '/functions/v1/prova-chamada-protegida';

export type ResultadoDaChamada =
  | { tipo: 'aceita'; verificadoPor: string }
  | { tipo: 'recusada'; codigo: string }
  | { tipo: 'invalida'; codigo: string }
  | { tipo: 'sem_conexao' }
  | { tipo: 'erro'; status: number };

// Identificador aleatório da instalação (SPEC, seção 11). Na prova, vale enquanto o app está
// aberto; guardar no aparelho e usar gerador seguro fica para a feature 3.7.
function novoId(): string {
  const aleatorio = globalThis.crypto?.randomUUID?.();
  if (aleatorio) return aleatorio;
  return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
}

const installId = novoId();
const verificacao = criarVerificacao();

export const nomeDaVerificacao = verificacao.nome;

export async function chamarFuncaoProtegida(comProva: boolean): Promise<ResultadoDaChamada> {
  const requestId = novoId();
  const dados = { origem: 'tela_de_verificacao' };
  const corpo: Record<string, unknown> = { install_id: installId, request_id: requestId, dados };
  if (comProva) {
    await verificacao.preparar();
    corpo.prova = await verificacao.obterProva(resumoDoPedido(FUNCAO, installId, requestId, dados));
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${config.urlApi}${CAMINHO}`, {
      method: 'POST',
      headers: { apikey: config.supabaseChavePublica, 'content-type': 'application/json' },
      body: JSON.stringify(corpo),
    });
  } catch {
    return { tipo: 'sem_conexao' };
  }

  const json = (await resposta.json().catch(() => ({}))) as { code?: string; verificado_por?: string };
  if (resposta.status === 200) return { tipo: 'aceita', verificadoPor: json.verificado_por ?? '' };
  if (resposta.status === 403 && json.code) return { tipo: 'recusada', codigo: json.code };
  if (resposta.status === 400 && json.code) return { tipo: 'invalida', codigo: json.code };
  return { tipo: 'erro', status: resposta.status };
}
