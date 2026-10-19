<script setup lang="ts">
const locale = useLocale()
const localePath = useLocalePath()
const route = useRoute()

const journal = getJournal(locale, String(route.params.slug))

if (!journal) {
  throw createError({
    statusCode: 404,
    statusMessage: locale === 'en' ? 'Journal not found' : 'Журнал не найден',
    fatal: true
  })
}

usePageSeo({
  title: journal.seo.title,
  description: journal.seo.description,
  path: locale === 'en' ? `/en/science/journals/${journal.slug}` : `/science/journals/${journal.slug}`,
  jsonLd: [
    breadcrumbJsonLd(useBreadcrumbs(journal.title)),
    {
      '@context': 'https://schema.org',
      '@type': 'Periodical',
      name: journal.title,
      issn: journal.issn,
      publisher: { '@type': 'Organization', name: 'ГМУ им. адм. Ф.Ф. Ушакова' }
    }
  ]
})
</script>

<template>
  <div>
    <PageHeader :title="journal.title" :summary="journal.seo.description" :eyebrow="journal.issn || 'ISSN'" />

    <section class="section">
      <div class="container journal-layout">
        <div>
          <h2>{{ locale === 'en' ? 'About the journal' : 'О журнале' }}</h2>
          <ContentRenderer :blocks="journal.description" />

          <h2 class="journal-subtitle">{{ locale === 'en' ? 'Issues' : 'Выпуски' }}</h2>
          <ul v-if="journal.issues?.length" class="issue-list">
            <li v-for="issue in journal.issues" :key="`${issue.year}-${issue.number}`">
              <span class="issue-list__year">{{ issue.year }}</span>
              <span class="issue-list__title">{{ issue.title }}</span>
              <span class="badge">{{ locale === 'en' ? 'PDF' : 'PDF' }}</span>
            </li>
          </ul>
          <p v-else class="muted">{{ locale === 'en' ? 'Issues will appear here.' : 'Выпуски появятся здесь.' }}</p>
        </div>

        <aside class="journal-aside">
          <div class="aside-card">
            <h2>{{ locale === 'en' ? 'For authors' : 'Авторам' }}</h2>
            <ul>
              <li>{{ locale === 'en' ? 'Submission rules' : 'Правила направления' }}</li>
              <li>{{ locale === 'en' ? 'Peer review' : 'Рецензирование' }}</li>
              <li>{{ locale === 'en' ? 'Publication ethics' : 'Этика публикаций' }}</li>
              <li>{{ locale === 'en' ? 'Editorial board' : 'Редколлегия' }}</li>
            </ul>
            <BaseButton :to="localePath('/science/publications')" variant="secondary" size="sm">
              {{ locale === 'en' ? 'Publication requirements' : 'Требования к публикациям' }}
            </BaseButton>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.journal-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: var(--space-7);
  align-items: start;
}

.journal-subtitle {
  margin-top: var(--space-6);
}

.issue-list {
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--color-border);
  list-style: none;
}

.issue-list li {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  padding: 14px 4px;
  border-bottom: 1px solid var(--color-border);
}

.issue-list__year {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.issue-list__title {
  font-weight: 600;
}

.issue-list .badge {
  margin-left: auto;
}

.journal-aside {
  position: sticky;
  top: 130px;
}

.aside-card {
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.aside-card h2 {
  font-family: var(--font-sans);
  font-size: 1rem;
}

.aside-card ul {
  padding-left: 1.1rem;
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

@media (max-width: 1023px) {
  .journal-layout {
    grid-template-columns: 1fr;
  }

  .journal-aside {
    position: static;
  }
}
</style>
