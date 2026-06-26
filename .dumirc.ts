import { defineConfig } from 'dumi';
import path from 'path';

const basePath = process.env.GH_PAGES ? '/notification/' : '/';
const publicPath = process.env.GH_PAGES ? '/notification/' : '/';

export default defineConfig({
  alias: {
    '@rc-component/notification$': path.resolve('src'),
    '@rc-component/notification/es': path.resolve('src'),
  },
  favicons: ['https://avatars0.githubusercontent.com/u/9441414?s=200&v=4'],
  themeConfig: {
    name: 'Notification',
    logo: 'https://avatars0.githubusercontent.com/u/9441414?s=200&v=4',
  },
  outputPath: 'docs-dist',
  base: basePath,
  publicPath,
});
