<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()

const site = getSite(locale)
const news = getNews(locale).slice(0, 3)
const events = getEvents(locale).slice(0, 4)
const programs = getPrograms(locale)
  .filter((program) => ['bachelor', 'specialist'].includes(program.level))
  .slice(0, 6)
const contacts = getContacts(locale)

const audienceCards = computed(() => [
  {
    key: 'applicant',
    title: t('home.audiences.applicant'),
    text: locale === 'en' ? 'Programmes, admission rules, deadlines and application.' : 'Программы, правила приёма, сроки и подача документов.',
    path: '/admissions',
    icon: 'pi-graduation-cap'
  },
  {
    key: 'student',
    title: t('home.audiences.student'),
    text: locale === 'en' ? 'Timetable, library, scholarships and student life.' : 'Расписание, библиотека, стипендии и студенческая жизнь.',
    path: '/student-life',
    icon: 'pi-book'
  },
  {
    key: 'staff',
    title: t('home.audiences.staff'),
    text: locale === 'en' ? 'Structure, documents, staff directory and services.' : 'Структура, документы, справочник сотрудников и сервисы.',
    path: '/about/employees',
    icon: 'pi-users'
  },
  {
    key: 'alumni',
    title: t('home.audiences.alumni'),
    text: locale === 'en' ? 'Careers, events and alumni community.' : 'Карьера, события и сообщество выпускников.',
    path: '/student-life/career',
    icon: 'pi-briefcase'
  }
])

const stats = computed(() => [
  { value: '56', label: locale === 'en' ? 'degree programmes' : 'образовательных программ' },
  { value: '434', label: locale === 'en' ? 'teachers and staff' : 'преподавателя и сотрудника' },
  { value: '31', label: locale === 'en' ? 'faculties, institutes and offices' : 'подразделение' },
  { value: '1975', label: locale === 'en' ? 'year founded' : 'год основания' }
])

const admissionsContact = computed(() => contacts.find((contact) => contact.id === 'admissions') || contacts[0])

usePageSeo({
  title: locale === 'en' ? 'Admiral Ushakov Maritime State University' : 'ГМУ им. адм. Ф.Ф. Ушакова — официальный сайт',
  description:
    locale === 'en'
      ? 'Admission, degree programmes, research and student life at Admiral Ushakov Maritime State University.'
      : 'Поступление, программы обучения, наука и студенческая жизнь в Государственном морском университете имени адмирала Ф.Ф. Ушакова.',
  path: locale === 'en' ? '/en' : '/',
  jsonLd: [
    organizationJsonLd(),
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.siteName,
      url: site.siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${site.siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  ]
})
</script>

<template>
  <div>
    <section class="home-hero">
      <div class="home-hero__pattern" aria-hidden="true" />
      <div class="container home-hero__inner">
        <div class="home-hero__content">
          <p class="eyebrow">{{ t('home.eyebrow') }}</p>
          <h1>{{ t('home.heroTitle') }}</h1>
          <p class="home-hero__text">{{ t('home.heroText') }}</p>
          <div class="home-hero__actions">
            <BaseButton :to="localePath('/admissions')" size="lg">{{ t('home.ctaAdmissions') }}</BaseButton>
            <BaseButton :to="localePath('/education/programs')" variant="light" size="lg">
              {{ t('home.ctaPrograms') }}
            </BaseButton>
          </div>
          <ul class="home-hero__trust">
            <li><i class="pi pi-verified" aria-hidden="true" /> {{ locale === 'en' ? 'State diploma' : 'Государственный диплом' }}</li>
            <li><i class="pi pi-building" aria-hidden="true" /> {{ locale === 'en' ? 'Novorossiysk, 93 Prospekt Lenina' : 'Новороссийск, пр. Ленина, 93' }}</li>
          </ul>
        </div>

        <div class="home-hero__visual" aria-hidden="true">
          <div class="hero-medallion">
            <div class="hero-medallion__ring" />
            <img src="/media/logo.svg" alt="" width="180" height="180" />
          </div>
          <div class="hero-float hero-float--top">
            <span class="hero-float__value">50+</span>
            <span class="hero-float__label">{{ locale === 'en' ? 'programmes' : 'программ' }}</span>
          </div>
          <div class="hero-float hero-float--bottom">
            <i class="pi pi-compass" />
            <span class="hero-float__label">{{ locale === 'en' ? 'Maritime traditions' : 'Морские традиции' }}<br />{{ locale === 'en' ? 'since 1975' : 'с 1975 года' }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section home-quick">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ t('home.audiencesTitle') }}</p>
            <h2>{{ t('home.quickTitle') }}</h2>
          </div>
          <p>{{ t('home.quickText') }}</p>
        </div>
        <div class="grid grid--4">
          <NuxtLink
            v-for="card in audienceCards"
            :key="card.key"
            :to="localePath(card.path)"
            class="quick-card"
          >
            <span class="quick-card__icon"><i :class="`pi ${card.icon}`" aria-hidden="true" /></span>
            <span class="quick-card__title">{{ card.title }}</span>
            <span class="quick-card__text">{{ card.text }}</span>
            <span class="quick-card__arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="stats-band">
      <div class="container">
        <p class="stats-band__title">{{ t('home.statsTitle') }}</p>
        <dl class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat">
            <dt class="stat__value">{{ stat.value }}</dt>
            <dd class="stat__label">{{ stat.label }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ t('home.newsTitle') }}</p>
            <h2>{{ locale === 'en' ? 'Latest updates' : 'Главное за неделю' }}</h2>
          </div>
          <BaseButton :to="localePath('/news')" variant="secondary" size="sm">{{ t('home.allNews') }}</BaseButton>
        </div>
        <div class="grid grid--3">
          <NewsCard v-for="article in news" :key="article.id" :article="article" />
        </div>
      </div>
    </section>

    <section class="section section--subtle">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ t('home.programsTitle') }}</p>
            <h2>{{ t('home.programsTitle') }}</h2>
          </div>
          <BaseButton :to="localePath('/education/programs')" variant="secondary" size="sm">{{ t('home.allPrograms') }}</BaseButton>
        </div>
        <div class="grid grid--3">
          <ProgramCard v-for="program in programs" :key="program.id" :program="program" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container home-events">
        <div>
          <div class="section-head">
            <div>
              <p class="eyebrow">{{ t('home.eventsTitle') }}</p>
              <h2>{{ t('home.eventsTitle') }}</h2>
            </div>
          </div>
          <div class="event-list">
            <EventCard v-for="event in events" :key="event.id" :event="event" />
          </div>
        </div>

        <aside class="admissions-card">
          <p class="eyebrow">{{ locale === 'en' ? 'Admissions 2026' : 'Приёмная кампания 2026' }}</p>
          <h2>{{ locale === 'en' ? 'Your route to the university starts here' : 'Ваш путь в университет начинается здесь' }}</h2>
          <p>
            {{
              locale === 'en'
                ? 'Choose a programme, check the entrance examinations and submit documents through the applicant portal.'
                : 'Выберите направление, проверьте вступительные испытания и подайте документы через личный кабинет абитуриента.'
            }}
          </p>
          <div class="admissions-card__actions">
            <BaseButton :to="localePath('/admissions/apply')">{{ t('page.admissions.cta') }}</BaseButton>
            <BaseButton :to="localePath('/admissions/faq')" variant="secondary">{{ t('page.admissions.consult') }}</BaseButton>
          </div>
          <dl class="admissions-card__contacts">
            <div>
              <dt>{{ t('common.phone') }}</dt>
              <dd><a href="tel:+78617717525">+7 (8617) 71-75-25</a></dd>
            </div>
            <div>
              <dt>{{ t('common.email') }}</dt>
              <dd><a href="mailto:pcom@nsma.ru">pcom@nsma.ru</a></dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>

    <section class="section section--subtle home-contact">
      <div class="container home-contact__grid">
        <div>
          <p class="eyebrow">{{ t('home.contactsTitle') }}</p>
          <h2>{{ t('home.contactsTitle') }}</h2>
          <p>{{ t('home.contactsText') }}</p>
          <dl class="contact-list">
            <div>
              <dt><i class="pi pi-map-marker" aria-hidden="true" /> {{ t('common.address') }}</dt>
              <dd>{{ t('footer.address') }}</dd>
            </div>
            <div v-if="admissionsContact">
              <dt><i class="pi pi-phone" aria-hidden="true" /> {{ t('common.phone') }}</dt>
              <dd>
                <a :href="`tel:${admissionsContact.phones[0].replace(/[^\d+]/g, '')}`">{{ admissionsContact.phones[0] }}</a>
              </dd>
            </div>
            <div v-if="admissionsContact">
              <dt><i class="pi pi-envelope" aria-hidden="true" /> {{ t('common.email') }}</dt>
              <dd><a :href="`mailto:${admissionsContact.emails[0]}`">{{ admissionsContact.emails[0] }}</a></dd>
            </div>
            <div v-if="admissionsContact?.workingHours">
              <dt><i class="pi pi-clock" aria-hidden="true" /> {{ t('common.workingHours') }}</dt>
              <dd>{{ admissionsContact.workingHours }}</dd>
            </div>
          </dl>
          <div class="home-contact__actions">
            <BaseButton :to="localePath('/contacts')" variant="secondary">{{ t('common.contacts') }}</BaseButton>
            <BaseButton
              href="https://yandex.ru/maps/?text=Новороссийск%20проспект%20Ленина%2093"
              variant="ghost"
            >
              {{ t('home.mapCta') }}
            </BaseButton>
          </div>
        </div>

        <MapEmbed />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 80% 20%, rgba(197, 138, 26, 0.22), transparent 30%),
    linear-gradient(128deg, var(--color-primary-950) 0%, var(--color-primary-800) 62%, var(--color-primary-700) 100%);
  color: #e8f0f7;
}

.home-hero__pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent 85%);
}

.home-hero__inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: var(--space-7);
  align-items: center;
  padding-block: clamp(56px, 7vw, 104px);
}

.home-hero__content {
  max-width: 740px;
}

.home-hero h1 {
  margin-bottom: var(--space-4);
  color: #fff;
  font-size: clamp(2.35rem, 1.7rem + 2.8vw, 3.8rem);
  line-height: 1.08;
}

.home-hero__text {
  max-width: 620px;
  margin-bottom: var(--space-6);
  color: rgba(232, 240, 247, 0.8);
  font-size: clamp(1rem, 0.94rem + 0.35vw, 1.16rem);
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.home-hero__trust {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin: var(--space-6) 0 0;
  padding: 0;
  color: rgba(232, 240, 247, 0.65);
  font-size: 0.8rem;
  list-style: none;
}

.home-hero__trust li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0;
}

.home-hero__trust .pi {
  color: var(--color-accent-500);
}

.home-hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 380px;
}

.hero-medallion {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(310px, 70vw);
  height: min(310px, 70vw);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.14), transparent 58%),
    rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(2px);
}

.hero-medallion::before,
.hero-medallion__ring {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  content: "";
}

.hero-medallion::before {
  inset: -26px;
}

.hero-medallion__ring {
  inset: -58px;
  border-style: dashed;
  opacity: 0.6;
  animation: slow-spin 50s linear infinite;
}

.hero-medallion img {
  width: 58%;
  height: auto;
  filter: brightness(0) invert(1);
  opacity: 0.96;
}

.hero-float {
  position: absolute;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--radius-lg);
  background: rgba(6, 24, 42, 0.6);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
}

.hero-float--top {
  top: 14px;
  right: -6px;
  flex-direction: column;
  gap: 0;
  align-items: flex-start;
}

.hero-float--bottom {
  bottom: 18px;
  left: -10px;
}

.hero-float__value {
  color: var(--color-accent-500);
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.hero-float__label {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.72rem;
  line-height: 1.35;
}

.hero-float .pi {
  color: var(--color-accent-500);
  font-size: 1.4rem;
}

@keyframes slow-spin {
  to {
    transform: rotate(360deg);
  }
}

.home-quick {
  padding-bottom: var(--space-7);
}

.quick-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  color: var(--color-text);
  text-decoration: none;
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    border-color var(--transition);
}

.quick-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary-200);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
}

.quick-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  font-size: 1.35rem;
}

.quick-card__title {
  margin-top: 6px;
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.18rem;
  font-weight: 700;
}

.quick-card__text {
  color: var(--color-text-muted);
  font-size: 0.84rem;
}

.quick-card__arrow {
  margin-top: auto;
  padding-top: 8px;
  color: var(--color-accent-700);
  font-weight: 700;
}

.stats-band {
  padding-block: var(--space-7);
  background: var(--color-primary-900);
  color: #fff;
}

.stats-band__title {
  margin: 0 0 var(--space-5);
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-5);
  margin: 0;
}

.stat {
  padding-left: var(--space-4);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.stat__value {
  color: #fff;
  font-family: var(--font-display);
  font-size: clamp(2rem, 1.5rem + 1.7vw, 3rem);
  font-weight: 700;
  line-height: 1;
}

.stat__label {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.8rem;
}

.home-events {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: var(--space-7);
  align-items: start;
}

.event-list {
  border-top: 1px solid var(--color-border);
}

.admissions-card {
  position: sticky;
  top: 130px;
  padding: clamp(24px, 3vw, 36px);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 90% 8%, rgba(197, 138, 26, 0.35), transparent 35%),
    var(--color-primary-900);
  color: #e8f0f7;
}

.admissions-card h2 {
  color: #fff;
}

.admissions-card p {
  color: rgba(232, 240, 247, 0.75);
  font-size: 0.94rem;
}

.admissions-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-block: var(--space-5);
}

.admissions-card__actions :deep(.btn--secondary) {
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.admissions-card__actions :deep(.btn--secondary:hover) {
  background: rgba(255, 255, 255, 0.12);
}

.admissions-card__contacts {
  display: grid;
  gap: 12px;
  margin: var(--space-5) 0 0;
  padding-top: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.16);
}

.admissions-card__contacts dt {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.admissions-card__contacts dd {
  margin: 2px 0 0;
  color: #fff;
  font-weight: 700;
}

.admissions-card__contacts a {
  color: #fff;
  text-decoration: none;
}

.admissions-card__contacts a:hover {
  text-decoration: underline;
}

.home-contact__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.9fr);
  gap: var(--space-7);
  align-items: center;
}

.contact-list {
  display: grid;
  gap: var(--space-4);
  margin: var(--space-5) 0;
}

.contact-list dt {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.contact-list dt .pi {
  color: var(--color-accent-700);
}

.contact-list dd {
  margin: 2px 0 0 24px;
  font-weight: 600;
}

.contact-list a {
  color: var(--color-primary-700);
  text-decoration: none;
}

.home-contact__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 1023px) {
  .home-hero__inner,
  .home-events,
  .home-contact__grid {
    grid-template-columns: 1fr;
  }

  .home-hero__visual {
    min-height: 320px;
  }

  .admissions-card {
    position: static;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .home-hero__visual {
    display: none;
  }

  .home-hero__actions :deep(.btn) {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .stat {
    padding-left: 12px;
  }
}
</style>
