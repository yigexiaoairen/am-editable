import { defineConfig } from 'dumi';

const config = defineConfig({
  mode: 'site',
  title: 'am-editable',
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
  ],
  // menus: {
  //   '/guide': {
  //     title: '指南',
  //     children: [
  //       'guide.md'
  //     ]
  //   }
  // },
  // navs: [
  //   { title: 'GitHub', path: 'https://github.com/yigexiaoairen/am-editable' },
  // ]
});

export default config;