<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()

const is404 = computed(() => props.error.statusCode === 404)
const title = computed(() => (is404.value ? t('error.404') : t('error.500')))
const message = computed(() => (is404.value ? t('error.404Text') : t('error.500Text')))

useHead({
  title: `${title.value} — ${t('site.name')}`,
  htmlAttrs: { lang: locale === 'en' ? 'en' : 'ru' }
})

function goHome() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <NuxtLayout>
    <section class="error-page">
      <div class="container error-page__inner">
        <p class="error-page__code" aria-hidden="true">{{ error.statusCode || 500 }}</p>
        <h1>{{ title }}</h1>
        <p class="error-page__text">{{ message }}</p>
        <div class="error-page__actions">
          <BaseButton @click="goHome">{{ t('error.home') }}</BaseButton>
          <BaseButton :to="localePath('/search')" variant="secondary">{{ t('error.search') }}</BaseButton>
        </div>

        <div class="error-page__popular">
          <h2>{{ t('error.popular') }}</h2>
          <div class="pill-list">
            <NuxtLink :to="localePath('/admissions')" class="badge">{{ locale === 'en' ? 'Admissions' : 'Поступление' }}</NuxtLink>
            <NuxtLink :to="localePath('/education/programs')" class="badge">{{ locale === 'en' ? 'Programmes' : 'Программы' }}</NuxtLink>
            <NuxtLink :to="localePath('/news')" class="badge">{{ locale === 'en' ? 'News' : 'Новости' }}</NuxtLink>
            <NuxtLink :to="localePath('/contacts')" class="badge">{{ locale === 'en' ? 'Contacts' : 'Контакты' }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.error-page {
  display: flex;
  min-height: 60vh;
  align-items: center;
  padding-block: var(--space-8);
}

.error-page__inner {
  max-width: 760px;
  text-align: center;
}

.error-page__code {
  margin: 0;
  color: var(--color-accent-600);
  font-family: var(--font-display);
  font-size: clamp(5rem, 12vw, 10rem);
  font-weight: 700;
  line-height: 0.9;
}

.error-page h1 {
  margin-top: var(--space-4);
}

.error-page__text {
  margin-inline: auto;
  max-width: 560px;
  color: var(--color-text-muted);
}

.error-page__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: var(--space-5);
}

.error-page__popular {
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.error-page__popular h2 {
  font-family: var(--font-sans);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.error-page__popular .pill-list {
  justify-content: center;
}

.error-page__popular .badge {
  text-decoration: none;
}
</style>
