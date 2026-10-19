<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/international')

const cards = computed(() => [
  { path: '/international/students', title: locale === 'en' ? 'International students' : 'Иностранным студентам', text: locale === 'en' ? 'Admission, visa, accommodation and adaptation.' : 'Поступление, виза, проживание и адаптация.', icon: 'pi-globe' },
  { path: '/international/partners', title: locale === 'en' ? 'Partners' : 'Партнёры', text: locale === 'en' ? 'Universities and organisations.' : 'Университеты и организации-партнёры.', icon: 'pi-users' },
  { path: '/international/programs', title: locale === 'en' ? 'International programmes' : 'Международные программы', text: locale === 'en' ? 'Exchange, grants and joint projects.' : 'Обмен, гранты и совместные проекты.', icon: 'pi-star' },
  { path: '/international/mobility', title: locale === 'en' ? 'Academic mobility' : 'Академическая мобильность', text: locale === 'en' ? 'Incoming and outgoing mobility.' : 'Входящая и исходящая мобильность.', icon: 'pi-arrow-right-arrow-left' },
  { path: '/international/staff', title: locale === 'en' ? 'For staff' : 'Сотрудникам', text: locale === 'en' ? 'Opportunities for teachers and staff.' : 'Возможности для преподавателей и сотрудников.', icon: 'pi-briefcase' },
  { path: '/international/center', title: locale === 'en' ? 'International Education Centre' : 'Центр международного образования', text: locale === 'en' ? 'Contacts, services and language support.' : 'Контакты, услуги и языковая поддержка.', icon: 'pi-building' }
])

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'International cooperation' : 'Международное сотрудничество'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/international' : '/international',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'International cooperation' : 'Международное сотрудничество')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Open to the world' : 'Открыты миру'"
      variant="navy"
    >
      <template #actions>
        <BaseButton :to="localePath('/international/students')" variant="light">{{ locale === 'en' ? 'For international students' : 'Иностранным студентам' }}</BaseButton>
        <BaseButton :to="localePath('/contacts')" variant="light">{{ t('common.contacts') }}</BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container">
        <div class="grid grid--3">
          <NuxtLink v-for="card in cards" :key="card.path" :to="localePath(card.path)" class="intl-card">
            <span class="intl-card__icon"><i :class="`pi ${card.icon}`" aria-hidden="true" /></span>
            <span class="intl-card__title">{{ card.title }}</span>
            <span class="intl-card__text">{{ card.text }}</span>
            <span class="link-arrow">{{ t('common.readMore') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section section--subtle">
      <div class="container intl-cta">
        <div>
          <p class="eyebrow">{{ locale === 'en' ? 'International Education Centre' : 'Центр международного образования' }}</p>
          <h2>{{ locale === 'en' ? 'Planning to study with us?' : 'Планируете учиться у нас?' }}</h2>
          <p>
            {{
              locale === 'en'
                ? 'The centre advises international applicants on admission, visas, accommodation and adaptation.'
                : 'Центр консультирует иностранных абитуриентов по вопросам поступления, визы, проживания и адаптации.'
            }}
          </p>
        </div>
        <div class="intl-cta__actions">
          <BaseButton :to="localePath('/admissions/international')">{{ locale === 'en' ? 'Apply as an international student' : 'Поступление для иностранцев' }}</BaseButton>
          <BaseButton :to="localePath('/international/center')" variant="secondary">{{ locale === 'en' ? 'Contact the centre' : 'Связаться с центром' }}</BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.intl-card {
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

.intl-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
}

.intl-card__icon {
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

.intl-card__title {
  margin-top: 4px;
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.12rem;
  font-weight: 700;
}

.intl-card__text {
  color: var(--color-text-muted);
  font-size: 0.84rem;
}

.intl-card .link-arrow {
  margin-top: auto;
  padding-top: 8px;
  font-size: 0.82rem;
}

.intl-cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.intl-cta p {
  max-width: 720px;
  margin-bottom: 0;
  color: var(--color-text-muted);
}

.intl-cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
