<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const { query, type, visibleResults, availableTypes, loading, mode } = useSiteSearch()

useHead({ bodyAttrs: { 'data-pagefind-ignore': 'true' } })

usePageSeo({
  title: locale === 'en' ? 'Search' : 'Поиск по сайту',
  description: locale === 'en' ? 'Search pages, programmes, news, staff and documents.' : 'Поиск по страницам, программам, новостям, сотрудникам и документам.',
  path: locale === 'en' ? '/en/search' : '/search',
  noindex: true
})

function typeLabel(value: string) {
  return value === 'all' ? t('search.allTypes') : t(`search.types.${value}`)
}

function isExternal(url: string) {
  return url.startsWith('http')
}
</script>

<template>
  <div>
    <PageHeader
      :title="t('search.title')"
      :summary="t('search.hint')"
      :eyebrow="locale === 'en' ? 'Site search' : 'Поиск по сайту'"
    />

    <section class="section">
      <div class="container search-layout">
        <div class="search-main">
          <div class="search-field">
            <label for="site-search" class="visually-hidden">{{ t('search.title') }}</label>
            <i class="pi pi-search search-field__icon" aria-hidden="true" />
            <input
              id="site-search"
              v-model="query"
              class="search-field__input"
              type="search"
              :placeholder="t('search.placeholder')"
              autocomplete="off"
              autofocus
            />
            <span v-if="loading" class="search-field__loading">{{ t('common.loading') }}</span>
          </div>

          <div class="search-modes">
            <span class="badge" :class="{ 'badge--success': mode === 'pagefind' }">
              {{ mode === 'pagefind' ? 'Pagefind' : t('common.demo') }}
            </span>
            <span class="small muted">{{ mode === 'pagefind' ? t('search.pagefind') : t('search.local') }}</span>
          </div>

          <div v-if="query.trim()" class="search-types" role="group" :aria-label="t('search.type')">
            <button
              v-for="item in availableTypes"
              :key="item"
              type="button"
              class="search-chip"
              :class="{ 'is-active': type === item }"
              :aria-pressed="type === item"
              @click="type = item"
            >
              {{ typeLabel(item) }}
            </button>
          </div>

          <div v-if="query.trim()" class="search-summary" role="status">
            {{ t('search.found') }}: {{ visibleResults.length }}
          </div>

          <ul v-if="visibleResults.length" class="search-results">
            <li v-for="item in visibleResults" :key="item.id" class="search-result">
              <div class="search-result__head">
                <span class="badge">{{ typeLabel(item.type) }}</span>
                <span v-if="item.date" class="small muted">{{ item.date }}</span>
              </div>
              <a
                :href="item.url"
                class="search-result__title"
                :target="isExternal(item.url) ? '_blank' : undefined"
                :rel="isExternal(item.url) ? 'noopener noreferrer' : undefined"
              >
                {{ item.title }}
                <i v-if="isExternal(item.url)" class="pi pi-external-link" aria-hidden="true" />
              </a>
              <p class="search-result__excerpt">{{ item.excerpt }}</p>
            </li>
          </ul>

          <div v-else-if="query.trim()" class="search-empty">
            <i class="pi pi-search" aria-hidden="true" />
            <h2>{{ t('search.nothing') }}</h2>
            <p class="muted">{{ t('search.nothingHint') }}</p>
            <BaseButton :to="localePath('/sitemap')" variant="secondary" size="sm">{{ t('footer.sitemap') }}</BaseButton>
          </div>

          <div v-else class="search-empty">
            <i class="pi pi-compass" aria-hidden="true" />
            <h2>{{ t('search.emptyQuery') }}</h2>
            <p class="muted">
              {{ locale === 'en' ? 'Try “admissions”, “navigation” or “scholarships”.' : 'Попробуйте «поступление», «судовождение» или «стипендии».' }}
            </p>
            <div class="search-suggestions">
              <NuxtLink :to="localePath('/admissions')" class="badge">{{ locale === 'en' ? 'Admissions' : 'Поступление' }}</NuxtLink>
              <NuxtLink :to="localePath('/education/programs')" class="badge">{{ locale === 'en' ? 'Programmes' : 'Программы' }}</NuxtLink>
              <NuxtLink :to="localePath('/contacts')" class="badge">{{ locale === 'en' ? 'Contacts' : 'Контакты' }}</NuxtLink>
            </div>
          </div>
        </div>

        <aside class="search-aside">
          <h2>{{ t('error.popular') }}</h2>
          <NuxtLink :to="localePath('/admissions')">{{ locale === 'en' ? 'Admissions' : 'Поступление' }}</NuxtLink>
          <NuxtLink :to="localePath('/education/programs')">{{ locale === 'en' ? 'Programmes' : 'Программы' }}</NuxtLink>
          <NuxtLink :to="localePath('/news')">{{ locale === 'en' ? 'News' : 'Новости' }}</NuxtLink>
          <NuxtLink :to="localePath('/contacts')">{{ locale === 'en' ? 'Contacts' : 'Контакты' }}</NuxtLink>
          <NuxtLink :to="localePath('/sveden')">{{ t('footer.sveden') }}</NuxtLink>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.search-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: var(--space-7);
  align-items: start;
}

.search-field {
  position: relative;
  display: flex;
  align-items: center;
}

.search-field__icon {
  position: absolute;
  left: 18px;
  color: var(--color-text-muted);
}

.search-field__input {
  width: 100%;
  min-height: 60px;
  padding: 14px 130px 14px 48px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  background: #fff;
  color: var(--color-text);
  font: inherit;
  font-size: 1.05rem;
}

.search-field__input:focus {
  border-color: var(--color-primary-500);
  outline: 3px solid rgba(242, 183, 5, 0.5);
  outline-offset: 1px;
}

.search-field__loading {
  position: absolute;
  right: 18px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.search-modes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.search-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: var(--space-5);
}

.search-chip {
  min-height: 38px;
  padding: 7px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--color-text-muted);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.search-chip:hover {
  border-color: var(--color-primary-200);
  color: var(--color-primary-700);
}

.search-chip.is-active {
  border-color: var(--color-primary-900);
  background: var(--color-primary-900);
  color: #fff;
}

.search-summary {
  margin-top: var(--space-5);
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.search-results {
  margin: var(--space-3) 0 0;
  padding: 0;
  border-top: 1px solid var(--color-border);
  list-style: none;
}

.search-result {
  margin: 0;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
}

.search-result__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search-result__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  text-decoration: none;
}

.search-result__title:hover {
  color: var(--color-primary-700);
  text-decoration: underline;
}

.search-result__title .pi {
  font-size: 0.72rem;
}

.search-result__excerpt {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.search-empty {
  margin-top: var(--space-6);
  padding: var(--space-8) var(--space-5);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}

.search-empty > .pi {
  margin-bottom: var(--space-3);
  color: var(--color-border-strong);
  font-size: 2rem;
}

.search-empty h2 {
  font-family: var(--font-sans);
  font-size: 1.1rem;
}

.search-empty p {
  margin-inline: auto;
  max-width: 520px;
}

.search-suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: var(--space-4);
}

.search-aside {
  position: sticky;
  top: 130px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.search-aside h2 {
  font-family: var(--font-sans);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.search-aside a {
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.86rem;
  text-decoration: none;
}

.search-aside a:hover {
  color: var(--color-primary-700);
}

@media (max-width: 1023px) {
  .search-layout {
    grid-template-columns: 1fr;
  }

  .search-aside {
    position: static;
  }
}
</style>
