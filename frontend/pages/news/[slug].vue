<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const route = useRoute()

const article = getNewsItem(locale, String(route.params.slug))

if (!article) {
  throw createError({
    statusCode: 404,
    statusMessage: locale === 'en' ? 'News not found' : 'Новость не найдена',
    fatal: true
  })
}

const categories = getNewsCategories(locale)
const category = categories.find((item) => article.categoryIds.includes(item.id))
const related = getNews(locale)
  .filter((item) => item.id !== article.id)
  .slice(0, 3)

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(value))
    : ''

usePageSeo({
  title: article.seo.title,
  description: article.seo.description,
  path: locale === 'en' ? `/en/news/${article.slug}` : `/news/${article.slug}`,
  jsonLd: [
    breadcrumbJsonLd(useBreadcrumbs(article.title)),
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.summary,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: { '@type': 'Organization', name: 'ГМУ им. адм. Ф.Ф. Ушакова' },
      publisher: { '@type': 'Organization', name: 'ГМУ им. адм. Ф.Ф. Ушакова' },
      mainEntityOfPage: `${useRuntimeConfig().public.siteUrl}${locale === 'en' ? '/en' : ''}/news/${article.slug}`
    }
  ]
})
</script>

<template>
  <div>
    <article class="article">
      <div class="container article__container">
        <AppBreadcrumbs :current="article.title" />
        <header class="article__header">
          <span v-if="category" class="badge badge--accent">{{ category.title }}</span>
          <h1>{{ article.title }}</h1>
          <p class="article__summary">{{ article.summary }}</p>
          <div class="article__meta">
            <time :datetime="article.publishedAt">
              <i class="pi pi-calendar" aria-hidden="true" />
              {{ formatDate(article.publishedAt) }}
            </time>
            <span v-if="article.location"><i class="pi pi-map-marker" aria-hidden="true" /> {{ article.location }}</span>
          </div>
        </header>

        <div class="article__body">
          <ContentRenderer :blocks="article.body" />
        </div>

        <footer class="article__footer">
          <NuxtLink :to="localePath('/news')" class="link-arrow">{{ locale === 'en' ? 'All news' : 'Все новости' }}</NuxtLink>
        </footer>
      </div>
    </article>

    <section class="section section--subtle">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'More news' : 'Ещё новости' }}</p>
            <h2>{{ locale === 'en' ? 'Read next' : 'Читайте также' }}</h2>
          </div>
          <BaseButton :to="localePath('/news')" variant="secondary" size="sm">{{ t('home.allNews') }}</BaseButton>
        </div>
        <div class="grid grid--3">
          <NewsCard v-for="item in related" :key="item.id" :article="item" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.article {
  padding-block: var(--space-6) 0;
}

.article__container {
  max-width: 960px;
}

.article__header {
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.article__header h1 {
  max-width: 860px;
  margin-top: var(--space-3);
  font-size: clamp(2rem, 1.5rem + 2.2vw, 3rem);
}

.article__summary {
  max-width: 760px;
  color: var(--color-text-muted);
  font-size: 1.08rem;
}

.article__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: var(--space-4);
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.article__meta time,
.article__meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.article__body {
  max-width: 800px;
  padding-block: var(--space-6);
}

.article__footer {
  padding-block: var(--space-4) var(--space-7);
  border-top: 1px solid var(--color-border);
}
</style>
