<script setup lang="ts">
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/science/journals')
const journals = getJournals(locale)

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'University journals' : 'Издания университета'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/science/journals' : '/science/journals',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'University journals' : 'Издания университета')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Research' : 'Наука'"
    />

    <section class="section">
      <div class="container">
        <div class="grid grid--2">
          <NuxtLink v-for="journal in journals" :key="journal.id" :to="localePath(`/science/journals/${journal.slug}`)" class="journal-card">
            <span class="badge">{{ journal.issn || 'ISSN' }}</span>
            <h2>{{ journal.title }}</h2>
            <p>{{ journal.description[0] && 'text' in journal.description[0] ? journal.description[0].text : '' }}</p>
            <div class="journal-card__footer">
              <span>{{ locale === 'en' ? 'Issues' : 'Выпуски' }}: {{ journal.issues?.length || 0 }}</span>
              <span class="link-arrow">{{ locale === 'en' ? 'Open' : 'Открыть' }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.journal-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  color: var(--color-text);
  text-decoration: none;
}

.journal-card:hover {
  border-color: var(--color-primary-200);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
}

.journal-card h2 {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 1.2rem;
}

.journal-card p {
  margin: 0;
  color: var(--color-text-muted);
}

.journal-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.82rem;
}
</style>
