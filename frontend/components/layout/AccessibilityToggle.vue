<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })

const store = useUiStore()
const { t } = useI18n()

const label = computed(() => (store.accessibility ? t('a11y.disable') : t('a11y.enable')))
</script>

<template>
  <button
    type="button"
    class="a11y-toggle"
    :class="[`a11y-toggle--${tone}`, { 'is-active': store.accessibility }]"
    :aria-pressed="store.accessibility"
    :aria-label="label"
    :title="label"
    @click="store.toggleAccessibility()"
  >
    <i class="pi pi-eye" aria-hidden="true" />
    <span class="a11y-toggle__text">{{ t('a11y.version') }}</span>
  </button>
</template>

<style scoped>
.a11y-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: var(--radius-pill);
  background: transparent;
  color: rgba(255, 255, 255, 0.88);
  font: inherit;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
}

.a11y-toggle:hover,
.a11y-toggle.is-active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.a11y-toggle--dark {
  border-color: var(--color-border-strong);
  color: var(--color-text-muted);
}

.a11y-toggle--dark:hover,
.a11y-toggle--dark.is-active {
  background: var(--color-primary-100);
  color: var(--color-primary-900);
}

.a11y-toggle__text {
  display: none;
}

@media (min-width: 1180px) {
  .a11y-toggle__text {
    display: inline;
  }
}
</style>
