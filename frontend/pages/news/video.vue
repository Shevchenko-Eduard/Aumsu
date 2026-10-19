<script setup lang="ts">
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/news/video')

if (!page) {
  throw createError({
    statusCode: 404,
    statusMessage: locale === 'en' ? 'Page not found' : 'Страница не найдена',
    fatal: true
  })
}

usePageSeo({
  title: page.seo.title,
  description: page.seo.description,
  path: locale === 'en' ? '/en/news/video' : '/news/video',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page.title"
      :summary="page.summary"
      :eyebrow="locale === 'en' ? 'News' : 'Новости'"
    >
      <template #actions>
        <BaseButton :to="localePath('/news')" variant="secondary">
          {{ locale === 'en' ? 'All news' : 'Все новости' }}
        </BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container">
        <ContentRenderer :blocks="page.body" />
      </div>
    </section>
  </div>
</template>
