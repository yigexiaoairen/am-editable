import { defineConfig } from 'dumi';

const config = defineConfig({
  title: 'dumi',
  outputPath: 'docs-dist',
  // more config: https://d.umijs.org/config,
  theme: {
    '@s-site-menu-width': '208px',
  },
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
      'antd',
    ],
  ]
});

export default config;