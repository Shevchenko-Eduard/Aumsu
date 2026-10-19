<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/student-life/events')
const events = getEvents(locale)

const grouped = computed(() => {
  const groups = new Map<string, typeof events>()
  for (const event of events) {
    const key = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { month: 'long', year: 'numeric' }).format(new Date(event.startAt))
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)?.push(event)
  }
  return [...groups.entries()]
})

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Events' : 'События'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/student-life/events' : '/student-life/events',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Events' : 'События')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Student life' : 'Студенческая жизнь'"
    />

    <section class="section">
      <div class="container">
        <div v-for="[month, items] in grouped" :key="month" class="events-month">
          <h2>{{ month }}</h2>
          <div class="event-list">
            <EventCard v-for="event in items" :key="event.id" :event="event" />
          </div>
        </div>
        <div v-if="!grouped.length" class="empty-state">
          <p>{{ t('common.noResults') }}</p>
        </div>
        <div class="events-more">
          <BaseButton :to="localePath('/news')" variant="secondary">{{ t('home.allNews') }}</BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.events-month {
  margin-bottom: var(--space-7);
}

.events-month h2 {
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  text-transform: capitalize;
}

.event-list {
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-3);
}

.events-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}

.empty-state {
  padding: var(--space-8);
  text-align: center;
}
</style>
