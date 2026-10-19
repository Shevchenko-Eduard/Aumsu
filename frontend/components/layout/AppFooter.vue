<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()
const site = getSite(locale)
const sections = getSections(locale)
const navigation = getNavigation(locale)
const services = getExternalServices().filter((item) => !item.embed)
const year = new Date().getFullYear()

function serviceTitle(item: { title: string; titleEn?: string }) {
  return locale === 'en' ? item.titleEn || item.title : item.title
}
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-main">
      <div class="footer-brand">
        <NuxtLink :to="localePath('/')" class="footer-brand__link" :aria-label="t('site.name')">
          <span class="footer-brand__mark">
            <img src="/media/logo.svg" alt="" width="56" height="56" />
          </span>
          <span>
            <span class="footer-brand__name">{{ t('site.name') }}</span>
            <span class="footer-brand__official">{{ t('footer.official') }}</span>
          </span>
        </NuxtLink>
        <address class="footer-contacts">
          <span>{{ t('footer.address') }}</span>
          <a :href="`tel:${site.contacts.phones[0].replace(/[^\d+]/g, '')}`">{{ t('footer.phone') }}</a>
          <a :href="`mailto:${site.contacts.emails[0]}`">{{ t('footer.email') }}</a>
        </address>
        <div class="footer-socials">
          <a
            v-for="link in site.socialLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-social"
          >
            <i :class="link.icon === 'telegram' ? 'pi pi-send' : 'pi pi-share-alt'" aria-hidden="true" />
            {{ link.label }}
          </a>
        </div>
      </div>

      <nav class="footer-column" :aria-label="t('nav.main')">
        <h2 class="footer-title">{{ t('home.audiencesTitle') }}</h2>
        <ul class="footer-list">
          <li v-for="section in sections" :key="section.id">
            <NuxtLink :to="localePath(section.path)">{{ section.title }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <nav class="footer-column" :aria-label="t('footer.quickLinks')">
        <h2 class="footer-title">{{ t('footer.quickLinks') }}</h2>
        <ul class="footer-list">
          <li v-for="item in navigation.footer" :key="item.id">
            <NuxtLink :to="localePath(item.path)">{{ item.title }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="footer-column">
        <h2 class="footer-title">{{ t('footer.services') }}</h2>
        <ul class="footer-list">
          <li v-for="service in services.slice(0, 6)" :key="service.key">
            <a :href="service.url" target="_blank" rel="noopener noreferrer">
              {{ serviceTitle(service) }}
              <i class="pi pi-external-link" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container footer-bottom__inner">
        <p class="footer-bottom__copy">{{ t('footer.copyright', { year }) }}</p>
        <p class="footer-bottom__license">{{ t('footer.license') }}</p>
        <nav class="footer-bottom__links" :aria-label="t('footer.quickLinks')">
          <NuxtLink :to="localePath('/privacy')">{{ t('footer.privacy') }}</NuxtLink>
          <NuxtLink :to="localePath('/cookies')">{{ t('footer.cookies') }}</NuxtLink>
          <NuxtLink :to="localePath('/sitemap')">{{ t('footer.sitemap') }}</NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--color-primary-950);
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.88rem;
}

.footer-main {
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr 1fr;
  gap: var(--space-7);
  padding-block: var(--space-8) var(--space-7);
}

.footer-brand__link {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: #fff;
  text-decoration: none;
}

.footer-brand__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  background: #fff;
  flex: 0 0 66px;
}

.footer-brand__mark img {
  width: 52px;
  height: 52px;
}

.footer-brand__name {
  display: block;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.2;
}

.footer-brand__official {
  display: block;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.footer-contacts {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: var(--space-5);
  font-style: normal;
}

.footer-contacts a {
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

.footer-contacts a:hover {
  text-decoration: underline;
}

.footer-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: var(--space-4);
}

.footer-social {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-pill);
  color: #fff;
  font-size: 0.76rem;
  font-weight: 600;
  text-decoration: none;
}

.footer-social:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.footer-title {
  margin: 0 0 var(--space-4);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.footer-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-list li {
  margin: 0;
}

.footer-list a {
  color: rgba(255, 255, 255, 0.74);
  text-decoration: none;
}

.footer-list a:hover {
  color: #fff;
  text-decoration: underline;
}

.footer-list .pi {
  font-size: 0.6rem;
  opacity: 0.6;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.footer-bottom__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 24px;
  padding-block: var(--space-4);
}

.footer-bottom p {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.74rem;
}

.footer-bottom__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
}

.footer-bottom__links a {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.74rem;
  text-decoration: none;
}

.footer-bottom__links a:hover {
  color: #fff;
  text-decoration: underline;
}

@media (max-width: 1023px) {
  .footer-main {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
  }
}

@media (max-width: 639px) {
  .footer-main {
    grid-template-columns: 1fr;
    padding-block: var(--space-7) var(--space-6);
  }

  .footer-bottom__inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
