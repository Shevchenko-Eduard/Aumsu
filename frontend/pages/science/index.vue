<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/science')
const journals = getJournals(locale)

const cards = computed(() => [
  { path: '/science/areas', title: locale === 'en' ? 'Research areas' : 'Научные направления', text: locale === 'en' ? 'Schools and research teams.' : 'Научные школы и исследовательские коллективы.', icon: 'pi-compass' },
  { path: '/science/labs', title: locale === 'en' ? 'Laboratories' : 'Лаборатории', text: locale === 'en' ? 'Facilities and equipment.' : 'Лаборатории и научное оборудование.', icon: 'pi-cog' },
  { path: '/science/institutes', title: locale === 'en' ? 'Research institute' : 'Научно-исследовательский институт', text: locale === 'en' ? 'Applied research and projects.' : 'Прикладные исследования и проекты.', icon: 'pi-building' },
  { path: '/science/technopark', title: locale === 'en' ? 'Technopark' : 'Технопарк', text: locale === 'en' ? 'Technology entrepreneurship.' : 'Технологическое предпринимательство.', icon: 'pi-bolt' },
  { path: '/science/graduate', title: locale === 'en' ? 'Postgraduate study' : 'Аспирантура', text: locale === 'en' ? 'Research training programmes.' : 'Программы подготовки исследователей.', icon: 'pi-graduation-cap' },
  { path: '/science/dissertation-council', title: locale === 'en' ? 'Dissertation council' : 'Диссертационный совет', text: locale === 'en' ? 'Membership and defences.' : 'Состав и защиты диссертаций.', icon: 'pi-check-circle' },
  { path: '/science/conferences', title: locale === 'en' ? 'Conferences' : 'Конференции', text: locale === 'en' ? 'Events and competitions.' : 'События и конкурсы.', icon: 'pi-calendar' },
  { path: '/science/grants', title: locale === 'en' ? 'Grants' : 'Гранты', text: locale === 'en' ? 'Funding opportunities.' : 'Возможности финансирования.', icon: 'pi-money-bill' },
  { path: '/science/patents', title: locale === 'en' ? 'Patents' : 'Патенты', text: locale === 'en' ? 'Intellectual property results.' : 'Результаты интеллектуальной деятельности.', icon: 'pi-file' },
  { path: '/science/publications', title: locale === 'en' ? 'For authors' : 'Авторам публикаций', text: locale === 'en' ? 'Publication requirements.' : 'Требования к публикациям.', icon: 'pi-pencil' }
])

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Research' : 'Наука'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/science' : '/science',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Research' : 'Наука')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Research and innovation' : 'Наука и инновации'"
      variant="navy"
    >
      <template #actions>
        <BaseButton :to="localePath('/science/journals')" variant="light">{{ locale === 'en' ? 'University journals' : 'Журналы университета' }}</BaseButton>
        <BaseButton :to="localePath('/science/conferences')" variant="light">{{ locale === 'en' ? 'Conferences' : 'Конференции' }}</BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'Research ecosystem' : 'Научная экосистема' }}</p>
            <h2>{{ locale === 'en' ? 'From idea to implementation' : 'От идеи до внедрения' }}</h2>
          </div>
          <p>{{ locale === 'en' ? 'The university combines fundamental research, applied projects and industry partnerships.' : 'Университет объединяет фундаментальные исследования, прикладные проекты и партнёрство с отраслью.' }}</p>
        </div>
        <div class="grid grid--3">
          <NuxtLink v-for="card in cards" :key="card.path" :to="localePath(card.path)" class="science-card">
            <span class="science-card__icon"><i :class="`pi ${card.icon}`" aria-hidden="true" /></span>
            <span class="science-card__title">{{ card.title }}</span>
            <span class="science-card__text">{{ card.text }}</span>
            <span class="link-arrow">{{ t('common.readMore') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section section--subtle">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'Journals' : 'Журналы' }}</p>
            <h2>{{ locale === 'en' ? 'University publications' : 'Издания университета' }}</h2>
          </div>
          <BaseButton :to="localePath('/science/journals')" variant="secondary" size="sm">{{ locale === 'en' ? 'All journals' : 'Все журналы' }}</BaseButton>
        </div>
        <div class="grid grid--2">
          <NuxtLink v-for="journal in journals" :key="journal.id" :to="localePath(`/science/journals/${journal.slug}`)" class="journal-card">
            <span class="badge">{{ journal.issn || 'ISSN' }}</span>
            <h3>{{ journal.title }}</h3>
            <p>{{ journal.description[0] && 'text' in journal.description[0] ? journal.description[0].text : '' }}</p>
            <span class="link-arrow">{{ locale === 'en' ? 'Open journal' : 'Открыть журнал' }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.science-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  color: var(--color-text);
  text-decoration: none;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.science-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
}

.science-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  font-size: 1.2rem;
}

.science-card__title {
  margin-top: 4px;
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.12rem;
  font-weight: 700;
}

.science-card__text {
  color: var(--color-text-muted);
  font-size: 0.84rem;
}

.science-card .link-arrow {
  margin-top: auto;
  padding-top: 8px;
  font-size: 0.82rem;
}

.journal-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: var(--space-5);
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

.journal-card h3 {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 1.1rem;
}

.journal-card p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

.journal-card .link-arrow {
  margin-top: auto;
  font-size: 0.84rem;
}
</style>
