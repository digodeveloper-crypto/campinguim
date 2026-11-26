import textosPtBr from './pt-BR.json';

// Único ponto de acesso aos textos da interface. As telas importam `textos` e nunca escrevem
// frase solta no código (a regra de lint react/jsx-no-literals barra texto escrito no JSX).
export const textos = textosPtBr;
