<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/news')
const news = getNews(locale)
const categories = getNewsCategories(locale)
const activeCategory = ref('all')
const query = ref('')
const visibleCount = ref(9)

const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  return news.filter((article) => {
    const matchesQuery = !normalized || article.title.toLowerCase().includes(normalized) || article.summary.toLowerCase().includes(normalized)
    const matchesCategory = activeCategory.value === 'all' || article.categoryIds.includes(activeCategory.value)
    return matchesQuery && matchesCategory
  })
})

const visible = computed(() => filtered.value.slice(0, visibleCount.value))

watch([activeCategory, query], () => {
  visibleCount.value = 9
})

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'News' : 'Новости'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/news' : '/news',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'News' : 'Новости')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'University life' : 'Жизнь университета'"
      variant="navy"
    >
      <template #actions>
        <BaseButton :to="localePath('/news/archive')" variant="light">
          {{ locale === 'en' ? 'News archive' : 'Архив новостей' }}
        </BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container">
        <div class="news-toolbar">
          <div class="news-categories" role="group" :aria-label="locale === 'en' ? 'News categories' : 'Категории новостей'">
            <button
              type="button"
              class="category-chip"
              :class="{ 'is-active': activeCategory === 'all' }"
              :aria-pressed="activeCategory === 'all'"
              @click="activeCategory = 'all'"
            >
              {{ t('common.all') }}
            </button>
            <button
              v-for="category in categories"
              :key="category.id"
              type="button"
              class="category-chip"
              :class="{ 'is-active': activeCategory === category.id }"
              :aria-pressed="activeCategory === category.id"
              @click="activeCategory = category.id"
            >
              {{ category.title }}
            </button>
          </div>
          <div class="form-field news-search">
            <label for="news-query">{{ locale === 'en' ? 'Search news' : 'Поиск по новостям' }}</label>
            <input id="news-query" v-model="query" class="input" type="search" />
          </div>
        </div>

        <p class="news-count" role="status">{{ locale === 'en' ? `Materials: ${filtered.length}` : `Материалов: ${filtered.length}` }}</p>

        <div v-if="visible.length" class="grid grid--3">
          <NewsCard v-for="article in visible" :key="article.id" :article="article" />
        </div>
        <div v-else class="empty-state">
          <p>{{ t('common.noResults') }}</p>
          <p class="muted">{{ t('common.tryAnother') }}</p>
        </div>

        <div v-if="visibleCount < filtered.length" class="news-more">
          <BaseButton variant="secondary" @click="visibleCount += 9">{{ t('common.showMore') }}</BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.news-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.news-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-chip {
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--color-text-muted);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.category-chip:hover {
  border-color: var(--color-primary-200);
  color: var(--color-primary-700);
}

.category-chip.is-active {
  border-color: var(--color-primary-900);
  background: var(--color-primary-900);
  color: #fff;
}

.news-search {
  width: min(100%, 300px);
  margin: 0;
}

.news-count {
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.news-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}

.empty-state {
  padding: var(--space-8);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-state p {
  margin: 0 0 6px;
}
</style>
