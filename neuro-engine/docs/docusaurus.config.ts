import type { Config } from '@docusaurus/types';
import classic from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Neuro-Engine Docs',
  tagline: 'BuilderOps playbook for websim.ai experiments',
  favicon: 'img/favicon.ico',
  url: 'https://websim.ai',
  baseUrl: '/',
  organizationName: 'websim-ai',
  projectName: 'neuro-engine',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  presets: [
    classic({
      docs: {
        sidebarPath: './sidebars.ts'
      },
      blog: false,
      theme: {
        customCss: './src/css/custom.css'
      }
    })
  ]
};

export default config;
