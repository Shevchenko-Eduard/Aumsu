<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/sitemap')
const sections = getSections(locale)
const pages = getPages(locale)
const programs = getPrograms(locale)
const news = getNews(locale)
const journals = getJournals(locale)
const sveden = getSveden(locale)

const groups = computed(() =>
  sections
    .map((section) => ({
      ...section,
      pages: pages
        .filter((item) => item.sectionId === section.id && item.path !== section.path)
        .sort((a, b) => a.title.localeCompare(b.title, locale === 'en' ? 'en' : 'ru'))
    }))
    .filter((section) => section.pages.length || section.id === 'news')
)

useHead({ bodyAttrs: { 'data-pagefind-ignore': 'true' } })

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Site map' : 'Карта сайта'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/sitemap' : '/sitemap',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Site map' : 'Карта сайта')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Navigation' : 'Навигация'"
    />

    <section class="section">
      <div class="container sitemap-grid">
        <div v-for="section in groups" :key="section.id" class="sitemap-group">
          <h2>
            <NuxtLink :to="localePath(section.path)">{{ section.title }}</NuxtLink>
          </h2>
          <ul>
            <li v-for="item in section.pages.slice(0, 24)" :key="item.id">
              <NuxtLink :to="localePath(item.path)">{{ item.title }}</NuxtLink>
            </li>
            <li v-if="section.id === 'education'">
              <NuxtLink :to="localePath('/education/programs')">
                {{ locale === 'en' ? `All programmes (${programs.length})` : `Все программы (${programs.length})` }}
              </NuxtLink>
            </li>
            <li v-if="section.id === 'news'">
              <NuxtLink :to="localePath('/news')">{{ locale === 'en' ? 'News feed' : 'Лента новостей' }}</NuxtLink>
            </li>
            <li v-if="section.id === 'news'">
              <NuxtLink :to="localePath('/news/archive')">{{ locale === 'en' ? `News archive (${news.length})` : `Архив новостей (${news.length})` }}</NuxtLink>
            </li>
            <li v-if="section.id === 'science'">
              <NuxtLink :to="localePath('/science/journals')">
                {{ locale === 'en' ? `University journals (${journals.length})` : `Журналы университета (${journals.length})` }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="sitemap-group">
          <h2>{{ t('footer.sveden') }}</h2>
          <ul>
            <li><NuxtLink :to="localePath('/sveden')">{{ t('sveden.title') }}</NuxtLink></li>
            <li v-for="item in sveden" :key="item.id">
              <NuxtLink :to="localePath(`/sveden/${item.slug}`)">{{ item.title }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="sitemap-group">
          <h2>{{ locale === 'en' ? 'Service pages' : 'Служебные страницы' }}</h2>
          <ul>
            <li><NuxtLink :to="localePath('/search')">{{ t('search.title') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/contacts')">{{ t('footer.contacts') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/privacy')">{{ t('footer.privacy') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cookies')">{{ t('footer.cookies') }}</NuxtLink></li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sitemap-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6) var(--space-7);
  align-items: start;
}

.sitemap-group h2 {
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-sans);
  font-size: 1rem;
}

.sitemap-group h2 a {
  color: inherit;
  text-decoration: none;
}

.sitemap-group ul {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sitemap-group li {
  margin: 0;
}

.sitemap-group a {
  color: var(--color-text);
  font-size: 0.86rem;
  text-decoration: none;
}

.sitemap-group a:hover {
  color: var(--color-primary-700);
  text-decoration: underline;
}

@media (max-width: 1023px) {
  .sitemap-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .sitemap-grid {
    grid-template-columns: 1fr;
  }
}
</style>
