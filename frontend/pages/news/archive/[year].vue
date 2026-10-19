<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const route = useRoute()
const year = Number(route.params.year)

const articles = getNews(locale).filter(
  (article) => new Date(article.publishedAt || article.createdAt).getFullYear() === year
)

useHead({ bodyAttrs: { 'data-pagefind-ignore': 'true' } })

usePageSeo({
  title: locale === 'en' ? `News archive — ${year}` : `Архив новостей — ${year}`,
  description: locale === 'en' ? `University news from ${year}.` : `Новости университета за ${year} год.`,
  path: locale === 'en' ? `/en/news/archive/${year}` : `/news/archive/${year}`,
  noindex: true,
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(String(year)))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="locale === 'en' ? `News archive — ${year}` : `Архив новостей — ${year}`"
      :summary="locale === 'en' ? `Materials published in ${year}.` : `Материалы, опубликованные в ${year} году.`"
      :eyebrow="t('footer.sitemap')"
    />

    <section class="section">
      <div class="container">
        <div class="archive-head">
          <p class="muted">
            {{
              locale === 'en'
                ? 'Archived materials are not indexed and may contain outdated information.'
                : 'Материалы архива не индексируются и могут содержать устаревшую информацию.'
            }}
          </p>
          <BaseButton :to="localePath('/news/archive')" variant="secondary" size="sm">
            {{ locale === 'en' ? 'All archive' : 'Весь архив' }}
          </BaseButton>
        </div>

        <div v-if="articles.length" class="grid grid--3">
          <NewsCard v-for="article in articles" :key="article.id" :article="article" />
        </div>
        <div v-else class="empty-state">
          <p>{{ t('common.noResults') }}</p>
          <BaseButton :to="localePath('/news/archive')" variant="secondary" size="sm">{{ t('common.back') }}</BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.archive-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.archive-head p {
  margin: 0;
  max-width: 700px;
  font-size: 0.86rem;
}

.empty-state {
  padding: var(--space-8);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}
</style>
