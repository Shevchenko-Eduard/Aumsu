<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/education')
const programs = getPrograms(locale)

const levels = computed(() => [
  { slug: 'bachelor', title: locale === 'en' ? "Bachelor's" : 'Бакалавриат', count: programs.filter((item) => item.level === 'bachelor').length },
  { slug: 'specialist', title: locale === 'en' ? "Specialist's" : 'Специалитет', count: programs.filter((item) => item.level === 'specialist').length },
  { slug: 'master', title: locale === 'en' ? "Master's" : 'Магистратура', count: programs.filter((item) => item.level === 'master').length },
  { slug: 'graduate', title: locale === 'en' ? 'Postgraduate' : 'Аспирантура', count: programs.filter((item) => item.level === 'graduate').length },
  { slug: 'college', title: locale === 'en' ? 'Colleges' : 'Колледжи', count: programs.filter((item) => item.level === 'college').length },
  { slug: 'dpo', title: locale === 'en' ? 'CPD' : 'ДПО', count: 0 }
])

const popular = computed(() => programs.filter((item) => ['bachelor', 'specialist'].includes(item.level)).slice(4, 10))

const links = computed(() => [
  { title: locale === 'en' ? 'Timetable' : 'Расписание занятий', path: '/education/schedule', icon: 'pi-calendar' },
  { title: locale === 'en' ? 'Library' : 'Библиотека', path: '/education/library', icon: 'pi-book' },
  { title: locale === 'en' ? 'Legal clinic' : 'Юридическая клиника', path: '/education/legal-clinic', icon: 'pi-briefcase' },
  { title: locale === 'en' ? 'Academic mobility' : 'Академическая мобильность', path: '/education/mobility', icon: 'pi-globe' },
  { title: locale === 'en' ? 'Distance learning' : 'Заочное и дистанционное обучение', path: '/education/distance', icon: 'pi-desktop' },
  { title: locale === 'en' ? 'Learning materials' : 'Методические материалы', path: '/education/methodical', icon: 'pi-folder' }
])

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Education' : 'Образование'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/education' : '/education',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Education' : 'Образование')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Learning at the university' : 'Обучение в университете'"
      variant="navy"
    >
      <template #actions>
        <BaseButton :to="localePath('/education/programs')" size="lg">{{ t('home.allPrograms') }}</BaseButton>
        <BaseButton :to="localePath('/admissions')" variant="light" size="lg">{{ t('nav.apply') }}</BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'Study levels' : 'Уровни подготовки' }}</p>
            <h2>{{ locale === 'en' ? 'Programmes for every stage' : 'Программы для каждого этапа' }}</h2>
          </div>
          <p>{{ locale === 'en' ? 'From vocational education to postgraduate research — all programmes are collected in one catalogue.' : 'От среднего профессионального образования до аспирантуры — все программы собраны в одном каталоге.' }}</p>
        </div>
        <div class="grid grid--3">
          <NuxtLink v-for="level in levels" :key="level.slug" :to="localePath(`/education/${level.slug}`)" class="level-row">
            <span class="level-row__title">{{ level.title }}</span>
            <span class="level-row__count">{{ level.count }} {{ locale === 'en' ? 'programmes' : 'программ' }}</span>
            <i class="pi pi-arrow-up-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section section--subtle">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ t('home.programsTitle') }}</p>
            <h2>{{ locale === 'en' ? 'Popular programmes' : 'Популярные программы' }}</h2>
          </div>
          <BaseButton :to="localePath('/education/programs')" variant="secondary" size="sm">{{ t('home.allPrograms') }}</BaseButton>
        </div>
        <div class="grid grid--3">
          <ProgramCard v-for="program in popular" :key="program.id" :program="program" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'Student services' : 'Студенческие сервисы' }}</p>
            <h2>{{ locale === 'en' ? 'Beyond the classroom' : 'Не только аудитории' }}</h2>
          </div>
        </div>
        <div class="grid grid--3">
          <NuxtLink v-for="link in links" :key="link.path" :to="localePath(link.path)" class="service-card">
            <span class="service-card__icon"><i :class="`pi ${link.icon}`" aria-hidden="true" /></span>
            <span>{{ link.title }}</span>
            <i class="pi pi-arrow-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.level-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  text-decoration: none;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.level-row:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.level-row__title {
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
}

.level-row__count {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.level-row .pi {
  margin-left: auto;
  color: var(--color-accent-700);
  font-size: 0.82rem;
}

.service-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  color: var(--color-text);
  font-weight: 650;
  text-decoration: none;
}

.service-card:hover {
  border-color: var(--color-primary-200);
  color: var(--color-primary-700);
}

.service-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 10px;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.service-card > .pi:last-child {
  margin-left: auto;
  color: var(--color-border-strong);
  font-size: 0.78rem;
}
</style>
