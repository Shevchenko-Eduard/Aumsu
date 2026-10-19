<script setup lang="ts">
const store = useUiStore()

const a11yStyleId = 'a11y-contrast-overrides'

function applyA11yOverrides() {
  if (!import.meta.client) return
  const existing = document.getElementById(a11yStyleId)
  if (!store.accessibility) {
    existing?.remove()
    return
  }
  const style = existing || document.createElement('style')
  style.id = a11yStyleId
  style.textContent = `
html.a11y-mode .site-header,
html.a11y-mode .utility-bar,
html.a11y-mode .header-main {
  background: #000 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

html.a11y-mode a,
html.a11y-mode .main-nav__link,
html.a11y-mode .footer-list a,
html.a11y-mode .footer-contacts a,
html.a11y-mode .footer-bottom__links a,
html.a11y-mode .utility-bar__link,
html.a11y-mode .mobile-nav__link {
  color: #ffe66d !important;
}

html.a11y-mode .btn,
html.a11y-mode button,
html.a11y-mode [role="button"] {
  border-color: #ffe66d !important;
  background: #ffe66d !important;
  color: #000 !important;
  text-decoration: none !important;
}

html.a11y-mode .btn *,
html.a11y-mode button *,
html.a11y-mode [role="button"] * {
  color: #000 !important;
}

html.a11y-mode .btn:hover,
html.a11y-mode .btn:focus-visible,
html.a11y-mode button:hover,
html.a11y-mode button:focus-visible,
html.a11y-mode [role="button"]:hover,
html.a11y-mode [role="button"]:focus-visible {
  border-color: #ffe66d !important;
  background: #ffe66d !important;
  color: #000 !important;
}

html.a11y-mode .btn:hover *,
html.a11y-mode .btn:focus-visible *,
html.a11y-mode button:hover *,
html.a11y-mode button:focus-visible *,
html.a11y-mode [role="button"]:hover *,
html.a11y-mode [role="button"]:focus-visible * {
  color: #000 !important;
}

html.a11y-mode .a11y-toggle:not(.is-active) {
  border-color: #fff !important;
  background: #000 !important;
  color: #fff !important;
}

html.a11y-mode .a11y-toggle:not(.is-active) * {
  color: #fff !important;
}

html.a11y-mode .search-chip:not(.is-active),
html.a11y-mode .category-chip:not(.is-active) {
  border-color: #fff !important;
  background: #000 !important;
  color: #fff !important;
}

html.a11y-mode .search-chip:not(.is-active) *,
html.a11y-mode .category-chip:not(.is-active) * {
  color: #fff !important;
}

@media (max-width: 1399px) {
  html.a11y-mode .utility-bar__services,
  html.a11y-mode .utility-bar__sveden {
    display: none !important;
  }

  html.a11y-mode .utility-bar__inner {
    justify-content: flex-end !important;
  }
}

@media (max-width: 1699px) {
  html.a11y-mode .header-main {
    flex-wrap: wrap !important;
  }

  html.a11y-mode .main-nav {
    flex: 1 1 100% !important;
    order: 3;
  }

  html.a11y-mode .main-nav ul {
    justify-content: flex-start !important;
    flex-wrap: wrap !important;
  }
}
`
  if (!existing) document.head.appendChild(style)
}

onMounted(() => {
  store.init()
  applyA11yOverrides()
})

watch(
  () => store.accessibility,
  () => applyA11yOverrides()
)
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#C58A1A" :height="3" />
    <SkipLink />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <CookieConsent />
  </div>
</template>
