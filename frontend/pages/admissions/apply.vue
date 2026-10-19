<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/admissions/apply')
const services = getExternalServices()
const portal = services.find((service) => service.key === 'lkabit')

const steps = computed(() => [
  {
    title: locale === 'en' ? 'Register in the applicant portal' : 'Зарегистрируйтесь в личном кабинете',
    text: locale === 'en' ? 'Create an account with your email address and confirm it.' : 'Создайте аккаунт по адресу электронной почты и подтвердите его.'
  },
  {
    title: locale === 'en' ? 'Fill in the application' : 'Заполните заявление',
    text: locale === 'en' ? 'Choose the study level, programme and study form.' : 'Выберите уровень подготовки, направление и форму обучения.'
  },
  {
    title: locale === 'en' ? 'Upload documents' : 'Загрузите документы',
    text: locale === 'en' ? 'Attach your passport, education document and confirmations of individual achievements.' : 'Прикрепите паспорт, документ об образовании и подтверждения индивидуальных достижений.'
  },
  {
    title: locale === 'en' ? 'Submit and track' : 'Отправьте и следите за статусом',
    text: locale === 'en' ? 'Submit the application and follow the status in your personal account.' : 'Отправьте заявление и следите за статусом в личном кабинете.'
  }
])

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Apply online' : 'Подать документы'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/admissions/apply' : '/admissions/apply',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Apply online' : 'Подать документы')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Admissions 2026' : 'Приёмная кампания 2026'"
      variant="navy"
    >
      <template #actions>
        <BaseButton v-if="portal" :href="portal.url" size="lg">
          {{ t('page.admissions.cta') }}
          <i class="pi pi-external-link" aria-hidden="true" />
        </BaseButton>
        <BaseButton :to="localePath('/admissions/rules')" variant="light" size="lg">
          {{ locale === 'en' ? 'Admission rules' : 'Правила приёма' }}
        </BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container apply-layout">
        <div>
          <div class="apply-alert">
            <DemoNotice :text="locale === 'en' ? 'Demo mode: the link opens the external university service. No real application is submitted in this demo.' : 'Демо-режим: ссылка ведёт на внешний сервис университета. В демонстрационной версии реальная подача документов не выполняется.'" />
          </div>

          <h2>{{ locale === 'en' ? 'How the application works' : 'Как проходит подача' }}</h2>
          <ol class="apply-steps">
            <li v-for="(step, index) in steps" :key="step.title">
              <span class="apply-steps__number">{{ index + 1 }}</span>
              <div>
                <strong>{{ step.title }}</strong>
                <p>{{ step.text }}</p>
              </div>
            </li>
          </ol>

          <h2>{{ locale === 'en' ? 'What to prepare' : 'Что подготовить' }}</h2>
          <ul class="apply-checklist">
            <li>{{ locale === 'en' ? 'Passport or identity document' : 'Паспорт или документ, удостоверяющий личность' }}</li>
            <li>{{ locale === 'en' ? 'Education certificate / diploma' : 'Документ об образовании' }}</li>
            <li>{{ locale === 'en' ? 'Insurance number (if available)' : 'СНИЛС (при наличии)' }}</li>
            <li>{{ locale === 'en' ? 'Documents confirming individual achievements' : 'Документы, подтверждающие индивидуальные достижения' }}</li>
            <li>{{ locale === 'en' ? 'Photograph (if required)' : 'Фотография (при необходимости)' }}</li>
          </ul>

          <div v-if="portal" class="apply-portal">
            <div>
              <strong>{{ portal.title }}</strong>
              <span>{{ locale === 'en' ? 'Registration and application' : 'Регистрация и подача заявления' }}</span>
            </div>
            <BaseButton :href="portal.url">{{ locale === 'en' ? 'Open portal' : 'Открыть портал' }}</BaseButton>
          </div>
        </div>

        <aside class="apply-aside">
          <h2>{{ locale === 'en' ? 'Need help?' : 'Нужна помощь?' }}</h2>
          <p>
            {{
              locale === 'en'
                ? 'Contact the admissions office if you have technical difficulties or questions about documents.'
                : 'Обратитесь в приёмную комиссию, если возникли технические сложности или вопросы по документам.'
            }}
          </p>
          <a href="tel:+78617717525" class="apply-aside__phone">+7 (8617) 71-75-25</a>
          <a href="mailto:pcom@nsma.ru">pcom@nsma.ru</a>
          <BaseButton :to="localePath('/contacts/feedback')" variant="secondary" size="sm">{{ locale === 'en' ? 'Write to us' : 'Написать нам' }}</BaseButton>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.apply-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-7);
  align-items: start;
}

.apply-alert {
  margin-bottom: var(--space-5);
}

.apply-steps {
  display: grid;
  gap: var(--space-4);
  margin: var(--space-5) 0 var(--space-7);
  padding: 0;
  list-style: none;
}

.apply-steps li {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin: 0;
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
}

.apply-steps__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 50%;
  background: var(--color-primary-900);
  color: #fff;
  font-weight: 800;
}

.apply-steps strong {
  display: block;
  margin-bottom: 2px;
}

.apply-steps p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

.apply-checklist {
  display: grid;
  gap: 6px;
  color: var(--color-text-muted);
}

.apply-portal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-primary-900);
  color: #fff;
}

.apply-portal div {
  display: flex;
  flex-direction: column;
}

.apply-portal span {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.82rem;
}

.apply-aside {
  position: sticky;
  top: 130px;
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}

.apply-aside h2 {
  font-family: var(--font-sans);
  font-size: 1rem;
}

.apply-aside p {
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

.apply-aside a {
  display: block;
  margin-bottom: 4px;
  color: var(--color-primary-700);
  font-weight: 700;
  text-decoration: none;
}

.apply-aside__phone {
  font-size: 1.1rem;
}

.apply-aside :deep(.btn) {
  margin-top: var(--space-3);
}

@media (max-width: 1023px) {
  .apply-layout {
    grid-template-columns: 1fr;
  }

  .apply-aside {
    position: static;
  }
}
</style>
