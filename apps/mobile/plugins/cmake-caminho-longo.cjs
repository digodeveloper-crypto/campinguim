// Plugin local (copiado da prova técnica, prova/app/plugins): faz o build C++ usar o CMake 3.31.6 do Android SDK, que traz o ninja
// 1.12.1. O CMake padrão (3.22.1, ninja 1.10.2) falha no Windows com caminhos acima de 260
// caracteres ("Filename longer than 260 characters") nos módulos de gesto e animação.
// Exige o pacote "cmake;3.31.6" instalado no SDK (registrado em docs/prova-tecnica/ambiente.md e em docs/desenvolvimento.md).
const fs = require('node:fs');
const path = require('node:path');
const { withDangerousMod } = require('expo/config-plugins');

const VERSAO = '3.31.6';

module.exports = function withCmakeCaminhoLongo(config) {
  // O problema do caminho longo é só do Windows. Fora dele (esteira da versão, em Linux) o build usa
  // o CMake padrão do Android SDK, e este plugin não exige o 3.31.6.
  if (process.platform !== 'win32') return config;
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const sdk =
        process.env.ANDROID_HOME ||
        process.env.ANDROID_SDK_ROOT ||
        path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
      const cmake = path.join(sdk, 'cmake', VERSAO);
      if (!fs.existsSync(cmake)) {
        throw new Error(`cmake-caminho-longo: falta o CMake ${VERSAO} no SDK (sdkmanager "cmake;${VERSAO}")`);
      }
      const arquivo = path.join(cfg.modRequest.platformProjectRoot, 'local.properties');
      const linhas = fs.existsSync(arquivo)
        ? fs.readFileSync(arquivo, 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('cmake.dir='))
        : [];
      // local.properties aceita barras normais; fica fora do git (pasta android gerada).
      linhas.push(`cmake.dir=${cmake.split(path.sep).join('/')}`);
      fs.writeFileSync(arquivo, linhas.join('\n') + '\n');
      return cfg;
    },
  ]);
};
