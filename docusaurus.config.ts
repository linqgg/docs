import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'LinQ Wallet Documentation',
  favicon: 'img/favicon.ico',

  url: 'https://docs.linq.gg',
  baseUrl: '/',

  trailingSlash: false,

  organizationName: 'linqgg',
  projectName: 'docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        blog: false,
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/linqgg/docs/tree/main/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card  todo:
    // image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'LinQ Wallet Docs',
      logo: {
        alt: 'LinQ Wallet Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          to: '/getting-started',
          label: 'Getting Started',
          position: 'left',
        },
        {
          to: '/modules/auth',
          position: 'left',
          label: 'Auth & Login',
        },
        {
          to: '/modules/location-checks',
          position: 'left',
          label: 'Locations',
        },
        {
          to: '/modules/money-operations',
          position: 'left',
          label: 'Money',
        },
        // {
        //   to: 'modules/authentication',
        //   position: 'left',
        //   label: 'Games',
        // },
        {
          href: 'https://buf.build/linq/linq', 
          label: 'API SDK on Buf', 
          position: 'right'
        },
        {
          href: 'https://linq.gg/',
          label: 'Wallet App',
          position: 'right'
        },
        {
          href: 'https://github.com/linqgg/docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Authentication',
              to: '/modules/auth',
            },
            // {
            //   label: 'Playing Sessions',
            //   to: '/modules/authentication',
            // },
            {
              label: 'Money Operations',
              to: '/modules/money-operations',
            },
            {
              label: 'Location Checks',
              to: '/modules/location-checks',
            },
          ],
        },
        {
          title: 'Developers',
          items: [
            {
              label: 'Platform SDKs',
              href: 'https://buf.build/linq/linq',
            },
            {
              label: 'Buf Studio',
              href: 'https://buf.build/studio',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/linkgg/docs',
            },
          ],
        },
        {
          title: 'LinQ Wallet App',
          items: [
            {
              label: 'Website',
              href: 'https://linq.gg/',
            },
            {
              label: 'Apple Store',
              href: 'https://apps.apple.com/us/app/linq-wallet/id6447305486',
            },
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Privacy Policy',
              href: 'http://linq.gg/privacy',
            },
            {
              label: 'Terms & Conditions',
              href: 'http://linq.gg/terms',
            },
            {
              label: 'Contact',
              href: 'mailto:help@galactica.games',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Galactica Games, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    mermaid: {
      theme: { light: 'neutral', dark: 'forest' },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
