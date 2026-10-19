<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const route = useRoute()

const employee = getEmployee(locale, String(route.params.slug))

if (!employee) {
  throw createError({
    statusCode: 404,
    statusMessage: locale === 'en' ? 'Employee not found' : 'Сотрудник не найден',
    fatal: true
  })
}

const initials = computed(() =>
  (employee.displayName || employee.fullName).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('')
)

const related = getEmployees(locale)
  .filter((item) => item.id !== employee.id && item.isManager === employee.isManager)
  .slice(0, 3)

usePageSeo({
  title: employee.seo.title,
  description: employee.seo.description,
  path: locale === 'en' ? `/en/about/employees/${employee.slug}` : `/about/employees/${employee.slug}`,
  jsonLd: [
    breadcrumbJsonLd(useBreadcrumbs(employee.fullName)),
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: employee.fullName,
      jobTitle: employee.position,
      email: employee.emails?.[0],
      telephone: employee.phones?.[0],
      worksFor: {
        '@type': 'CollegeOrUniversity',
        name: 'ГМУ им. адм. Ф.Ф. Ушакова'
      }
    }
  ]
})
</script>

<template>
  <div>
    <PageHeader
      :title="employee.fullName"
      :summary="employee.position"
      :eyebrow="locale === 'en' ? 'University staff' : 'Сотрудники университета'"
    />

    <section class="section">
      <div class="container employee-layout">
        <div>
          <div class="employee-profile">
            <div class="employee-profile__avatar" aria-hidden="true">{{ initials }}</div>
            <div>
              <p class="employee-profile__position">{{ employee.position }}</p>
              <p v-if="employee.degree || employee.academicTitle" class="employee-profile__degree">
                {{ [employee.degree, employee.academicTitle].filter(Boolean).join(', ') }}
              </p>
              <p v-if="employee.experienceYears" class="employee-profile__experience">
                {{ locale === 'en' ? `Experience: ${employee.experienceYears} years` : `Стаж: ${employee.experienceYears} лет` }}
              </p>
            </div>
          </div>

          <ContentRenderer v-if="employee.bio?.length" :blocks="employee.bio" />

          <template v-if="employee.disciplines?.length">
            <h2 class="employee-subtitle">{{ locale === 'en' ? 'Disciplines' : 'Дисциплины' }}</h2>
            <ul class="pill-list">
              <li v-for="discipline in employee.disciplines" :key="discipline" class="badge">{{ discipline }}</li>
            </ul>
          </template>

          <template v-if="employee.education?.length">
            <h2 class="employee-subtitle">{{ locale === 'en' ? 'Education' : 'Образование' }}</h2>
            <ul>
              <li v-for="item in employee.education" :key="item">{{ item }}</li>
            </ul>
          </template>

          <template v-if="employee.qualifications?.length">
            <h2 class="employee-subtitle">{{ locale === 'en' ? 'Qualifications' : 'Квалификация' }}</h2>
            <ul>
              <li v-for="item in employee.qualifications" :key="item">{{ item }}</li>
            </ul>
          </template>
        </div>

        <aside class="employee-aside">
          <div class="aside-card">
            <h2>{{ locale === 'en' ? 'Contacts' : 'Контакты' }}</h2>
            <dl>
              <div v-if="employee.phones?.length">
                <dt>{{ t('common.phone') }}</dt>
                <dd>
                  <a v-for="phone in employee.phones" :key="phone" :href="`tel:${phone.replace(/[^\d+]/g, '')}`">{{ phone }}</a>
                </dd>
              </div>
              <div v-if="employee.emails?.length">
                <dt>{{ t('common.email') }}</dt>
                <dd>
                  <a v-for="email in employee.emails" :key="email" :href="`mailto:${email}`">{{ email }}</a>
                </dd>
              </div>
            </dl>
            <NuxtLink :to="localePath('/about/employees')" class="aside-card__back">
              {{ locale === 'en' ? 'All staff' : 'Все сотрудники' }}
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>

    <section v-if="related.length" class="section section--subtle">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'See also' : 'Смотрите также' }}</p>
            <h2>{{ locale === 'en' ? 'Other staff' : 'Другие сотрудники' }}</h2>
          </div>
        </div>
        <div class="grid grid--3">
          <EmployeeCard v-for="item in related" :key="item.id" :employee="item" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.employee-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: var(--space-7);
  align-items: start;
}

.employee-profile {
  display: flex;
  gap: var(--space-5);
  align-items: center;
  margin-bottom: var(--space-6);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.employee-profile__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  flex: 0 0 96px;
  border-radius: 50%;
  background: var(--color-primary-900);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
}

.employee-profile__position {
  margin: 0;
  color: var(--color-primary-900);
  font-weight: 700;
}

.employee-profile__degree,
.employee-profile__experience {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

.employee-subtitle {
  margin-top: var(--space-6);
}

.employee-aside {
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

.aside-card__back {
  display: block;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  font-size: 0.84rem;
  font-weight: 700;
}

@media (max-width: 1023px) {
  .employee-layout {
    grid-template-columns: 1fr;
  }

  .employee-aside {
    position: static;
  }
}

@media (max-width: 639px) {
  .employee-profile {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
