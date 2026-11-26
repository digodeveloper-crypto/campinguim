// Plugin local (copiado da prova técnica, prova/app/plugins): libera HTTP sem cifra só para o endereço do servidor local
// (o computador visto de dentro do emulador). Todo o resto continua exigindo HTTPS.
// O endereço chega pelo único valor de configuração (config/enderecos.json).
const fs = require('node:fs');
const path = require('node:path');
const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');

function xml(host) {
  return `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false" />
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="false">${host}</domain>
  </domain-config>
</network-security-config>
`;
}

module.exports = function withTrafegoLocal(config, { host }) {
  if (!host) throw new Error('trafego-local: falta o host do servidor');
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const dir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'network_security_config.xml'), xml(host));
      return cfg;
    },
  ]);
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0];
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    delete app.$['android:usesCleartextTraffic'];
    return cfg;
  });
};
