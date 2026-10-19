<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/about/structure')
const orgUnits = getOrgUnits(locale)

const groups = computed(() => [
  { type: 'faculties', label: locale === 'en' ? 'Faculties' : 'Факультеты', count: orgUnits.filter((unit) => unit.type === 'faculty').length, icon: 'pi-building' },
  { type: 'institutes', label: locale === 'en' ? 'Institutes' : 'Институты', count: orgUnits.filter((unit) => unit.type === 'institute').length, icon: 'pi-sitemap' },
  { type: 'colleges', label: locale === 'en' ? 'Colleges' : 'Колледжи', count: orgUnits.filter((unit) => unit.type === 'college').length, icon: 'pi-graduation-cap' },
  { type: 'administrations', label: locale === 'en' ? 'Administrations and offices' : 'Управления и отделы', count: orgUnits.filter((unit) => unit.type === 'administration').length, icon: 'pi-briefcase' },
  { type: 'departments', label: locale === 'en' ? 'Departments' : 'Кафедры', count: orgUnits.filter((unit) => unit.type === 'department').length, icon: 'pi-users' },
  { type: 'branches', label: locale === 'en' ? 'Branches' : 'Филиалы', count: orgUnits.filter((unit) => unit.type === 'branch').length, icon: 'pi-globe' }
])

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'University structure' : 'Структура университета'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/about/structure' : '/about/structure',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'University structure' : 'Структура университета')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'About the university' : 'Об университете'"
    />

    <section class="section">
      <div class="container">
        <div class="grid grid--3">
          <NuxtLink v-for="group in groups" :key="group.type" :to="localePath(`/about/structure/${group.type}`)" class="structure-card">
            <span class="structure-card__icon"><i :class="`pi ${group.icon}`" aria-hidden="true" /></span>
            <span class="structure-card__title">{{ group.label }}</span>
            <span class="structure-card__count">{{ group.count }}</span>
            <span class="link-arrow">{{ t('common.openSection') }}</span>
          </NuxtLink>
        </div>

        <div class="structure-note">
          <p>
            {{
              locale === 'en'
                ? 'The structure includes faculties, institutes, colleges and administrative units. Each unit card contains contacts, leadership and documents.'
                : 'Структура включает факультеты, институты, колледжи и административные подразделения. В карточке каждого подразделения собраны контакты, руководство и документы.'
            }}
          </p>
          <BaseButton :to="localePath('/about/employees')" variant="secondary" size="sm">
            {{ locale === 'en' ? 'Staff directory' : 'Справочник сотрудников' }}
          </BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.structure-card {
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

.structure-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
}

.structure-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  font-size: 1.25rem;
}

.structure-card__title {
  margin-top: 6px;
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
}

.structure-card__count {
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.structure-card .link-arrow {
  margin-top: auto;
  padding-top: 8px;
  font-size: 0.82rem;
}

.structure-note {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.structure-note p {
  max-width: 720px;
  margin: 0;
  color: var(--color-text-muted);
}
</style>
