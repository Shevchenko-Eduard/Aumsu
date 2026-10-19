<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const store = useUiStore()
const hydrated = ref(false)

onMounted(() => {
  hydrated.value = true
})

function choose(choice: 'all' | 'necessary') {
  store.setCookieConsent(choice)
}
</script>

<template>
  <div
    v-if="hydrated && !store.cookieConsent"
    class="cookie"
    role="region"
    :aria-label="t('cookie.title')"
  >
    <div class="cookie__body">
      <p class="cookie__title">{{ t('cookie.title') }}</p>
      <p class="cookie__text">{{ t('cookie.text') }}</p>
      <NuxtLink :to="localePath('/privacy')" class="cookie__link">{{ t('cookie.more') }}</NuxtLink>
    </div>
    <div class="cookie__actions">
      <BaseButton size="sm" variant="navy" @click="choose('all')">{{ t('cookie.accept') }}</BaseButton>
      <BaseButton size="sm" variant="ghost" @click="choose('necessary')">{{ t('cookie.decline') }}</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.cookie {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 150;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: min(480px, calc(100vw - 32px));
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: var(--shadow-lg);
}

.cookie__body {
  max-width: 560px;
}

.cookie__title {
  margin: 0 0 4px;
  color: var(--color-primary-900);
  font-weight: 800;
}

.cookie__text {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.cookie__link {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.78rem;
}

.cookie__actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 639px) {
  .cookie {
    right: 8px;
    bottom: 8px;
    width: calc(100vw - 16px);
    padding: var(--space-4);
  }

  .cookie__actions {
    width: 100%;
  }

  .cookie__actions :deep(.btn) {
    flex: 1;
  }
}
</style>
