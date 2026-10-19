<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/admissions')
const faq = getFaq(locale)
const contacts = getContacts(locale)
const admissionsContact = contacts.find((contact) => contact.id === 'admissions') || contacts[0]

const levels = computed(() => [
  { slug: 'bachelor', title: locale === 'en' ? "Bachelor's" : 'Бакалавриат', text: locale === 'en' ? 'Four-year programmes for school leavers.' : 'Четырёхлетние программы для выпускников школ.', icon: 'pi-graduation-cap' },
  { slug: 'specialist', title: locale === 'en' ? "Specialist's" : 'Специалитет', text: locale === 'en' ? 'Five-year engineering and maritime programmes.' : 'Пятилетние инженерные и морские программы.', icon: 'pi-compass' },
  { slug: 'master', title: locale === 'en' ? "Master's" : 'Магистратура', text: locale === 'en' ? 'Two-year programmes for graduates.' : 'Двухлетние программы для выпускников вузов.', icon: 'pi-chart-line' },
  { slug: 'graduate', title: locale === 'en' ? 'Postgraduate' : 'Аспирантура', text: locale === 'en' ? 'Research training and doctoral study.' : 'Подготовка исследователей и докторантура.', icon: 'pi-lightbulb' },
  { slug: 'college', title: locale === 'en' ? 'Vocational' : 'СПО', text: locale === 'en' ? 'College programmes after school.' : 'Программы колледжей после школы.', icon: 'pi-book' },
  { slug: 'dpo', title: locale === 'en' ? 'CPD' : 'ДПО', text: locale === 'en' ? 'Continuing education and advanced training.' : 'Дополнительное образование и повышение квалификации.', icon: 'pi-refresh' },
  { slug: 'international', title: locale === 'en' ? 'International' : 'Иностранцам', text: locale === 'en' ? 'Admission for international citizens.' : 'Поступление для иностранных граждан.', icon: 'pi-globe' }
])

const steps = computed(() => [
  locale === 'en' ? 'Choose a programme in the catalogue' : 'Выберите программу в каталоге',
  locale === 'en' ? 'Check entrance examinations and deadlines' : 'Проверьте вступительные испытания и сроки',
  locale === 'en' ? 'Prepare the document package' : 'Подготовьте пакет документов',
  locale === 'en' ? 'Apply through the applicant portal' : 'Подайте заявление через личный кабинет',
  locale === 'en' ? 'Track the competition lists' : 'Следите за конкурсными списками'
])

const quickLinks = computed(() => [
  { title: locale === 'en' ? 'Rules' : 'Правила приёма', path: '/admissions/rules' },
  { title: locale === 'en' ? 'Dates' : 'Сроки и этапы', path: '/admissions/dates' },
  { title: locale === 'en' ? 'Exams' : 'Вступительные испытания', path: '/admissions/exams' },
  { title: locale === 'en' ? 'Tuition' : 'Стоимость обучения', path: '/admissions/tuition' },
  { title: locale === 'en' ? 'Dormitory' : 'Общежитие', path: '/admissions/dormitory' },
  { title: locale === 'en' ? 'Targeted training' : 'Целевое обучение', path: '/admissions/target' }
])

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Admissions' : 'Поступление'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/admissions' : '/admissions',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Admissions' : 'Поступление')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Admissions campaign 2026' : 'Приёмная кампания 2026'"
      variant="navy"
    >
      <template #actions>
        <BaseButton :to="localePath('/admissions/apply')" size="lg">{{ t('page.admissions.cta') }}</BaseButton>
        <BaseButton :to="localePath('/education/programs')" variant="light" size="lg">
          {{ t('home.ctaPrograms') }}
        </BaseButton>
      </template>
    </PageHeader>

    <section class="section admissions-alert-wrap">
      <div class="container">
        <div class="admissions-alert">
          <i class="pi pi-calendar" aria-hidden="true" />
          <div>
            <strong>{{ locale === 'en' ? 'Applications open on 20 June 2026' : 'Приём документов открывается 20 июня 2026 года' }}</strong>
            <p>
              {{
                locale === 'en'
                  ? 'Check the programme, entrance examinations and deadlines before applying. The admissions office is open every day during the campaign.'
                  : 'Проверьте программу, вступительные испытания и сроки до подачи заявления. В период кампании приёмная комиссия работает ежедневно.'
              }}
            </p>
          </div>
          <BaseButton :to="localePath('/admissions/dates')" variant="secondary" size="sm">
            {{ locale === 'en' ? 'Dates' : 'Сроки' }}
          </BaseButton>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'Study levels' : 'Уровни подготовки' }}</p>
            <h2>{{ locale === 'en' ? 'Choose your path' : 'Выберите свой путь' }}</h2>
          </div>
          <p>
            {{
              locale === 'en'
                ? 'Each level has its own rules, deadlines and documents. Start with the level that matches your current education.'
                : 'У каждого уровня свои правила, сроки и документы. Начните с уровня, который соответствует вашему образованию.'
            }}
          </p>
        </div>
        <div class="grid grid--4">
          <NuxtLink
            v-for="level in levels"
            :key="level.slug"
            :to="localePath(`/admissions/${level.slug}`)"
            class="level-card"
          >
            <span class="level-card__icon"><i :class="`pi ${level.icon}`" aria-hidden="true" /></span>
            <span class="level-card__title">{{ level.title }}</span>
            <span class="level-card__text">{{ level.text }}</span>
            <span class="level-card__arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section section--subtle">
      <div class="container admissions-process">
        <div>
          <p class="eyebrow">{{ locale === 'en' ? 'How to apply' : 'Как поступить' }}</p>
          <h2>{{ locale === 'en' ? 'Five steps to the university' : 'Пять шагов до университета' }}</h2>
          <ol class="process-list">
            <li v-for="(step, index) in steps" :key="step">
              <span class="process-list__number">{{ index + 1 }}</span>
              <span>{{ step }}</span>
            </li>
          </ol>
          <div class="process-actions">
            <BaseButton :to="localePath('/admissions/apply')">{{ t('page.admissions.cta') }}</BaseButton>
            <BaseButton :to="localePath('/admissions/faq')" variant="secondary">{{ t('page.admissions.consult') }}</BaseButton>
          </div>
        </div>
        <aside class="quick-links">
          <h3>{{ locale === 'en' ? 'Quick links' : 'Быстрые ссылки' }}</h3>
          <NuxtLink v-for="link in quickLinks" :key="link.path" :to="localePath(link.path)">
            {{ link.title }}
            <i class="pi pi-arrow-right" aria-hidden="true" />
          </NuxtLink>
          <div class="quick-links__contact">
            <span>{{ locale === 'en' ? 'Admissions office' : 'Приёмная комиссия' }}</span>
            <a href="tel:+78617717525">+7 (8617) 71-75-25</a>
            <a href="mailto:pcom@nsma.ru">pcom@nsma.ru</a>
          </div>
        </aside>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'FAQ' : 'Вопросы и ответы' }}</p>
            <h2>{{ locale === 'en' ? 'Frequently asked questions' : 'Частые вопросы' }}</h2>
          </div>
          <BaseButton :to="localePath('/admissions/faq')" variant="secondary" size="sm">
            {{ locale === 'en' ? 'All questions' : 'Все вопросы' }}
          </BaseButton>
        </div>
        <div class="faq-list">
          <details v-for="item in faq.slice(0, 5)" :key="item.id" class="faq-item">
            <summary>{{ item.question }}</summary>
            <div class="faq-item__answer">
              <ContentRenderer :blocks="item.answer" />
            </div>
          </details>
        </div>
      </div>
    </section>

    <section v-if="admissionsContact" class="section section--subtle">
      <div class="container contact-banner">
        <div>
          <p class="eyebrow">{{ locale === 'en' ? 'Still have questions?' : 'Остались вопросы?' }}</p>
          <h2>{{ locale === 'en' ? 'Talk to the admissions office' : 'Поговорите с приёмной комиссией' }}</h2>
          <p>{{ admissionsContact.address }}</p>
        </div>
        <dl>
          <div>
            <dt>{{ t('common.phone') }}</dt>
            <dd>
              <a :href="`tel:${admissionsContact.phones[0].replace(/[^\d+]/g, '')}`">{{ admissionsContact.phones[0] }}</a>
            </dd>
          </div>
          <div>
            <dt>{{ t('common.email') }}</dt>
            <dd><a :href="`mailto:${admissionsContact.emails[0]}`">{{ admissionsContact.emails[0] }}</a></dd>
          </div>
          <div>
            <dt>{{ t('common.workingHours') }}</dt>
            <dd>{{ admissionsContact.workingHours }}</dd>
          </div>
        </dl>
        <BaseButton :to="localePath('/contacts/feedback')" variant="secondary">
          {{ locale === 'en' ? 'Write to us' : 'Написать нам' }}
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.admissions-alert-wrap {
  padding-block: var(--space-5);
}

.admissions-alert {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-accent-600);
  border-radius: var(--radius-lg);
  background: var(--color-accent-100);
}

.admissions-alert > .pi {
  flex: 0 0 auto;
  color: var(--color-accent-700);
  font-size: 1.6rem;
}

.admissions-alert > div {
  flex: 1 1 420px;
}

.admissions-alert strong {
  display: block;
  color: #5c3d04;
  font-size: 0.98rem;
}

.admissions-alert p {
  margin: 4px 0 0;
  color: #6f5213;
  font-size: 0.84rem;
}

.level-card {
  display: flex;
  flex-direction: column;
  gap: 9px;
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

.level-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
}

.level-card__icon {
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

.level-card__title {
  margin-top: 4px;
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.16rem;
  font-weight: 700;
}

.level-card__text {
  color: var(--color-text-muted);
  font-size: 0.83rem;
}

.level-card__arrow {
  margin-top: auto;
  padding-top: 6px;
  color: var(--color-accent-700);
  font-weight: 700;
}

.admissions-process {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 340px;
  gap: var(--space-7);
  align-items: start;
}

.process-list {
  display: grid;
  gap: var(--space-3);
  margin: var(--space-5) 0;
  padding: 0;
  list-style: none;
  counter-reset: none;
}

.process-list li {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  font-weight: 600;
}

.process-list__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 50%;
  background: var(--color-primary-900);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
}

.process-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-links {
  position: sticky;
  top: 130px;
  display: flex;
  flex-direction: column;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
}

.quick-links h3 {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.quick-links > a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
}

.quick-links > a:hover {
  color: var(--color-primary-700);
}

.quick-links > a .pi {
  color: var(--color-border-strong);
  font-size: 0.7rem;
}

.quick-links__contact {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.quick-links__contact span {
  color: var(--color-text-muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.quick-links__contact a {
  color: var(--color-primary-700);
  font-weight: 700;
  text-decoration: none;
}

.faq-list {
  border-top: 1px solid var(--color-border);
}

.faq-item {
  border-bottom: 1px solid var(--color-border);
}

.faq-item summary {
  padding: 18px 4px;
  color: var(--color-primary-900);
  font-weight: 700;
  cursor: pointer;
}

.faq-item summary::marker {
  color: var(--color-accent-600);
}

.faq-item__answer {
  padding: 0 4px 18px;
}

.contact-banner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: var(--space-6);
  align-items: center;
}

.contact-banner p {
  margin: 0;
  color: var(--color-text-muted);
}

.contact-banner dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.contact-banner dt {
  color: var(--color-text-muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.contact-banner dd {
  margin: 1px 0 0;
  font-weight: 700;
}

.contact-banner dd a {
  color: var(--color-primary-700);
  text-decoration: none;
}

@media (max-width: 1023px) {
  .admissions-process,
  .contact-banner {
    grid-template-columns: 1fr;
  }

  .quick-links {
    position: static;
  }
}
</style>
