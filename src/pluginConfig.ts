import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-gpsfromtcp',
    version: '0.1.12',
    icon: '🛰️',
    title: 'GPS from TCP',
    description: 'GPS Position from TCP port.',
    author: 'Yann Kerherve (ENSM)',
    repository: 'https://github.com/windycom/windy-plugin-template',
    desktopUI: 'rhpane',
    mobileUI: 'fullscreen',
    routerPath: '/gpsfromtcp',
};

export default config;
