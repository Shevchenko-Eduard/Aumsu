<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })

const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const items = computed(() => [
  { code: 'ru' as const, label: 'RU', title: 'Русский' },
  { code: 'en' as const, label: 'EN', title: 'English' }
])
</script>

<template>
  <div class="language-switcher" :class="`language-switcher--${tone}`" role="group" :aria-label="$t('language.switch')">
    <NuxtLink
      v-for="item in items"
      :key="item.code"
      :to="switchLocalePath(item.code)"
      class="language-switcher__link"
      :class="{ 'is-active': locale === item.code }"
      :aria-current="locale === item.code ? 'true' : undefined"
      :lang="item.code"
    >
      {{ item.label }}
      <span class="visually-hidden">{{ item.title }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: var(--radius-pill);
}

.language-switcher__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  min-height: 26px;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-decoration: none;
}

.language-switcher__link:hover {
  color: #fff;
}

.language-switcher__link.is-active {
  background: #fff;
  color: var(--color-primary-900);
}

.language-switcher--dark {
  border-color: var(--color-border-strong);
}

.language-switcher--dark .language-switcher__link {
  color: var(--color-text-muted);
}

.language-switcher--dark .language-switcher__link:hover {
  color: var(--color-primary-900);
}

.language-switcher--dark .language-switcher__link.is-active {
  background: var(--color-primary-900);
  color: #fff;
}
</style>
