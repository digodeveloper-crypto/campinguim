// Repositório da verificação sobre a API REST do próprio Supabase, com a chave de serviço
// (que só existe no servidor; DEF-09). Sem biblioteca externa: só `fetch`.

import type { Repositorio, Tentativa } from './servico.ts';

export class RepositorioRest implements Repositorio {
  private readonly url: string;
  private readonly chaveServico: string;

  constructor(url: string, chaveServico: string) {
    this.url = url.replace(/\/$/, '');
    this.chaveServico = chaveServico;
  }

  private cabecalhos(extra: Record<string, string> = {}): Record<string, string> {
    const cabecalhos: Record<string, string> = {
      apikey: this.chaveServico,
      'content-type': 'application/json',
      ...extra,
    };
    // A chave antiga é um JWT e vai também como Bearer; a nova (sb_secret_) só no apikey.
    if (this.chaveServico.split('.').length === 3) cabecalhos.authorization = `Bearer ${this.chaveServico}`;
    return cabecalhos;
  }

  private pedir(caminho: string, init: RequestInit): Promise<Response> {
    return fetch(`${this.url}/rest/v1/${caminho}`, init);
  }

  async verificadoEm(installId: string): Promise<number | null> {
    const r = await this.pedir(
      `device?select=integrity_ok_at&install_id=eq.${encodeURIComponent(installId)}`,
      { headers: this.cabecalhos() },
    );
    if (!r.ok) throw new Error(`device: HTTP ${r.status}`);
    const linhas = (await r.json()) as { integrity_ok_at: string | null }[];
    const quando = linhas[0]?.integrity_ok_at;
    return quando ? Date.parse(quando) : null;
  }

  async marcarVerificado(installId: string, quandoMs: number): Promise<void> {
    const r = await this.pedir('device?on_conflict=install_id', {
      method: 'POST',
      headers: this.cabecalhos({ prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify({ install_id: installId, platform: 'android', integrity_ok_at: new Date(quandoMs).toISOString() }),
    });
    if (!r.ok) throw new Error(`device: HTTP ${r.status}`);
  }

  async registrarTokenUsado(resumoDoToken: string): Promise<boolean> {
    const r = await this.pedir('integrity_token_used', {
      method: 'POST',
      headers: this.cabecalhos({ prefer: 'return=minimal' }),
      body: JSON.stringify({ token_sha256: resumoDoToken }),
    });
    if (r.status === 409) return false;
    if (!r.ok) throw new Error(`integrity_token_used: HTTP ${r.status}`);
    return true;
  }

  async registrarTentativa(t: Tentativa): Promise<void> {
    const r = await this.pedir('integrity_attempt', {
      method: 'POST',
      headers: this.cabecalhos({ prefer: 'return=minimal' }),
      body: JSON.stringify({ install_id: t.installId, result: t.resultado, reason: t.motivo }),
    });
    if (!r.ok) throw new Error(`integrity_attempt: HTTP ${r.status}`);
  }
}
