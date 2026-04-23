import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache Supabase REST API with Network-First (fresh data preferred, fall back to cache)
            urlPattern: /^https:\/\/yaltxcmspsvnhnxomhwa\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 60, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache exercise images with Cache-First (static assets, rarely change)
            urlPattern: /\/exercises\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 604800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Cabrerizos F.C.',
        short_name: 'CFC',
        description: 'Gestión táctica y técnica del equipo de fútbol',
        theme_color: '#0057ff',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/cabrerizos-fc/',
        scope: '/cabrerizos-fc/',
        icons: [
          { src: '/cabrerizos-fc/escudo.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/cabrerizos-fc/escudo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      devOptions: {
        enabled: false, // keep dev fast; SW only active in production build
      },
    }),
  ],
  base: '/cabrerizos-fc/',
})
