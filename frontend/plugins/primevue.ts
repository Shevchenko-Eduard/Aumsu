import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: false,
    theme: {
      preset: Aura,
      options: {
        prefix: 'p',
        darkModeSelector: false,
        cssLayer: false
      }
    }
  })
})
