import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';
import {defineConfig, loadEnv, Plugin} from 'vite';

function buildTimePlugin(): Plugin {
  return {
    name: 'build-time',
    transformIndexHtml(html) {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const buildTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      return html.replace(/<title>.*?<\/title>/, `<title>My Daily Calendar App ${buildTime}</title>`);
    },
    apply: 'build',
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // base: '/daily-calendar-for-ink/',
    base: '/',
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['motion'],
            'vendor-lunar': ['lunar-javascript'],
          },
        },
      },
    },
    plugins: [
      react(),
      legacy({
        targets: ['Android >= 4.4', 'Chrome >= 61'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        modernPolyfills: true,
      }),
      buildTimePlugin(),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
