<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/contacts/feedback')

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Feedback' : 'Обратная связь'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/contacts/feedback' : '/contacts/feedback',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Feedback' : 'Обратная связь')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Contacts' : 'Контакты'"
    />

    <section class="section">
      <div class="container feedback-layout">
        <div>
          <h2>{{ locale === 'en' ? 'Write to us' : 'Напишите нам' }}</h2>
          <p class="muted">
            {{
              locale === 'en'
                ? 'Fill in the form and we will route your message to the relevant department. Fields marked with an asterisk are required.'
                : 'Заполните форму, и мы передадим обращение в профильное подразделение. Поля со звёздочкой обязательны.'
            }}
          </p>
          <ContactForm />
        </div>

        <aside class="feedback-aside">
          <h2>{{ t('common.contacts') }}</h2>
          <dl>
            <div>
              <dt>{{ t('common.address') }}</dt>
              <dd>{{ t('footer.address') }}</dd>
            </div>
            <div>
              <dt>{{ t('common.phone') }}</dt>
              <dd><a href="tel:+78617717525">+7 (8617) 71-75-25</a></dd>
            </div>
            <div>
              <dt>{{ t('common.email') }}</dt>
              <dd><a href="mailto:mail@nsma.ru">mail@nsma.ru</a></dd>
            </div>
            <div>
              <dt>{{ t('common.workingHours') }}</dt>
              <dd>{{ locale === 'en' ? 'Mon–Fri, 8:30–17:00' : 'Пн–Пт, 8:30–17:00' }}</dd>
            </div>
          </dl>
          <NuxtLink :to="localePath('/contacts')" class="link-arrow">{{ t('common.contacts') }}</NuxtLink>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.feedback-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-7);
  align-items: start;
}

.feedback-aside {
  position: sticky;
  top: 130px;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.feedback-aside h2 {
  font-family: var(--font-sans);
  font-size: 1rem;
}

.feedback-aside dl {
  display: grid;
  gap: 12px;
  margin: 0 0 var(--space-4);
}

.feedback-aside dt {
  color: var(--color-text-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.feedback-aside dd {
  margin: 2px 0 0;
  font-size: 0.86rem;
}

.feedback-aside a {
  color: var(--color-primary-700);
  text-decoration: none;
}

@media (max-width: 1023px) {
  .feedback-layout {
    grid-template-columns: 1fr;
  }

  .feedback-aside {
    position: static;
  }
}
</style>
