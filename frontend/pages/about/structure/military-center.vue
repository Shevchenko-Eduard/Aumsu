<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/about/structure/military-center')
const unit = getOrgUnits(locale).find((item) => item.type === 'military-center')

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
  path: locale === 'en' ? '/en/about/structure/military-center' : '/about/structure/military-center',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page.title"
      :summary="page.summary"
      :eyebrow="locale === 'en' ? 'University structure' : 'Структура университета'"
    >
      <template #actions>
        <BaseButton :to="localePath('/about/structure')" variant="secondary">
          {{ locale === 'en' ? 'All structure' : 'Вся структура' }}
        </BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container military-layout">
        <div>
          <ContentRenderer :blocks="page.body" />
        </div>

        <aside v-if="unit" class="military-aside">
          <div class="aside-card">
            <h2>{{ locale === 'en' ? 'Contacts' : 'Контакты' }}</h2>
            <dl>
              <div v-if="unit.head">
                <dt>{{ locale === 'en' ? 'Head' : 'Руководитель' }}</dt>
                <dd>{{ unit.head }}<br /><span v-if="unit.headPost">{{ unit.headPost }}</span></dd>
              </div>
              <div v-if="unit.address">
                <dt>{{ t('common.address') }}</dt>
                <dd>{{ unit.address }}</dd>
              </div>
              <div v-if="unit.phones?.length">
                <dt>{{ t('common.phone') }}</dt>
                <dd>
                  <a v-for="phone in unit.phones" :key="phone" :href="`tel:${phone.replace(/[^\d+]/g, '')}`">{{ phone }}</a>
                </dd>
              </div>
              <div v-if="unit.emails?.length">
                <dt>{{ t('common.email') }}</dt>
                <dd>
                  <a v-for="email in unit.emails" :key="email" :href="`mailto:${email}`">{{ email }}</a>
                </dd>
              </div>
            </dl>
            <NuxtLink :to="localePath(unit.path)" class="link-arrow">
              {{ locale === 'en' ? 'Unit page' : 'Страница подразделения' }}
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.military-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-7);
  align-items: start;
}

.military-aside {
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

.aside-card dl {
  display: grid;
  gap: 12px;
  margin: 0 0 var(--space-4);
}

.aside-card dt {
  color: var(--color-text-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.aside-card dd {
  margin: 2px 0 0;
  font-size: 0.86rem;
}

.aside-card dd a {
  display: block;
  color: var(--color-primary-700);
  text-decoration: none;
}

@media (max-width: 1023px) {
  .military-layout {
    grid-template-columns: 1fr;
  }

  .military-aside {
    position: static;
  }
}
</style>
