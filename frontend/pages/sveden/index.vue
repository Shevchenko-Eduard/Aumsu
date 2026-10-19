<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/sveden')
const sections = getSveden(locale)

usePageSeo({
  title: page?.seo.title || t('sveden.title'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/sveden' : '/sveden',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || t('sveden.title')"
      :summary="page?.summary"
      :eyebrow="t('sveden.official')"
    />

    <section class="section">
      <div class="container">
        <div class="sveden-notice">
          <i class="pi pi-verified" aria-hidden="true" />
          <p>
            {{
              locale === 'en'
                ? 'This section contains mandatory information about the educational organisation in accordance with Russian legislation. URLs and microdata are preserved.'
                : 'В разделе опубликована обязательная к раскрытию информация об образовательной организации в соответствии с законодательством Российской Федерации. URL и microdata сохраняются.'
            }}
          </p>
        </div>

        <h2>{{ t('sveden.navTitle') }}</h2>
        <div class="grid grid--3">
          <NuxtLink v-for="item in sections" :key="item.id" :to="localePath(`/sveden/${item.slug}`)" class="sveden-card">
            <span>{{ item.title }}</span>
            <i class="pi pi-arrow-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sveden-notice {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  padding: var(--space-4) var(--space-5);
  border-left: 4px solid var(--color-success);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: var(--color-success-bg);
}

.sveden-notice p {
  margin: 0;
  font-size: 0.88rem;
}

.sveden-notice .pi {
  margin-top: 2px;
  color: var(--color-success);
}

.sveden-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 64px;
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--color-primary-900);
  font-weight: 650;
  text-decoration: none;
}

.sveden-card:hover {
  border-color: var(--color-primary-200);
  background: var(--color-primary-50);
}

.sveden-card .pi {
  color: var(--color-border-strong);
  font-size: 0.78rem;
}
</style>
