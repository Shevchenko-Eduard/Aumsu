<script setup lang="ts">
const locale = useLocale()
const { t } = useI18n()
const site = getSite(locale)
const services = getExternalServices()
const map = services.find((service) => service.key === 'map')

const embedUrl = computed(() => {
  const url = map?.embedUrl || '/map.html'
  return url.startsWith('/map.html') ? `${url}?lang=${locale}` : url
})
const fallbackUrl = map?.fallbackUrl || map?.url || 'https://yandex.ru/maps/?text=Новороссийск%2C%20проспект%20Ленина%2C%2093'
const title = locale === 'en' ? 'Map: 93 Prospekt Lenina, Novorossiysk' : 'Карта: Новороссийск, проспект Ленина, 93'
</script>

<template>
  <div class="map-embed">
    <iframe
      :src="embedUrl"
      :title="title"
      :aria-label="title"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      allowfullscreen
    />
    <div class="map-embed__caption">
      <span>{{ site.contacts.address }}</span>
      <a :href="fallbackUrl" target="_blank" rel="noopener noreferrer">
        {{ t('home.mapCta') }}
        <i class="pi pi-external-link" aria-hidden="true" />
        <span class="visually-hidden">({{ t('common.opensNewWindow') }})</span>
      </a>
      <a
        class="map-embed__attribution"
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ locale === 'en' ? 'Map data © OpenStreetMap contributors' : 'Данные карты © OpenStreetMap' }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.map-embed {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: var(--shadow-md);
}

.map-embed iframe {
  display: block;
  width: 100%;
  height: 320px;
  border: 0;
}

.map-embed__caption {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  padding: var(--space-4) var(--space-5);
}

.map-embed__caption span {
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.map-embed__caption a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--color-primary-700);
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}

.map-embed__attribution {
  color: var(--color-text-muted) !important;
  font-size: 0.7rem !important;
  font-weight: 400 !important;
}

.map-embed__caption a:hover {
  text-decoration: underline;
}

.map-embed__caption .pi {
  font-size: 0.65rem;
}

@media (max-width: 639px) {
  .map-embed iframe {
    height: 280px;
  }
}
</style>
