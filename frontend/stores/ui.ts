import { defineStore } from 'pinia'

type CookieChoice = 'all' | 'necessary' | null

export const useUiStore = defineStore('ui', {
  state: () => ({
    mobileNavOpen: false,
    accessibility: false,
    cookieConsent: null as CookieChoice
  }),
  actions: {
    init() {
      if (!import.meta.client) return
      this.accessibility = window.localStorage.getItem('aumsu-a11y') === '1'
      const cookie = window.localStorage.getItem('aumsu-cookie')
      this.cookieConsent = cookie === 'all' || cookie === 'necessary' ? cookie : null
      this.applyAccessibility()
    },
    setMobileNav(open: boolean) {
      this.mobileNavOpen = open
    },
    toggleAccessibility() {
      this.accessibility = !this.accessibility
      if (import.meta.client) {
        window.localStorage.setItem('aumsu-a11y', this.accessibility ? '1' : '0')
      }
      this.applyAccessibility()
    },
    setCookieConsent(choice: Exclude<CookieChoice, null>) {
      this.cookieConsent = choice
      if (import.meta.client) {
        window.localStorage.setItem('aumsu-cookie', choice)
      }
    },
    applyAccessibility() {
      if (!import.meta.client) return
      document.documentElement.classList.toggle('a11y-mode', this.accessibility)
    }
  }
})
