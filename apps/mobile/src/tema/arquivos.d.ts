// Arquivos que o Metro empacota como recurso (a importação devolve o identificador do recurso).
declare module '*.ttf' {
  const recurso: number;
  export default recurso;
}
