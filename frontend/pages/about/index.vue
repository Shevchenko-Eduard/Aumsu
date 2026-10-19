<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/about')
const employees = getEmployees(locale)
const rector = employees.find((employee) => employee.isManager && employee.managerCategory === 'rector')
const orgUnits = getOrgUnits(locale)
const programs = getPrograms(locale)

const cards = computed(() => [
  {
    title: locale === 'en' ? 'History' : 'История',
    text: locale === 'en' ? 'Key dates and milestones from 1975 to today.' : 'Ключевые даты и этапы развития с 1975 года до наших дней.',
    path: '/about/history',
    icon: 'pi-history'
  },
  {
    title: locale === 'en' ? 'Structure' : 'Структура',
    text: locale === 'en' ? 'Faculties, institutes, colleges and offices.' : 'Факультеты, институты, колледжи и управления.',
    path: '/about/structure',
    icon: 'pi-sitemap'
  },
  {
    title: locale === 'en' ? 'Staff' : 'Сотрудники',
    text: locale === 'en' ? 'Directory of teachers, researchers and staff.' : 'Справочник преподавателей, исследователей и сотрудников.',
    path: '/about/employees',
    icon: 'pi-users'
  },
  {
    title: locale === 'en' ? 'Documents' : 'Документы',
    text: locale === 'en' ? 'Charter, local acts, licences and official papers.' : 'Устав, локальные акты, лицензии и официальные документы.',
    path: '/about/documents',
    icon: 'pi-file'
  },
  {
    title: locale === 'en' ? 'Museum' : 'Музей',
    text: locale === 'en' ? 'University history, exhibits and archives.' : 'История университета, экспонаты и архивные материалы.',
    path: '/about/museum',
    icon: 'pi-building'
  },
  {
    title: locale === 'en' ? 'Projects' : 'Проекты',
    text: locale === 'en' ? 'Navigation School, Big University and other initiatives.' : 'Навигацкая школа, Большой университет и другие инициативы.',
    path: '/about/projects',
    icon: 'pi-star'
  }
])

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'University' : 'Университет'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/about' : '/about',
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'University' : 'Университет')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'About us' : 'О нас'"
      variant="navy"
    >
      <template #actions>
        <BaseButton :to="localePath('/about/documents')" variant="light">
          {{ locale === 'en' ? 'Official documents' : 'Официальные документы' }}
        </BaseButton>
        <BaseButton :to="localePath('/sveden')" variant="light">
          {{ t('footer.sveden') }}
        </BaseButton>
      </template>
    </PageHeader>

    <section class="section">
      <div class="container">
        <div class="about-intro">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'The university today' : 'Университет сегодня' }}</p>
            <h2>
              {{
                locale === 'en'
                  ? 'A maritime university with an engineering core and a broad academic profile'
                  : 'Морской университет с инженерным ядром и широким академическим профилем'
              }}
            </h2>
          </div>
          <div>
            <ContentRenderer v-if="page" :blocks="page.body" />
            <p v-else>
              {{
                locale === 'en'
                  ? 'Admiral Ushakov State Maritime University trains specialists for maritime transport, engineering, economics and law.'
                  : 'Государственный морской университет имени адмирала Ф.Ф. Ушакова готовит специалистов для морского транспорта, инженерии, экономики и права.'
              }}
            </p>
          </div>
        </div>

        <dl class="about-facts">
          <div>
            <dt>{{ locale === 'en' ? 'Programmes' : 'Программы' }}</dt>
            <dd>{{ programs.length }}</dd>
          </div>
          <div>
            <dt>{{ locale === 'en' ? 'Units' : 'Подразделения' }}</dt>
            <dd>{{ orgUnits.length }}</dd>
          </div>
          <div>
            <dt>{{ locale === 'en' ? 'Staff' : 'Сотрудники' }}</dt>
            <dd>{{ employees.length }}</dd>
          </div>
          <div>
            <dt>{{ locale === 'en' ? 'Founded' : 'Основан' }}</dt>
            <dd>1975</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="section section--subtle">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="eyebrow">{{ locale === 'en' ? 'Explore' : 'Разделы' }}</p>
            <h2>{{ locale === 'en' ? 'University in detail' : 'Университет подробно' }}</h2>
          </div>
        </div>
        <div class="grid grid--3">
          <NuxtLink
            v-for="card in cards"
            :key="card.path"
            :to="localePath(card.path)"
            class="about-card"
          >
            <span class="about-card__icon"><i :class="`pi ${card.icon}`" aria-hidden="true" /></span>
            <span class="about-card__title">{{ card.title }}</span>
            <span class="about-card__text">{{ card.text }}</span>
            <span class="link-arrow">{{ t('common.readMore') }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="rector" class="section">
      <div class="container rector-block">
        <div>
          <p class="eyebrow">{{ locale === 'en' ? 'Rector' : 'Ректор' }}</p>
          <h2>{{ rector.fullName }}</h2>
          <p class="rector-block__position">{{ rector.position }}</p>
          <p>
            {{
              locale === 'en'
                ? 'The rector leads the strategic development of the university and represents it in government and industry organisations.'
                : 'Ректор руководит стратегическим развитием университета и представляет его в органах государственной власти и отраслевых организациях.'
            }}
          </p>
          <div class="rector-block__actions">
            <BaseButton :to="localePath('/about/rector')" variant="secondary">
              {{ locale === 'en' ? 'About the rector' : 'О ректоре' }}
            </BaseButton>
            <BaseButton :to="localePath('/contacts/visitors')" variant="ghost">
              {{ locale === 'en' ? 'Appointment' : 'Приём посетителей' }}
            </BaseButton>
          </div>
        </div>
        <div class="rector-card">
          <span class="rector-card__avatar" aria-hidden="true">
            {{ rector.fullName.split(' ').slice(0, 2).map((part) => part[0]).join('') }}
          </span>
          <p class="rector-card__name">{{ rector.fullName }}</p>
          <p class="rector-card__post">{{ rector.position }}</p>
          <p v-if="rector.degree" class="rector-card__degree">{{ rector.degree }}</p>
          <a v-if="rector.emails?.[0]" :href="`mailto:${rector.emails[0]}`">{{ rector.emails[0] }}</a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-intro {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: var(--space-7);
  align-items: start;
}

.about-intro h2 {
  max-width: 520px;
}

.about-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-5);
  margin: var(--space-7) 0 0;
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.about-facts dt {
  color: var(--color-text-muted);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.about-facts dd {
  margin: 4px 0 0;
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.about-card {
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
    box-shadow var(--transition);
}

.about-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
}

.about-card__icon {
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

.about-card__title {
  margin-top: 6px;
  color: var(--color-primary-900);
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
}

.about-card__text {
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

.about-card .link-arrow {
  margin-top: auto;
  padding-top: 8px;
  font-size: 0.84rem;
}

.rector-block {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-7);
  align-items: center;
}

.rector-block__position {
  color: var(--color-text-muted);
  font-weight: 600;
}

.rector-block__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.rector-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 85% 10%, rgba(197, 138, 26, 0.28), transparent 40%),
    var(--color-primary-900);
  color: #e8f0f7;
  text-align: center;
}

.rector-card__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  margin-bottom: var(--space-3);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
}

.rector-card__name {
  margin: 0;
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
}

.rector-card__post,
.rector-card__degree {
  margin: 4px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.82rem;
}

.rector-card a {
  display: inline-block;
  margin-top: var(--space-4);
  color: var(--color-accent-500);
  font-size: 0.84rem;
}

@media (max-width: 1023px) {
  .about-intro,
  .rector-block {
    grid-template-columns: 1fr;
  }

  .about-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .rector-card {
    max-width: 420px;
  }
}
</style>
