<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const store = useUiStore()
const localeCode = useLocale()
const navigation = getNavigation(localeCode)
const services = getExternalServices()

const quickServices = computed(() => services.filter((item) => ['lkabit', 'schedule', 'payment'].includes(item.key)))
const navItems = computed(() => navigation.main.filter((item) => item.visible))
const closeButton = ref<HTMLButtonElement | null>(null)

const shortTitles: Record<string, Record<string, string>> = {
  ru: { international: 'Международное', 'student-life': 'Студенческая жизнь' },
  en: { international: 'International', 'student-life': 'Student life' }
}

function navTitle(item: { id: string; title: string }) {
  return shortTitles[localeCode]?.[item.id] || item.title
}

function serviceTitle(item: { title: string; titleEn?: string }) {
  return localeCode === 'en' ? item.titleEn || item.title : item.title
}

function toggleMenu() {
  store.setMobileNav(!store.mobileNavOpen)
}

function closeMenu() {
  store.setMobileNav(false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && store.mobileNavOpen) closeMenu()
}

watch(
  () => store.mobileNavOpen,
  async (open) => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      await nextTick()
      closeButton.value?.focus()
    }
  }
)

watch(
  () => route.fullPath,
  () => closeMenu()
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <header class="site-header">
    <div class="utility-bar">
      <div class="container utility-bar__inner">
        <nav class="utility-bar__services" :aria-label="t('nav.quickServices')">
          <a
            v-for="service in quickServices"
            :key="service.key"
            :href="service.url"
            class="utility-bar__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ serviceTitle(service) }}
            <i class="pi pi-external-link" aria-hidden="true" />
            <span class="visually-hidden">({{ t('common.opensNewWindow') }})</span>
          </a>
        </nav>
        <div class="utility-bar__settings">
          <NuxtLink :to="localePath('/sveden')" class="utility-bar__link utility-bar__sveden">
            {{ t('footer.sveden') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/search')" class="utility-bar__search" :aria-label="t('search.title')">
            <i class="pi pi-search" aria-hidden="true" />
            <span>{{ t('nav.search') }}</span>
          </NuxtLink>
          <AccessibilityToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </div>

    <div class="container header-main">
      <NuxtLink :to="localePath('/')" class="brand" :aria-label="t('site.name')">
        <img src="/media/logo.svg" alt="" width="54" height="54" class="brand__logo" />
        <span class="brand__text">
          <span class="brand__university">{{ t('site.name') }}</span>
          <span class="brand__tagline">{{ t('site.tagline') }}</span>
        </span>
      </NuxtLink>

      <nav class="main-nav" :aria-label="t('nav.main')">
        <ul>
          <li v-for="item in navItems" :key="item.id">
            <NuxtLink
              :to="localePath(item.path)"
              class="main-nav__link"
              :class="{ 'is-active': route.path === localePath(item.path) || route.path.startsWith(`${localePath(item.path)}/`) }"
              :aria-current="route.path === localePath(item.path) || route.path.startsWith(`${localePath(item.path)}/`) ? 'page' : undefined"
            >
              {{ navTitle(item) }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="header-actions">
        <NuxtLink :to="localePath('/search')" class="icon-button" :aria-label="t('search.title')">
          <i class="pi pi-search" aria-hidden="true" />
        </NuxtLink>
        <BaseButton :to="localePath('/admissions/apply')" size="sm" class="header-apply">
          {{ t('nav.apply') }}
        </BaseButton>
        <button
          type="button"
          class="icon-button mobile-toggle"
          :aria-label="t('nav.menu')"
          :aria-expanded="store.mobileNavOpen"
          aria-controls="mobile-navigation"
          @click="toggleMenu"
        >
          <i class="pi pi-bars" aria-hidden="true" />
        </button>
      </div>
    </div>

    <Transition name="drawer">
      <div v-if="store.mobileNavOpen" class="mobile-layer">
        <div class="mobile-layer__backdrop" @click="closeMenu" />
        <aside
          id="mobile-navigation"
          class="mobile-drawer"
          role="dialog"
          aria-modal="true"
          :aria-label="t('nav.menu')"
        >
          <div class="mobile-drawer__head">
            <span class="mobile-drawer__title">{{ t('nav.allSections') }}</span>
            <button ref="closeButton" type="button" class="icon-button" :aria-label="t('nav.close')" @click="closeMenu">
              <i class="pi pi-times" aria-hidden="true" />
            </button>
          </div>

          <nav :aria-label="t('nav.main')">
            <ul class="mobile-nav">
              <li v-for="item in navItems" :key="item.id">
                <NuxtLink :to="localePath(item.path)" class="mobile-nav__link" @click="closeMenu">
                  {{ navTitle(item) }}
                  <i class="pi pi-arrow-right" aria-hidden="true" />
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <div class="mobile-drawer__group">
            <span class="mobile-drawer__label">{{ t('nav.quickServices') }}</span>
            <a
              v-for="service in services"
              :key="service.key"
              :href="service.url"
              class="mobile-nav__link mobile-nav__link--small"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ serviceTitle(service) }}
              <i class="pi pi-external-link" aria-hidden="true" />
            </a>
          </div>

          <div class="mobile-drawer__settings">
            <AccessibilityToggle tone="dark" />
            <LanguageSwitcher tone="dark" />
          </div>
        </aside>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg);
  box-shadow: 0 1px 0 rgba(20, 32, 43, 0.08);
}

.utility-bar {
  background: var(--color-primary-950);
  color: #fff;
}

.utility-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 40px;
}

.utility-bar__services,
.utility-bar__settings {
  display: flex;
  align-items: center;
  gap: 18px;
}

.utility-bar__link,
.utility-bar__search {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.74rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.utility-bar__link:hover,
.utility-bar__search:hover {
  color: #fff;
}

.utility-bar__link .pi {
  font-size: 0.65rem;
}

.utility-bar__search {
  gap: 5px;
}

.utility-bar__settings {
  gap: 14px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  min-height: 78px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
  max-width: 270px;
  color: var(--color-primary-900);
  text-decoration: none;
}

.brand__logo {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
}

.brand__text {
  display: flex;
  flex-direction: column;
}

.brand__university {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.15;
}

.brand__tagline {
  margin-top: 3px;
  color: var(--color-text-muted);
  font-size: 0.67rem;
  line-height: 1.3;
}

.main-nav {
  flex: 1 1 auto;
}

.main-nav ul {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.main-nav li {
  margin: 0;
}

.main-nav__link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
}

.main-nav__link:hover {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
}

.main-nav__link.is-active {
  color: var(--color-primary-700);
  box-shadow: inset 0 -2px 0 var(--color-accent-600);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: #fff;
  color: var(--color-primary-900);
  font-size: 1rem;
  cursor: pointer;
}

.icon-button:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-200);
}

.mobile-toggle {
  display: none;
}

.header-apply {
  white-space: nowrap;
}

.mobile-layer {
  position: fixed;
  inset: 0;
  z-index: 200;
}

.mobile-layer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(6, 24, 42, 0.55);
  backdrop-filter: blur(2px);
}

.mobile-drawer {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  width: min(420px, 92vw);
  height: 100%;
  padding: var(--space-5);
  overflow-y: auto;
  background: #fff;
  box-shadow: var(--shadow-lg);
}

.mobile-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-drawer__title,
.mobile-drawer__label {
  color: var(--color-text-muted);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mobile-nav__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 10px 4px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  text-decoration: none;
}

.mobile-nav__link .pi {
  color: var(--color-border-strong);
  font-size: 0.85rem;
}

.mobile-nav__link:hover {
  color: var(--color-primary-700);
}

.mobile-nav__link--small {
  border: 0;
  min-height: 38px;
  padding: 6px 0;
  font-family: var(--font-sans);
  font-size: 0.86rem;
  font-weight: 600;
}

.mobile-drawer__group {
  display: flex;
  flex-direction: column;
}

.mobile-drawer__settings {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: auto;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-active .mobile-drawer,
.drawer-leave-active .mobile-drawer {
  transition: transform 0.24s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .mobile-drawer,
.drawer-leave-to .mobile-drawer {
  transform: translateX(100%);
}

@media (max-width: 1279px) {
  .main-nav__link {
    padding-inline: 6px;
    font-size: 0.75rem;
  }
  .brand__tagline {
    display: none;
  }
}

@media (max-width: 1179px) {
  .utility-bar__sveden,
  .utility-bar__services {
    display: none;
  }

  .utility-bar__inner {
    justify-content: flex-end;
  }

  .main-nav {
    display: none;
  }

  .header-main {
    justify-content: space-between;
  }

  .mobile-toggle {
    display: inline-flex;
  }

  .header-actions {
    margin-left: auto;
  }
}

@media (max-width: 639px) {
  .utility-bar__search span {
    display: none;
  }

  .brand__university {
    font-size: 0.82rem;
  }

  .brand {
    max-width: 210px;
  }

  .header-apply {
    display: none;
  }

  .header-main {
    min-height: 68px;
  }

  .brand__logo {
    width: 46px;
    height: 46px;
    flex-basis: 46px;
  }
}
</style>
