import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-gpsfromtcplcc',
    version: '0.1.16',
    icon: '🛰️',
    title: 'GPS from TCP LCC',
    description: 'GPS Position from TCP LCC',
    author: 'Yann Kerherve (ENSM)',
    repository: 'https://github.com/YannKerherve/ratus',
    desktopUI: 'rhpane',
    mobileUI: 'fullscreen',
    routerPath: '/gpsfromtcp',
};

export default config;
