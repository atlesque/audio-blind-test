// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    ['@nuxt/eslint', { config: { typescript: { strict: false } } }],
    '@pinia/nuxt',
    '@primevue/nuxt-module',
  ],
  css: ['primeicons/primeicons.css'],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
    },
  },
})
