import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const configDir = path.dirname(fileURLToPath(import.meta.url))
const routeFile = path.resolve(configDir, 'content/routes.json')
const prerenderRoutes: string[] = fs.existsSync(routeFile)
  ? (JSON.parse(fs.readFileSync(routeFile, 'utf8')) as string[])
  : ['/']

export default defineNuxtConfig({
  compatibilityDate: '2026-10-19',
  devtools: { enabled: false },
  modules: ['@nuxtjs/i18n', '@pinia/nuxt', '@nuxt/eslint'],
  css: [
    'primeicons/primeicons.css',
    '~/assets/styles/tokens.css',
    '~/assets/styles/base.css',
    '~/assets/styles/primevue.css'
  ],
  components: [{ path: '~/components', pathPrefix: false }],
  typescript: {
    strict: true,
    typeCheck: false
  },
  experimental: {
    appManifest: false
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://aumsu.ru'
    }
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'ru',
    locales: [
      { code: 'ru', language: 'ru-RU', file: 'ru.json', name: 'Русский' },
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' }
    ],
    langDir: 'locales',
    detectBrowserLanguage: false
  },
  nitro: {
    prerender: {
      concurrency: 4,
      interval: 100,
      routes: prerenderRoutes,
      crawlLinks: true,
      failOnError: false
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0B2A4A' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/media/logo.svg' }
      ]
    }
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        },
        treeshake: {
          // Заменяет moduleSideEffects: false из пресета smallest
          moduleSideEffects: false, 
          // Заменяет propertyReadSideEffects: false из пресета smallest
          propertyReadSideEffects: false, 
          // Разрешаем обрабатывать аннотации чистых функций
          annotations: true 
        }
      },
      sourcemap: false,
      assetsInlineLimit: 0,
      cssCodeSplit: true,
      minify: 'esbuild',
      cssMinify: 'esbuild'
    }
  },
  eslint: {
    config: {
      stylistic: false
    }
  }
})
