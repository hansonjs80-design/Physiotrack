import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            // Cache Tailwind CDN for offline usage
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tailwind-cdn-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
             // Cache Google Fonts
             urlPattern: /^https:\/\/fonts\.googleapis\.com/,
             handler: 'StaleWhileRevalidate',
             options: {
               cacheName: 'google-fonts-cache',
               cacheableResponse: {
                 statuses: [0, 200]
               }
             }
          }
        ]
      },
      manifest: {
        name: 'PhysioTrack Pro',
        short_name: 'PhysioTrack',
        description: 'Real-time Physical Therapy Management System',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        orientation: 'any',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});