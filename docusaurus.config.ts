import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Rotator Legacy Archive',
  tagline: 'Forensic documentation for the legacy Rotator application.',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  url: 'https://docs.commonbond.au',
  baseUrl: '/rotator/',
  trailingSlash: false,

  // GitHub pages deployment config.
  organizationName: 'dm-ra-01',
  projectName: 'doco-rotator-legacy',

  onBrokenLinks: 'warn', // Allowed for cross-site linking during development

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/dm-ra-01/doco-rotator-legacy/tree/main/',
        },
        blog: false, // Disabling blog for legacy archive
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/receptor-logo.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Rotator Legacy',
      logo: {
        alt: 'Rotator Logo',
        src: 'img/rotator-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'rotatorSidebar',
          position: 'left',
          label: 'Archive',
        },
        { to: '/knowledge-graph', label: '🧠 Map', position: 'left' },
        {
          href: 'https://github.com/dm-ra-01/doco-rotator-legacy',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation Ecosystem',
          items: [
            {
              label: 'Receptor Ecosystem',
              href: 'https://docs.commonbond.au/receptor',
            },
            {
              label: 'Common Bond Corporate',
              href: 'https://docs.commonbond.au/corporate',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Common Bond. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
