import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     skipWaiting: true,
    //     clientsClaim: true,
    //     globPatterns: ['**/*.{js,css,html}'],
    //     maximumFileSizeToCacheInBytes: 10000000,
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/yaltxcmspsvnhnxomhwa\.supabase\.co\/rest\/.*/i,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'supabase-api',
    //           expiration: { maxEntries: 60, maxAgeSeconds: 86400 },
    //           cacheableResponse: { statuses: [0, 200] },
    //         },
    //       },
    //       {
    //         urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'images',
    //           expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
    //         },
    //       }
    //     ],
    //   },
    //   manifest: {
    //     name: 'Cabrerizos F.C.',
    //     short_name: 'CFC',
    //     description: 'Gestión táctica y técnica del equipo de fútbol',
    //     theme_color: '#0a0a0a',
    //     background_color: '#0a0a0a',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     start_url: '/cabrerizos-fc/#/',
    //     scope: '/cabrerizos-fc/',
    //     icons: [
    //       { src: 'escudo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    //       { src: 'escudo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    //     ],
    //   },
    //   devOptions: { enabled: false },
    // }),
  ],
  base: '/cabrerizos-fc/',
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 700,
    sourcemap: false,
    cssMinify: true,
    assetsInlineLimit: 4096,
  },
})
