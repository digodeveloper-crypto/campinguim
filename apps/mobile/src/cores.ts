// Substituído pelo tema da B2 (src/tema): as cores vêm de src/tema/tokens.json, nos 10 papéis, claro e
// escuro. Este arquivo só mantém a tela provisória da B1 funcionando; telas novas usam `useTema().cores`.
import { tokens } from './tema';

/** @deprecated use `useTema().cores` (segue o tema do aparelho). */
export const cores = tokens.cores.claro;
