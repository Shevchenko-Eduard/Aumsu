<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/student-life')
const events = getEvents(locale).slice(0, 4)

const cards = computed(() => [
  { path: '/student-life/events', title: locale === 'en' ? 'Events' : 'События', text: locale === 'en' ? 'Calendar of university events.' : 'Календарь событий университета.', icon: 'pi-calendar' },
  { path: '/student-life/culture', title: locale === 'en' ? 'Culture' : 'Культура', text: locale === 'en' ? 'Creative groups and concerts.' : 'Творческие коллективы и концерты.', icon: 'pi-star' },
  { path: '/student-life/sport', title: locale === 'en' ? 'Sport' : 'Спорт', text: locale === 'en' ? 'Sports sections and competitions.' : 'Спортивные секции и соревнования.', icon: 'pi-heart' },
  { path: '/student-life/organizations', title: locale === 'en' ? 'Organisations' : 'Молодёжные организации', text: locale === 'en' ? 'Student clubs and associations.' : 'Студенческие клубы и объединения.', icon: 'pi-users' },
  { path: '/student-life/dormitory', title: locale === 'en' ? 'Dormitory' : 'Общежитие', text: locale === 'en' ? 'Accommodation rules and contacts.' : 'Правила проживания и контакты.', icon: 'pi-home' },
  { path: '/student-life/scholarships', title: locale === 'en' ? 'Scholarships' : 'Стипендии', text: locale === 'en' ? 'Scholarships and support measures.' : 'Стипендии и меры поддержки.', icon: 'pi-money-bill' },
  { path: '/student-life/support', title: locale === 'en' ? 'Support' : 'Социальная поддержка', text: locale === 'en' ? 'Help for students in difficult situations.' : 'Помощь студентам в сложных ситуациях.', icon: 'pi-heart-fill' },
  { path: '/student-life/accessibility', title: locale === 'en' ? 'Accessibility' : 'Доступная среда', text: locale === 'en' ? 'Support for students with disabilities.' : 'Поддержка студентов с ОВЗ.', icon: 'accessible' },
  { path: '/student-life/career', title: locale === 'en' ? 'Careers' : 'Практика и карьера', text: locale === 'en' ? 'Internships and vacancies.' : 'Практика, стажировки и вакансии.', icon: 'pi-briefcase' }
])

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Student life' : 'Студенческая жизнь'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/student-life' : '/student-life',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Student life' : 'Студенческая жизнь')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'More than study' : 'Больше, чем учёба'"
      variant="navy"
    >
      <template #actions>
        <BaseButton :to="localePath('/student-life/events')" variant="light">{{ locale === 'en' ? 'Events calendar' : 'Календарь событий' }}</BaseButton>
        <BaseButton :to="localePath('/student-life/scholarships')" variant="light">{{ locale === 'en' ? 'Scholarships' : 'Стипендии' }}</BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container">
        <div class="grid grid--3">
          <NuxtLink v-for="card in cards" :key="card.path" :to="localePath(card.path)" class="life-card">
            <span class="life-card__icon">
              <svg
                v-if="card.icon === 'accessible'"
                class="life-card__svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 7.5c1.86.5 4 .83 6 1v13h2v-6h2v6h2V8.5c2-.17 4.14-.5 6-1l-.5-1.5zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
              </svg>
              <i v-else :class="`pi ${card.icon}`" aria-hidden="true" />
            </span>
            <span class="life-card__title">{{ card.title }}</span>
            <span class="life-card__text">{{ card.text }}</span>
            <span class="link-arrow">{{ t('common.readMore') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section section--subtle">
      <div class="container life-events">
        <div>
          <div class="section-head">
            <div>
              <p class="eyebrow">{{ t('home.eventsTitle') }}</p>
              <h2>{{ t('home.eventsTitle') }}</h2>
            </div>
            <BaseButton :to="localePath('/student-life/events')" variant="secondary" size="sm">{{ t('home.allEvents') }}</BaseButton>
          </div>
          <div class="event-list">
            <EventCard v-for="event in events" :key="event.id" :event="event" />
          </div>
        </div>

        <aside class="support-card">
          <p class="eyebrow">{{ locale === 'en' ? 'Support' : 'Поддержка' }}</p>
          <h2>{{ locale === 'en' ? 'We are here for you' : 'Мы рядом' }}</h2>
          <p>
            {{
              locale === 'en'
                ? 'The university provides social support, accessible environment and help for students with disabilities.'
                : 'Университет обеспечивает социальную поддержку, доступную среду и помощь студентам с ОВЗ.'
            }}
          </p>
          <BaseButton :to="localePath('/student-life/support')" variant="secondary">{{ locale === 'en' ? 'Support measures' : 'Меры поддержки' }}</BaseButton>
          <BaseButton :to="localePath('/student-life/accessibility')" variant="ghost">{{ locale === 'en' ? 'Accessible environment' : 'Доступная среда' }}</BaseButton>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.life-card {
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

.life-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
}

.life-card__icon {
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

.life-card__svg {
  width: 23px;
  height: 23px;
}

.life-card__title {
  margin-top: 4px;
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.12rem;
  font-weight: 700;
}

.life-card__text {
  color: var(--color-text-muted);
  font-size: 0.84rem;
}

.life-card .link-arrow {
  margin-top: auto;
  padding-top: 8px;
  font-size: 0.82rem;
}

.life-events {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  gap: var(--space-7);
  align-items: start;
}

.event-list {
  border-top: 1px solid var(--color-border);
}

.support-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-primary-900);
  color: rgba(255, 255, 255, 0.78);
}

.support-card h2 {
  color: #fff;
}

.support-card p {
  font-size: 0.9rem;
}

.support-card :deep(.btn--secondary) {
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.support-card :deep(.btn--secondary:hover) {
  background: rgba(255, 255, 255, 0.12);
}

.support-card :deep(.btn--ghost) {
  color: #fff;
}

@media (max-width: 1023px) {
  .life-events {
    grid-template-columns: 1fr;
  }
}
</style>
