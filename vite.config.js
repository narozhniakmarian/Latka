import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
  },
  plugins: [
    injectHTML(),
    FullReload(['./src/**/**.html']),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
