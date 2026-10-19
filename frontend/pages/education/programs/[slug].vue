<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const route = useRoute()

const program = getProgram(locale, String(route.params.slug))

if (!program) {
  throw createError({
    statusCode: 404,
    statusMessage: locale === 'en' ? 'Programme not found' : 'Программа не найдена',
    fatal: true
  })
}

const orgUnits = getOrgUnits(locale)
const faculty = orgUnits.find((unit) => unit.id === program.facultyId)
const allPrograms = getPrograms(locale)
const related = allPrograms
  .filter((item) => item.id !== program.id && (item.facultyId === program.facultyId || item.level === program.level))
  .slice(0, 3)
const contacts = getContacts(locale)
const admissionsContact = contacts.find((contact) => contact.id === 'admissions') || contacts[0]

const levelLabels: Record<string, { ru: string; en: string }> = {
  college: { ru: 'СПО', en: 'Vocational' },
  bachelor: { ru: 'Бакалавриат', en: "Bachelor's" },
  specialist: { ru: 'Специалитет', en: "Specialist's" },
  master: { ru: 'Магистратура', en: "Master's" },
  graduate: { ru: 'Аспирантура', en: 'Postgraduate' },
  dpo: { ru: 'ДПО', en: 'CPD' }
}

const formLabels: Record<string, { ru: string; en: string }> = {
  'full-time': { ru: 'очная', en: 'full-time' },
  'part-time': { ru: 'заочная', en: 'part-time' },
  distance: { ru: 'дистанционная', en: 'distance' },
  mixed: { ru: 'очно-заочная', en: 'mixed' }
}

const level = computed(() => levelLabels[program.level]?.[locale] || program.level)
const forms = computed(() => program.forms.map((form) => formLabels[form]?.[locale] || form).join(', '))
const price = computed(() => {
  const amount = program.tuition?.[0]?.amount
  if (!amount) return null
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(amount)
})

usePageSeo({
  title: program.seo.title,
  description: program.seo.description,
  path: locale === 'en' ? `/en/education/programs/${program.slug}` : `/education/programs/${program.slug}`,
  jsonLd: [
    breadcrumbJsonLd(useBreadcrumbs(program.name)),
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: program.name,
      description: program.seo.description,
      provider: {
        '@type': 'CollegeOrUniversity',
        name: 'ГМУ им. адм. Ф.Ф. Ушакова',
        sameAs: 'https://aumsu.ru'
      },
      educationalCredentialAwarded: level.value
    }
  ]
})
</script>

<template>
  <div>
    <PageHeader :title="program.name" :summary="program.seo.description" :eyebrow="level" variant="navy">
      <template #actions>
        <BaseButton :to="localePath('/admissions/apply')" size="lg">{{ t('page.admissions.cta') }}</BaseButton>
        <BaseButton :to="localePath('/education/programs')" variant="light" size="lg">
          {{ t('home.allPrograms') }}
        </BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container program-layout">
        <div>
          <dl class="program-facts">
            <div>
              <dt>{{ locale === 'en' ? 'Code' : 'Код' }}</dt>
              <dd>{{ program.code }}</dd>
            </div>
            <div>
              <dt>{{ locale === 'en' ? 'Level' : 'Уровень' }}</dt>
              <dd>{{ level }}</dd>
            </div>
            <div>
              <dt>{{ locale === 'en' ? 'Study form' : 'Форма обучения' }}</dt>
              <dd>{{ forms }}</dd>
            </div>
            <div v-if="program.duration">
              <dt>{{ locale === 'en' ? 'Duration' : 'Срок обучения' }}</dt>
              <dd>{{ program.duration }}</dd>
            </div>
            <div v-if="program.budgetPlaces">
              <dt>{{ locale === 'en' ? 'Budget places' : 'Бюджетные места' }}</dt>
              <dd>{{ program.budgetPlaces }}</dd>
            </div>
            <div v-if="program.paidPlaces">
              <dt>{{ locale === 'en' ? 'Paid places' : 'Платные места' }}</dt>
              <dd>{{ program.paidPlaces }}</dd>
            </div>
            <div v-if="price">
              <dt>{{ locale === 'en' ? 'Tuition' : 'Стоимость' }}</dt>
              <dd>{{ price }}</dd>
            </div>
            <div v-if="faculty">
              <dt>{{ locale === 'en' ? 'Faculty' : 'Факультет' }}</dt>
              <dd>
                <NuxtLink :to="localePath(faculty.path)">{{ faculty.name || faculty.shortName }}</NuxtLink>
              </dd>
            </div>
          </dl>

          <h2 class="section-subtitle">{{ locale === 'en' ? 'About the programme' : 'О программе' }}</h2>
          <ContentRenderer :blocks="program.description" />

          <template v-if="program.admission">
            <h2 class="section-subtitle">{{ locale === 'en' ? 'Entrance examinations' : 'Вступительные испытания' }}</h2>
            <div class="table-wrap">
              <table>
                <caption>{{ locale === 'en' ? 'Entrance examinations and minimum scores' : 'Вступительные испытания и минимальные баллы' }}</caption>
                <thead>
                  <tr>
                    <th scope="col">{{ locale === 'en' ? 'Subject' : 'Предмет' }}</th>
                    <th scope="col">{{ locale === 'en' ? 'Minimum score' : 'Минимальный балл' }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="exam in program.admission.exams" :key="exam.subject">
                    <td>{{ exam.subject }}</td>
                    <td>{{ exam.minScore || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="program.admission.deadlines?.length" class="deadlines">
              <h3>{{ locale === 'en' ? 'Key dates' : 'Ключевые даты' }}</h3>
              <ul class="pill-list">
                <li v-for="deadline in program.admission.deadlines" :key="deadline.label" class="badge badge--accent">
                  {{ deadline.label }} — {{ new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(deadline.date)) }}
                </li>
              </ul>
            </div>
          </template>
        </div>

        <aside class="program-aside">
          <div class="aside-card">
            <h2>{{ locale === 'en' ? 'Admissions office' : 'Приёмная комиссия' }}</h2>
            <p>{{ locale === 'en' ? 'Ask about documents, exams and places.' : 'Уточните документы, экзамены и количество мест.' }}</p>
            <a href="tel:+78617717525" class="aside-card__phone">+7 (8617) 71-75-25</a>
            <a href="mailto:pcom@nsma.ru">pcom@nsma.ru</a>
            <BaseButton :to="localePath('/contacts/feedback')" variant="secondary" size="sm">
              {{ t('page.admissions.consult') }}
            </BaseButton>
          </div>
          <div v-if="admissionsContact" class="aside-card aside-card--muted">
            <h3>{{ t('common.workingHours') }}</h3>
            <p>{{ admissionsContact.workingHours }}</p>
          </div>
        </aside>
      </div>
    </section>

    <section v-if="related.length" class="section section--subtle">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'Related' : 'Смотрите также' }}</p>
            <h2>{{ locale === 'en' ? 'Other programmes' : 'Другие программы' }}</h2>
          </div>
          <BaseButton :to="localePath('/education/programs')" variant="secondary" size="sm">{{ t('home.allPrograms') }}</BaseButton>
        </div>
        <div class="grid grid--3">
          <ProgramCard v-for="item in related" :key="item.id" :program="item" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.program-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-7);
  align-items: start;
}

.program-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
  margin: 0 0 var(--space-6);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.program-facts dt {
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.program-facts dd {
  margin: 3px 0 0;
  color: var(--color-primary-900);
  font-weight: 700;
}

.program-facts dd a {
  color: var(--color-primary-700);
  text-decoration: none;
}

.section-subtitle {
  margin-top: var(--space-6);
}

.deadlines {
  margin-top: var(--space-5);
}

.deadlines h3 {
  font-family: var(--font-sans);
  font-size: 1rem;
}

.program-aside {
  position: sticky;
  top: 130px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.aside-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-primary-900);
  color: rgba(255, 255, 255, 0.82);
}

.aside-card h2,
.aside-card h3 {
  color: #fff;
  font-family: var(--font-sans);
  font-size: 1.05rem;
}

.aside-card p {
  font-size: 0.86rem;
}

.aside-card a {
  display: block;
  margin-bottom: 4px;
  color: #fff;
  font-weight: 700;
}

.aside-card__phone {
  font-size: 1.1rem;
}

.aside-card :deep(.btn--secondary) {
  margin-top: var(--space-3);
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.aside-card--muted {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
}

.aside-card--muted h3 {
  color: var(--color-primary-900);
}

@media (max-width: 1023px) {
  .program-layout {
    grid-template-columns: 1fr;
  }

  .program-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .program-aside {
    position: static;
  }
}
</style>
