<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/education/schedule')
const services = getExternalServices()
const schedule = services.find((service) => service.key === 'schedule')
const scheduleUrl = schedule?.url || 'https://conference.aumsu.ru/'

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Timetable' : 'Расписание занятий'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/education/schedule' : '/education/schedule',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Timetable' : 'Расписание занятий')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Education' : 'Образование'"
    />

    <section class="section">
      <div class="container">
        <div class="schedule-note">
          <i class="pi pi-info-circle" aria-hidden="true" />
          <p>
            {{
              locale === 'en'
                ? 'The timetable is provided by an external university service. If the embedded page does not load, use the direct link below.'
                : 'Расписание предоставляется внешним сервисом университета. Если встроенная страница не загружается, воспользуйтесь прямой ссылкой ниже.'
            }}
          </p>
        </div>

        <div class="embed">
          <iframe
            :src="scheduleUrl"
            :title="locale === 'en' ? 'University timetable' : 'Расписание занятий университета'"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          />
        </div>

        <div class="schedule-actions">
          <BaseButton :href="scheduleUrl" variant="secondary">
            {{ locale === 'en' ? 'Open timetable in a new tab' : 'Открыть расписание в новой вкладке' }}
          </BaseButton>
          <BaseButton :to="localePath('/contacts')" variant="ghost">{{ t('common.contacts') }}</BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.schedule-note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: var(--space-5);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
}

.schedule-note p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

.embed {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.embed iframe {
  display: block;
  width: 100%;
  min-height: 620px;
  border: 0;
}

.schedule-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: var(--space-4);
}
</style>
