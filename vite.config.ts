import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'script',
          includeAssets: ['icon.svg'],
          manifest: {
            name: "EMAGYNE SIMULATOR",
            short_name: 'EMAGYNE',
            description: 'Interactive Academic Exams Simulator',
            theme_color: '#0f172a',
            background_color: '#0f172a',
            display: 'standalone',
            icons: [
              {
                src: 'icon.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              },
              {
                src: 'icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              }
            ]
          },
          devOptions: {
            enabled: true
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
