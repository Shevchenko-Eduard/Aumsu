<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/admissions/faq')
const faq = getFaq(locale)
const query = ref('')

const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  if (!normalized) return faq
  return faq.filter((item) => item.question.toLowerCase().includes(normalized) || JSON.stringify(item.answer).toLowerCase().includes(normalized))
})

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Admissions FAQ' : 'Частые вопросы о поступлении'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/admissions/faq' : '/admissions/faq',
  jsonLd: [
    breadcrumbJsonLd(useBreadcrumbs(page?.title)),
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer.map((block) => ('text' in block ? block.text : '')).join(' ')
        }
      }))
    }
  ]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Frequently asked questions' : 'Частые вопросы')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Admissions' : 'Поступление'"
    />

    <section class="section">
      <div class="container faq-layout">
        <div>
          <div class="faq-search form-field">
            <label for="faq-query">{{ locale === 'en' ? 'Search questions' : 'Поиск по вопросам' }}</label>
            <input id="faq-query" v-model="query" class="input" type="search" :placeholder="locale === 'en' ? 'For example: documents' : 'Например: документы'" />
          </div>

          <p class="faq-count" role="status">
            {{ locale === 'en' ? `Questions: ${filtered.length}` : `Вопросов: ${filtered.length}` }}
          </p>

          <div v-if="filtered.length" class="faq-list">
            <details v-for="item in filtered" :key="item.id" class="faq-item">
              <summary>{{ item.question }}</summary>
              <div class="faq-item__answer">
                <ContentRenderer :blocks="item.answer" />
              </div>
            </details>
          </div>
          <div v-else class="empty-state">
            <p>{{ t('common.noResults') }}</p>
            <p class="muted">{{ t('common.tryAnother') }}</p>
          </div>
        </div>

        <aside class="faq-aside">
          <h2>{{ locale === 'en' ? 'Did not find an answer?' : 'Не нашли ответ?' }}</h2>
          <p>
            {{
              locale === 'en'
                ? 'Contact the admissions office — we will answer your question personally.'
                : 'Свяжитесь с приёмной комиссией — ответим на ваш вопрос лично.'
            }}
          </p>
          <a href="tel:+78617717525" class="faq-aside__phone">+7 (8617) 71-75-25</a>
          <a href="mailto:pcom@nsma.ru">pcom@nsma.ru</a>
          <BaseButton :to="localePath('/contacts/feedback')" variant="secondary" size="sm">
            {{ locale === 'en' ? 'Write to us' : 'Написать нам' }}
          </BaseButton>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.faq-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-7);
  align-items: start;
}

.faq-search {
  max-width: 620px;
}

.faq-count {
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.faq-list {
  border-top: 1px solid var(--color-border);
}

.faq-item {
  border-bottom: 1px solid var(--color-border);
}

.faq-item summary {
  padding: 18px 4px;
  color: var(--color-primary-900);
  font-weight: 700;
  cursor: pointer;
}

.faq-item summary::marker {
  color: var(--color-accent-600);
}

.faq-item__answer {
  padding: 0 4px 18px;
}

.faq-aside {
  position: sticky;
  top: 130px;
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-primary-900);
  color: rgba(255, 255, 255, 0.8);
}

.faq-aside h2 {
  color: #fff;
  font-family: var(--font-sans);
  font-size: 1.1rem;
}

.faq-aside p {
  font-size: 0.86rem;
}

.faq-aside a {
  display: block;
  margin-bottom: 6px;
  color: #fff;
  font-weight: 700;
}

.faq-aside__phone {
  font-size: 1.15rem;
}

.faq-aside :deep(.btn--secondary) {
  margin-top: var(--space-3);
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.empty-state {
  padding: var(--space-6);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-state p {
  margin: 0 0 4px;
}

@media (max-width: 1023px) {
  .faq-layout {
    grid-template-columns: 1fr;
  }

  .faq-aside {
    position: static;
  }
}
</style>
