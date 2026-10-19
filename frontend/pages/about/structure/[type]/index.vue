<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const route = useRoute()
const typeParam = String(route.params.type)

const typeMap: Record<string, { type: string; ru: string; en: string }> = {
  faculties: { type: 'faculty', ru: 'Факультеты', en: 'Faculties' },
  institutes: { type: 'institute', ru: 'Институты', en: 'Institutes' },
  colleges: { type: 'college', ru: 'Колледжи', en: 'Colleges' },
  administrations: { type: 'administration', ru: 'Управления и отделы', en: 'Administrations and offices' },
  departments: { type: 'department', ru: 'Кафедры', en: 'Departments' },
  branches: { type: 'branch', ru: 'Филиалы', en: 'Branches' },
  'military-center': { type: 'military-center', ru: 'Военный учебный центр', en: 'Military Training Centre' }
}

const config = typeMap[typeParam]

if (!config) {
  throw createError({ statusCode: 404, statusMessage: 'Section not found', fatal: true })
}

const title = locale === 'en' ? config.en : config.ru
const units = getOrgUnits(locale).filter((unit) => unit.type === config.type)
const query = ref('')
const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  if (!normalized) return units
  return units.filter((unit) => `${unit.name || ''} ${unit.shortName || ''}`.toLowerCase().includes(normalized))
})

usePageSeo({
  title: `${title} — ${locale === 'en' ? 'structure' : 'структура'}`,
  description:
    locale === 'en'
      ? `${title} of Admiral Ushakov Maritime State University: contacts, leadership and documents.`
      : `${title} Государственного морского университета имени адмирала Ф.Ф. Ушакова: контакты, руководство и документы.`,
  path: locale === 'en' ? `/en/about/structure/${typeParam}` : `/about/structure/${typeParam}`,
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(title))]
})
</script>

<template>
  <div>
    <PageHeader :title="title" :summary="locale === 'en' ? `Units of the university: ${units.length}.` : `Подразделений: ${units.length}.`" :eyebrow="locale === 'en' ? 'Structure' : 'Структура'">
      <template #actions>
        <BaseButton :to="localePath('/about/structure')" variant="secondary">{{ locale === 'en' ? 'All structure' : 'Вся структура' }}</BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container">
        <div class="list-toolbar">
          <div class="form-field">
            <label for="unit-query">{{ locale === 'en' ? 'Search units' : 'Поиск подразделения' }}</label>
            <input id="unit-query" v-model="query" class="input" type="search" />
          </div>
          <p class="small muted" role="status">{{ locale === 'en' ? `Found: ${filtered.length}` : `Найдено: ${filtered.length}` }}</p>
        </div>

        <div v-if="filtered.length" class="grid grid--3">
          <OrgUnitCard v-for="unit in filtered" :key="unit.id" :unit="unit" />
        </div>
        <div v-else class="empty-state">
          <p>{{ t('common.noResults') }}</p>
          <BaseButton :to="localePath('/contacts')" variant="secondary" size="sm">{{ t('common.contacts') }}</BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.list-toolbar .form-field {
  width: min(100%, 420px);
}

.empty-state {
  padding: var(--space-8);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}
</style>
