<script setup lang="ts">
const locale = useLocale()
const route = useRoute()
const localePath = useLocalePath()

const page = getPage(locale, route.path)

if (!page) {
  throw createError({
    statusCode: 404,
    statusMessage: locale === 'en' ? 'Page not found' : 'Страница не найдена',
    fatal: true
  })
}

usePageSeo({
  title: page.seo?.title || page.title,
  description: page.seo?.description || page.summary || page.title,
  path: route.path,
  noindex: page.seo?.noindex,
  jsonLd: [
    breadcrumbJsonLd(useBreadcrumbs(page.title)),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description: page.summary || page.seo?.description
    }
  ]
})
</script>

<template>
  <div v-if="page">
    <PageHeader :title="page.title" :summary="page.summary" :eyebrow="page.subtitle" />
    <section class="section">
      <div class="container page-layout">
        <div>
          <ContentRenderer :blocks="page.body" />

          <div v-if="page.path === '/about/documents'" class="page-extra">
            <DocumentList />
          </div>

          <div v-if="page.path === '/contacts/feedback'" class="page-extra">
            <ContactForm />
          </div>
        </div>
        <aside class="page-aside">
          <div class="aside-card">
            <h2>{{ locale === 'en' ? 'Need help?' : 'Нужна помощь?' }}</h2>
            <p>
              {{
                locale === 'en'
                  ? 'Contact the admissions office or the relevant department — we will help you find the information you need.'
                  : 'Свяжитесь с приёмной комиссией или профильным подразделением — поможем найти нужную информацию.'
              }}
            </p>
            <NuxtLink :to="localePath('/contacts')" class="link-arrow">{{ $t('common.contacts') }}</NuxtLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: var(--space-7);
  align-items: start;
}

.page-aside {
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
  font-size: 1.05rem;
}

.aside-card p {
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

.page-extra {
  margin-top: var(--space-7);
}

@media (max-width: 1023px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .page-aside {
    position: static;
  }
}
</style>
