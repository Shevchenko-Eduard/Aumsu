<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const route = useRoute()
const router = useRouter()
const page = getPage(locale, '/education/programs')
const programs = getPrograms(locale)
const orgUnits = getOrgUnits(locale).filter((unit) => ['faculty', 'institute', 'college'].includes(unit.type))

const query = ref(String(route.query.q || ''))
const level = ref(String(route.query.level || 'all'))
const form = ref(String(route.query.form || 'all'))
const faculty = ref(String(route.query.faculty || 'all'))
const visibleCount = ref(12)

const levelOptions = computed(() => [
  { value: 'all', label: locale === 'en' ? 'All levels' : 'Все уровни' },
  { value: 'bachelor', label: locale === 'en' ? "Bachelor's" : 'Бакалавриат' },
  { value: 'specialist', label: locale === 'en' ? "Specialist's" : 'Специалитет' },
  { value: 'master', label: locale === 'en' ? "Master's" : 'Магистратура' },
  { value: 'graduate', label: locale === 'en' ? 'Postgraduate' : 'Аспирантура' },
  { value: 'college', label: locale === 'en' ? 'Vocational' : 'СПО' }
])

const formOptions = computed(() => [
  { value: 'all', label: locale === 'en' ? 'All forms' : 'Все формы' },
  { value: 'full-time', label: locale === 'en' ? 'Full-time' : 'Очная' },
  { value: 'part-time', label: locale === 'en' ? 'Part-time' : 'Заочная' }
])

const facultyOptions = computed(() => [
  { value: 'all', label: locale === 'en' ? 'All faculties' : 'Все факультеты' },
  ...orgUnits.map((unit) => ({ value: unit.id, label: unit.name || unit.shortName || '' }))
])

const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  return programs.filter((program) => {
    const matchesQuery = !normalized || program.name.toLowerCase().includes(normalized) || program.code.includes(normalized)
    const matchesLevel = level.value === 'all' || program.level === level.value
    const matchesForm = form.value === 'all' || program.forms.includes(form.value as 'full-time' | 'part-time' | 'distance' | 'mixed')
    const matchesFaculty = faculty.value === 'all' || program.facultyId === faculty.value
    return matchesQuery && matchesLevel && matchesForm && matchesFaculty
  })
})

const visiblePrograms = computed(() => filtered.value.slice(0, visibleCount.value))

const hasFilters = computed(() => level.value !== 'all' || form.value !== 'all' || faculty.value !== 'all' || Boolean(query.value.trim()))

function syncQuery() {
  const queryParams: Record<string, string> = {}
  if (query.value.trim()) queryParams.q = query.value.trim()
  if (level.value !== 'all') queryParams.level = level.value
  if (form.value !== 'all') queryParams.form = form.value
  if (faculty.value !== 'all') queryParams.faculty = faculty.value
  router.replace({ query: queryParams })
  visibleCount.value = 12
}

function resetFilters() {
  query.value = ''
  level.value = 'all'
  form.value = 'all'
  faculty.value = 'all'
  syncQuery()
}

watch([level, form, faculty], syncQuery)
watch(query, () => {
  visibleCount.value = 12
})

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Programme catalogue' : 'Каталог программ'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/education/programs' : '/education/programs',
  noindex: Boolean(route.query.level || route.query.form || route.query.faculty || route.query.q),
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Programme catalogue' : 'Каталог программ')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Education' : 'Образование'"
      variant="navy"
    />

    <section class="section">
      <div class="container catalog-layout">
        <aside class="filters" :aria-label="t('common.filters')">
          <div class="filters__head">
            <h2>{{ t('common.filters') }}</h2>
            <button v-if="hasFilters" type="button" class="filters__reset" @click="resetFilters">
              {{ t('common.reset') }}
            </button>
          </div>

          <div class="form-field">
            <label for="program-query">{{ locale === 'en' ? 'Search' : 'Поиск' }}</label>
            <input id="program-query" v-model="query" class="input" type="search" :placeholder="locale === 'en' ? 'Name or code' : 'Название или код'" @change="syncQuery" />
          </div>

          <div class="form-field">
            <label for="program-level">{{ locale === 'en' ? 'Level' : 'Уровень' }}</label>
            <select id="program-level" v-model="level" class="input">
              <option v-for="option in levelOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>

          <div class="form-field">
            <label for="program-form">{{ locale === 'en' ? 'Study form' : 'Форма обучения' }}</label>
            <select id="program-form" v-model="form" class="input">
              <option v-for="option in formOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>

          <div class="form-field">
            <label for="program-faculty">{{ locale === 'en' ? 'Faculty' : 'Факультет' }}</label>
            <select id="program-faculty" v-model="faculty" class="input">
              <option v-for="option in facultyOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
        </aside>

        <div>
          <div class="catalog-head">
            <p role="status" class="catalog-count">
              {{ locale === 'en' ? `Found: ${filtered.length}` : `Найдено программ: ${filtered.length}` }}
            </p>
            <p v-if="hasFilters" class="small muted">
              {{ locale === 'en' ? 'Filtered results are not indexed.' : 'Страницы с фильтрами не индексируются.' }}
            </p>
          </div>

          <div v-if="visiblePrograms.length" class="grid grid--2 catalog-grid">
            <ProgramCard v-for="program in visiblePrograms" :key="program.id" :program="program" />
          </div>
          <div v-else class="empty-state">
            <i class="pi pi-search" aria-hidden="true" />
            <p>{{ t('common.noResults') }}</p>
            <p class="muted">{{ t('common.tryAnother') }}</p>
            <BaseButton variant="secondary" size="sm" @click="resetFilters">{{ t('common.resetFilters') }}</BaseButton>
          </div>

          <div v-if="visibleCount < filtered.length" class="catalog-more">
            <BaseButton variant="secondary" @click="visibleCount += 12">
              {{ t('common.showMore') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.catalog-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: var(--space-7);
  align-items: start;
}

.filters {
  position: sticky;
  top: 130px;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.filters__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.filters__head h2 {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filters__reset {
  border: 0;
  background: none;
  color: var(--color-primary-700);
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.catalog-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: var(--space-5);
}

.catalog-count {
  margin: 0;
  color: var(--color-primary-900);
  font-weight: 700;
}

.catalog-grid {
  align-items: stretch;
}

.catalog-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}

.empty-state {
  padding: var(--space-8) var(--space-5);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-state .pi {
  margin-bottom: var(--space-3);
  color: var(--color-border-strong);
  font-size: 2rem;
}

.empty-state p {
  margin: 0 0 8px;
}

@media (max-width: 1023px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }

  .filters {
    position: static;
  }
}
</style>
