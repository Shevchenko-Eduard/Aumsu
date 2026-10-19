<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const page = getPage(locale, '/news/archive')
const news = getNews(locale)

const byYear = computed(() => {
  const groups = new Map<number, typeof news>()
  for (const article of news) {
    const year = new Date(article.publishedAt || article.createdAt).getFullYear()
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)?.push(article)
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0])
})

useHead({ bodyAttrs: { 'data-pagefind-ignore': 'true' } })

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'News archive' : 'Архив новостей'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/news/archive' : '/news/archive',
  noindex: true,
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'News archive' : 'Архив новостей')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Archive' : 'Архив'"
    />

    <section class="section">
      <div class="container">
        <div class="archive-note">
          <i class="pi pi-info-circle" aria-hidden="true" />
          <p>
            {{
              locale === 'en'
                ? 'Archived materials are kept for reference. They are not indexed by search engines and may contain outdated information.'
                : 'Материалы архива сохранены для справки. Они не индексируются поисковыми системами и могут содержать устаревшую информацию.'
            }}
          </p>
        </div>

        <div v-for="[year, articles] in byYear" :key="year" class="archive-year">
          <h2>{{ year }}</h2>
          <div class="grid grid--3">
            <NewsCard v-for="article in articles" :key="article.id" :article="article" />
          </div>
        </div>

        <div v-if="!byYear.length" class="empty-state">
          <p>{{ t('common.noResults') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.archive-note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
}

.archive-note p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

.archive-year {
  margin-bottom: var(--space-7);
}

.archive-year h2 {
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.empty-state {
  padding: var(--space-8);
  text-align: center;
}
</style>
