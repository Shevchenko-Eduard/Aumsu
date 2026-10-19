<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const route = useRoute()

const page = getSvedenPage(locale, String(route.params.section))
const sections = getSveden(locale)

if (!page) {
  throw createError({
    statusCode: 404,
    statusMessage: locale === 'en' ? 'Sveden section not found' : 'Раздел сведений не найден',
    fatal: true
  })
}

const updated = computed(() =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(page.updatedAt))
)

usePageSeo({
  title: page.seo.title,
  description: page.seo.description,
  path: locale === 'en' ? `/en/sveden/${page.slug}` : `/sveden/${page.slug}`,
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page.title))]
})
</script>

<template>
  <div>
    <PageHeader :title="page.title" :summary="page.summary" :eyebrow="t('sveden.official')" />

    <section class="section">
      <div class="container sveden-layout">
        <div
          class="sveden-content"
          itemscope
          :itemtype="page.sveden.itemtype || 'https://schema.org/EducationalOrganization'"
        >
          <div class="sveden-status">
            <span class="badge badge--success">{{ t('sveden.requiredField') }}</span>
            <span class="small muted">{{ t('sveden.updated') }}: {{ updated }}</span>
          </div>

          <div v-if="page.sveden.fields.length" class="sveden-fields">
            <div v-for="field in page.sveden.fields" :key="field.itemprop" class="sveden-field">
              <dt>{{ field.label }}</dt>
              <dd :itemprop="field.itemprop">
                <template v-if="field.type === 'list' && Array.isArray(field.value)">
                  <span v-for="value in field.value" :key="value" class="sveden-field__line">{{ value }}</span>
                </template>
                <template v-else-if="field.type === 'link' && typeof field.value === 'string'">
                  <a :href="field.value" target="_blank" rel="noopener noreferrer">{{ field.value }}</a>
                </template>
                <template v-else>
                  {{ Array.isArray(field.value) ? field.value.join(', ') : field.value }}
                </template>
              </dd>
            </div>
          </div>

          <div v-for="(dataTable, index) in page.sveden.tables" :key="index" class="sveden-table-block">
            <div class="table-wrap">
              <table>
                <caption v-if="dataTable.caption">{{ dataTable.caption }}</caption>
                <thead>
                  <tr>
                    <th v-for="header in dataTable.headers" :key="header" scope="col">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in dataTable.rows" :key="rowIndex">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p v-if="!page.sveden.fields.length && !page.sveden.tables.length" class="muted">
            {{ locale === 'en' ? 'Information is being updated.' : 'Информация обновляется.' }}
          </p>
        </div>

        <aside class="sveden-nav">
          <h2>{{ t('sveden.navTitle') }}</h2>
          <ul>
            <li v-for="item in sections" :key="item.id">
              <NuxtLink
                :to="localePath(`/sveden/${item.slug}`)"
                :class="{ 'is-active': item.slug === page.slug }"
                :aria-current="item.slug === page.slug ? 'page' : undefined"
              >
                {{ item.title }}
              </NuxtLink>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sveden-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: var(--space-7);
  align-items: start;
}

.sveden-content {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
}

.sveden-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.sveden-fields {
  display: grid;
  gap: 0;
  margin: 0;
  border-top: 1px solid var(--color-border);
}

.sveden-field {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: var(--space-4);
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}

.sveden-field dt {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.sveden-field dd {
  margin: 0;
  font-size: 0.9rem;
}

.sveden-field__line {
  display: block;
}

.sveden-field dd a {
  color: var(--color-primary-700);
  text-decoration: none;
}

.sveden-field dd a:hover {
  text-decoration: underline;
}

.sveden-table-block {
  margin-top: var(--space-5);
}

.sveden-nav {
  grid-column: 1;
  grid-row: 1;
  position: sticky;
  top: 130px;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.sveden-nav h2 {
  font-family: var(--font-sans);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sveden-nav ul {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sveden-nav li {
  margin: 0;
}

.sveden-nav a {
  display: block;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 0.84rem;
  text-decoration: none;
}

.sveden-nav a:hover {
  background: var(--color-primary-100);
  color: var(--color-primary-900);
}

.sveden-nav a.is-active {
  background: var(--color-primary-900);
  color: #fff;
  font-weight: 700;
}

@media (max-width: 1023px) {
  .sveden-layout {
    grid-template-columns: 1fr;
  }

  .sveden-nav {
    position: static;
    grid-column: 1;
    grid-row: 1;
  }

  .sveden-content {
    grid-column: 1;
    grid-row: 2;
  }

  .sveden-nav ul {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .sveden-field {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .sveden-nav ul {
    grid-template-columns: 1fr;
  }
}
</style>
