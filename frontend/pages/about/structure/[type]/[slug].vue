<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const route = useRoute()

const unit = getOrgUnit(locale, String(route.params.slug))

if (!unit) {
  throw createError({
    statusCode: 404,
    statusMessage: locale === 'en' ? 'Unit not found' : 'Подразделение не найдено',
    fatal: true
  })
}

const title = unit.name || unit.shortName || ''
const programs = getPrograms(locale).filter((program) => program.facultyId === unit.id)
const related = getOrgUnits(locale)
  .filter((item) => item.id !== unit.id && item.type === unit.type)
  .slice(0, 3)

const typeLabels: Record<string, { ru: string; en: string }> = {
  faculty: { ru: 'Факультет', en: 'Faculty' },
  institute: { ru: 'Институт', en: 'Institute' },
  college: { ru: 'Колледж', en: 'College' },
  department: { ru: 'Кафедра', en: 'Department' },
  administration: { ru: 'Управление', en: 'Administration' },
  branch: { ru: 'Филиал', en: 'Branch' },
  'military-center': { ru: 'Военный учебный центр', en: 'Military centre' }
}

usePageSeo({
  title: `${title} — ${locale === 'en' ? 'university unit' : 'подразделение университета'}`,
  description: unit.seo.description,
  path: locale === 'en' ? `/en${unit.path}` : unit.path,
  jsonLd: [
    breadcrumbJsonLd(useBreadcrumbs(title)),
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: title,
      parentOrganization: {
        '@type': 'CollegeOrUniversity',
        name: 'ГМУ им. адм. Ф.Ф. Ушакова'
      },
      telephone: unit.phones?.[0],
      email: unit.emails?.[0],
      address: unit.address
    }
  ]
})
</script>

<template>
  <div>
    <PageHeader
      :title="title"
      :summary="typeLabels[unit.type]?.[locale]"
      :eyebrow="locale === 'en' ? 'University structure' : 'Структура университета'"
    />

    <section class="section">
      <div class="container unit-layout">
        <div>
          <h2 class="unit-subtitle">{{ locale === 'en' ? 'About the unit' : 'О подразделении' }}</h2>
          <ContentRenderer :blocks="unit.description" />

          <template v-if="programs.length">
            <h2 class="unit-subtitle">{{ locale === 'en' ? 'Programmes' : 'Программы' }}</h2>
            <div class="grid grid--2">
              <ProgramCard v-for="program in programs.slice(0, 6)" :key="program.id" :program="program" />
            </div>
            <div class="unit-more">
              <BaseButton :to="localePath(`/education/programs?faculty=${unit.id}`)" variant="secondary" size="sm">
                {{ locale === 'en' ? 'All programmes' : 'Все программы' }}
              </BaseButton>
            </div>
          </template>
        </div>

        <aside class="unit-aside">
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
              <div v-if="unit.workingHours">
                <dt>{{ t('common.workingHours') }}</dt>
                <dd>{{ unit.workingHours }}</dd>
              </div>
            </dl>
            <a v-if="unit.siteUrl" :href="unit.siteUrl" class="unit-site" target="_blank" rel="noopener noreferrer">
              {{ locale === 'en' ? 'Unit website' : 'Сайт подразделения' }}
              <i class="pi pi-external-link" aria-hidden="true" />
            </a>
            <a v-if="unit.regulationUrl" :href="unit.regulationUrl" class="unit-site" target="_blank" rel="noopener noreferrer">
              {{ locale === 'en' ? 'Regulation' : 'Положение о подразделении' }}
              <i class="pi pi-download" aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </section>

    <section v-if="related.length" class="section section--subtle">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'See also' : 'Смотрите также' }}</p>
            <h2>{{ locale === 'en' ? 'Other units' : 'Другие подразделения' }}</h2>
          </div>
        </div>
        <div class="grid grid--3">
          <OrgUnitCard v-for="item in related" :key="item.id" :unit="item" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.unit-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-7);
  align-items: start;
}

.unit-subtitle {
  margin-top: var(--space-6);
}

.unit-subtitle:first-child {
  margin-top: 0;
}

.unit-more {
  margin-top: var(--space-4);
}

.unit-aside {
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
  margin: 0;
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

.unit-site {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  color: var(--color-primary-700);
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 1023px) {
  .unit-layout {
    grid-template-columns: 1fr;
  }

  .unit-aside {
    position: static;
  }
}
</style>
