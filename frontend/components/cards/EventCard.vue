<script setup lang="ts">
import type { Event } from '~/types/content'

const props = defineProps<{ event: Event }>()
const locale = useLocale()

const date = new Date(props.event.startAt)
const day = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric' }).format(date)
const month = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { month: 'short' }).format(date)
const time = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', {
  hour: '2-digit',
  minute: '2-digit'
}).format(date)
</script>

<template>
  <article class="event-card">
    <div class="event-card__date" aria-hidden="true">
      <span class="event-card__day">{{ day }}</span>
      <span class="event-card__month">{{ month }}</span>
    </div>
    <div class="event-card__body">
      <span v-if="event.category" class="badge">{{ event.category }}</span>
      <h3 class="event-card__title">{{ event.title }}</h3>
      <p class="event-card__summary">{{ event.summary }}</p>
      <p class="event-card__meta">
        <span><i class="pi pi-clock" aria-hidden="true" /> {{ time }}</span>
        <span v-if="event.location"><i class="pi pi-map-marker" aria-hidden="true" /> {{ event.location }}</span>
      </p>
    </div>
  </article>
</template>

<style scoped>
.event-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
}

.event-card:last-child {
  border-bottom: 0;
}

.event-card__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 82px;
  flex: 0 0 74px;
  border-radius: var(--radius-md);
  background: var(--color-primary-100);
  color: var(--color-primary-900);
}

.event-card__day {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}

.event-card__month {
  margin-top: 3px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.event-card__body {
  min-width: 0;
}

.event-card__title {
  margin: 4px 0 4px;
  font-family: var(--font-sans);
  font-size: 1.05rem;
}

.event-card__summary {
  margin: 0 0 8px;
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

.event-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.76rem;
}

.event-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
</style>
