import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'LinQ Documentation',
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
      title: 'LinQ Docs',
      logo: {
        alt: 'LinQ Logo',
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
          to: '/modules/money',
          position: 'left',
          label: 'Money',
        },
        // {
        //   to: 'modules/authentication',
        //   position: 'left',
        //   label: 'Games',
        // },
        {
          href: 'https://github.com/linqgg/unity-sdk',
          label: 'Unity SDK',
          position: 'right'
        },
        {
          href: 'https://buf.build/linq/linq',
          label: 'Server SDK',
          position: 'right'
        },
        {
          href: 'https://linq.gg/',
          label: 'LinQ Pay',
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
              label: 'Auth Actions',
              to: '/modules/auth',
            },
            {
              label: 'Money Operations',
              to: '/modules/money',
            },
            {
              label: 'Play Mechanics',
              to: '/modules/play',
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
          title: 'Resources',
          items: [
            {
              label: 'LinQ Pay',
              href: 'https://linq.gg/',
            },
            {
              label: 'App Store',
              href: 'https://apps.apple.com/us/developer/galactica-games/id1680876974',
            },
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Privacy Policy',
              href: 'https://linq.gg/privacy-policy',
            },
            {
              label: 'Terms & Conditions',
              href: 'https://linq.gg/terms-of-use',
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
      additionalLanguages: ['protobuf'],
    },
    mermaid: {
      theme: { light: 'neutral', dark: 'forest' },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
