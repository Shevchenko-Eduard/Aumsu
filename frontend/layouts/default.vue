<script setup lang="ts">
const { locale } = useI18n()
</script>

<template>
  <div :key="locale" class="app-shell">
    <AppHeader />
    <main id="main-content" tabindex="-1" data-pagefind-body>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

main {
  flex: 1 0 auto;
}

main:focus {
  outline: none;
}
</style>
