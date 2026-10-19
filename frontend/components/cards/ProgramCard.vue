<script setup lang="ts">
import type { Program } from '~/types/content'

const props = defineProps<{ program: Program }>()
const locale = useLocale()
const localePath = useLocalePath()

const levelLabels: Record<string, { ru: string; en: string }> = {
  college: { ru: 'СПО', en: 'Vocational' },
  bachelor: { ru: 'Бакалавриат', en: "Bachelor's" },
  specialist: { ru: 'Специалитет', en: "Specialist's" },
  master: { ru: 'Магистратура', en: "Master's" },
  graduate: { ru: 'Аспирантура', en: 'Postgraduate' },
  dpo: { ru: 'ДПО', en: 'CPD' }
}

const formLabels: Record<string, { ru: string; en: string }> = {
  'full-time': { ru: 'очная', en: 'full-time' },
  'part-time': { ru: 'заочная', en: 'part-time' },
  distance: { ru: 'дистанционная', en: 'distance' },
  mixed: { ru: 'очно-заочная', en: 'mixed' }
}

const level = computed(() => levelLabels[props.program.level]?.[locale] || props.program.level)
const forms = computed(() => (props.program.forms || []).map((form) => formLabels[form]?.[locale] || form).join(', '))
const price = computed(() => {
  const amount = props.program.tuition?.[0]?.amount
  if (!amount) return null
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(amount)
})
</script>

<template>
  <article class="card program-card">
    <div class="program-card__top">
      <span class="badge">{{ level }}</span>
      <span class="program-card__code">{{ program.code }}</span>
    </div>
    <h3 class="card__title">
      <NuxtLink :to="localePath(`/education/programs/${program.slug}`)">{{ program.name }}</NuxtLink>
    </h3>
    <dl class="program-card__facts">
      <div>
        <dt>{{ locale === 'en' ? 'Form' : 'Форма' }}</dt>
        <dd>{{ forms }}</dd>
      </div>
      <div v-if="program.duration">
        <dt>{{ locale === 'en' ? 'Duration' : 'Срок' }}</dt>
        <dd>{{ program.duration }}</dd>
      </div>
      <div v-if="program.budgetPlaces">
        <dt>{{ locale === 'en' ? 'Budget places' : 'Бюджетные места' }}</dt>
        <dd>{{ program.budgetPlaces }}</dd>
      </div>
      <div v-if="price">
        <dt>{{ locale === 'en' ? 'Tuition' : 'Стоимость' }}</dt>
        <dd>{{ price }}</dd>
      </div>
    </dl>
    <span class="card__arrow" aria-hidden="true">↗</span>
  </article>
</template>

<style scoped>
.program-card {
  padding-top: var(--space-4);
}

.program-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-right: 26px;
}

.program-card__code {
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.program-card__facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  margin: auto 0 0;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.program-card__facts div {
  min-width: 0;
}

.program-card__facts dt {
  color: var(--color-text-muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.program-card__facts dd {
  margin: 2px 0 0;
  color: var(--color-primary-900);
  font-size: 0.85rem;
  font-weight: 700;
}
</style>
