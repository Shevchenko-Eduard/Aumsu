<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const page = getPage(locale, '/contacts')
const contacts = getContacts(locale)
const site = getSite(locale)

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Contacts' : 'Контакты'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/contacts' : '/contacts',
  jsonLd: [
    breadcrumbJsonLd(useBreadcrumbs(page?.title)),
    organizationJsonLd()
  ]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Contacts' : 'Контакты')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'We are here to help' : 'Мы рядом'"
      variant="navy"
    />

    <section class="section">
      <div class="container">
        <div class="grid grid--3">
          <article v-for="contact in contacts" :key="contact.id" class="card contact-card">
            <span class="contact-card__icon"><i class="pi pi-building" aria-hidden="true" /></span>
            <h2 class="card__title">{{ contact.title }}</h2>
            <dl class="contact-card__details">
              <div v-if="contact.address">
                <dt>{{ t('common.address') }}</dt>
                <dd>{{ contact.address }}</dd>
              </div>
              <div v-if="contact.phones.length">
                <dt>{{ t('common.phone') }}</dt>
                <dd>
                  <a v-for="phone in contact.phones" :key="phone" :href="`tel:${phone.replace(/[^\d+]/g, '')}`">{{ phone }}</a>
                </dd>
              </div>
              <div v-if="contact.emails.length">
                <dt>{{ t('common.email') }}</dt>
                <dd>
                  <a v-for="email in contact.emails" :key="email" :href="`mailto:${email}`">{{ email }}</a>
                </dd>
              </div>
              <div v-if="contact.workingHours">
                <dt>{{ t('common.workingHours') }}</dt>
                <dd>{{ contact.workingHours }}</dd>
              </div>
            </dl>
          </article>
        </div>

        <div class="contact-links">
          <NuxtLink :to="localePath('/contacts/phonebook')" class="contact-link">
            <i class="pi pi-phone" aria-hidden="true" />
            <span>
              <strong>{{ locale === 'en' ? 'Phone directory' : 'Телефонный справочник' }}</strong>
              <small>{{ locale === 'en' ? 'Phone numbers of university units' : 'Телефоны подразделений университета' }}</small>
            </span>
            <i class="pi pi-arrow-right" aria-hidden="true" />
          </NuxtLink>
          <NuxtLink :to="localePath('/contacts/visitors')" class="contact-link">
            <i class="pi pi-clock" aria-hidden="true" />
            <span>
              <strong>{{ locale === 'en' ? 'Visitor hours' : 'Приём посетителей' }}</strong>
              <small>{{ locale === 'en' ? 'How to make an appointment' : 'Как записаться на приём' }}</small>
            </span>
            <i class="pi pi-arrow-right" aria-hidden="true" />
          </NuxtLink>
          <NuxtLink :to="localePath('/contacts/feedback')" class="contact-link">
            <i class="pi pi-envelope" aria-hidden="true" />
            <span>
              <strong>{{ locale === 'en' ? 'Feedback' : 'Обратная связь' }}</strong>
              <small>{{ locale === 'en' ? 'Write to us through the form' : 'Напишите нам через форму' }}</small>
            </span>
            <i class="pi pi-arrow-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section section--subtle">
      <div class="container contacts-map">
        <div>
          <p class="eyebrow">{{ locale === 'en' ? 'Main campus' : 'Главный кампус' }}</p>
          <h2>{{ site.siteName }}</h2>
          <p>{{ t('footer.address') }}</p>
          <dl class="campus-contacts">
            <div>
              <dt>{{ t('common.phone') }}</dt>
              <dd><a :href="`tel:${site.contacts.phones[0].replace(/[^\d+]/g, '')}`">{{ site.contacts.phones[0] }}</a></dd>
            </div>
            <div>
              <dt>{{ t('common.email') }}</dt>
              <dd><a :href="`mailto:${site.contacts.emails[0]}`">{{ site.contacts.emails[0] }}</a></dd>
            </div>
          </dl>
          <BaseButton href="https://yandex.ru/maps/?text=Новороссийск%20проспект%20Ленина%2093" variant="secondary">
            {{ t('home.mapCta') }}
          </BaseButton>
        </div>
        <MapEmbed />
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-card {
  gap: 12px;
}

.contact-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.contact-card .card__title {
  font-family: var(--font-sans);
  font-size: 1.05rem;
}

.contact-card__details {
  display: grid;
  gap: 10px;
  margin: 0;
}

.contact-card__details dt {
  color: var(--color-text-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.contact-card__details dd {
  margin: 2px 0 0;
  font-size: 0.85rem;
}

.contact-card__details a {
  display: block;
  color: var(--color-primary-700);
  text-decoration: none;
}

.contact-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  color: var(--color-text);
  text-decoration: none;
}

.contact-link:hover {
  border-color: var(--color-primary-200);
  color: var(--color-primary-700);
}

.contact-link > .pi:first-child {
  color: var(--color-accent-700);
  font-size: 1.1rem;
}

.contact-link span {
  display: flex;
  flex-direction: column;
}

.contact-link small {
  color: var(--color-text-muted);
  font-size: 0.76rem;
}

.contact-link > .pi:last-child {
  margin-left: auto;
  color: var(--color-border-strong);
  font-size: 0.78rem;
}

.contacts-map {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.9fr);
  gap: var(--space-7);
  align-items: center;
}

.campus-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  margin: var(--space-5) 0;
}

.campus-contacts dt {
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.campus-contacts dd {
  margin: 2px 0 0;
  font-weight: 700;
}

.campus-contacts a {
  color: var(--color-primary-700);
  text-decoration: none;
}

@media (max-width: 1023px) {
  .contact-links {
    grid-template-columns: 1fr;
  }

  .contacts-map {
    grid-template-columns: 1fr;
  }
}
</style>
