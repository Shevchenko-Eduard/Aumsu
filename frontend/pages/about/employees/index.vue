<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const page = getPage(locale, '/about/employees')
const employees = getEmployees(locale)
const query = ref('')
const group = ref('all')
const visibleCount = ref(24)

const groups = computed(() => [
  { value: 'all', label: locale === 'en' ? 'All staff' : 'Все сотрудники' },
  { value: 'management', label: locale === 'en' ? 'Leadership' : 'Руководство' },
  { value: 'faculty', label: locale === 'en' ? 'Faculty' : 'Преподаватели' }
])

const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  return employees.filter((employee) => {
    const matchesQuery =
      !normalized ||
      employee.fullName.toLowerCase().includes(normalized) ||
      employee.position.toLowerCase().includes(normalized) ||
      (employee.degree || '').toLowerCase().includes(normalized)
    const matchesGroup =
      group.value === 'all' ||
      (group.value === 'management' && employee.isManager) ||
      (group.value === 'faculty' && !employee.isManager)
    return matchesQuery && matchesGroup
  })
})

const visible = computed(() => filtered.value.slice(0, visibleCount.value))

watch([query, group], () => {
  visibleCount.value = 24
})

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Staff and faculty' : 'Сотрудники и преподаватели'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/about/employees' : '/about/employees',
  noindex: Boolean(query.value || group.value !== 'all'),
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Staff and faculty' : 'Сотрудники и преподаватели')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'University' : 'Университет'"
      variant="navy"
    />

    <section class="section">
      <div class="container">
        <div class="staff-toolbar">
          <div class="form-field">
            <label for="staff-query">{{ locale === 'en' ? 'Search by name or position' : 'Поиск по ФИО или должности' }}</label>
            <input id="staff-query" v-model="query" class="input" type="search" />
          </div>
          <div class="form-field">
            <label for="staff-group">{{ locale === 'en' ? 'Category' : 'Категория' }}</label>
            <select id="staff-group" v-model="group" class="input">
              <option v-for="option in groups" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <p class="staff-count" role="status">{{ locale === 'en' ? `Found: ${filtered.length}` : `Найдено: ${filtered.length}` }}</p>
        </div>

        <div v-if="visible.length" class="grid grid--3">
          <EmployeeCard v-for="employee in visible" :key="employee.id" :employee="employee" />
        </div>
        <div v-else class="empty-state">
          <p>{{ t('common.noResults') }}</p>
          <p class="muted">{{ t('common.tryAnother') }}</p>
        </div>

        <div v-if="visibleCount < filtered.length" class="staff-more">
          <BaseButton variant="secondary" @click="visibleCount += 24">{{ t('common.showMore') }}</BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.staff-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px auto;
  gap: var(--space-4);
  align-items: end;
  margin-bottom: var(--space-5);
}

.staff-count {
  margin: 0 0 14px;
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.staff-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}

.empty-state {
  padding: var(--space-8);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-state p {
  margin: 0 0 6px;
}

@media (max-width: 1023px) {
  .staff-toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .staff-count {
    margin: 0;
    grid-column: 1 / -1;
  }
}

@media (max-width: 639px) {
  .staff-toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
