<script setup lang="ts">
import type { OrgUnit } from '~/types/content'

const props = defineProps<{ unit: OrgUnit }>()
const locale = useLocale()
const localePath = useLocalePath()

const typeLabels: Record<string, { ru: string; en: string }> = {
  faculty: { ru: 'Факультет', en: 'Faculty' },
  institute: { ru: 'Институт', en: 'Institute' },
  college: { ru: 'Колледж', en: 'College' },
  department: { ru: 'Кафедра', en: 'Department' },
  administration: { ru: 'Управление', en: 'Administration' },
  branch: { ru: 'Филиал', en: 'Branch' },
  'military-center': { ru: 'Военный учебный центр', en: 'Military centre' }
}

const type = computed(() => typeLabels[props.unit.type]?.[locale] || props.unit.type)
const title = computed(() => props.unit.name || props.unit.shortName || '')
const phone = computed(() => props.unit.phones?.[0])
const email = computed(() => props.unit.emails?.[0])
</script>

<template>
  <article class="card org-card">
    <span class="badge badge--accent">{{ type }}</span>
    <h3 class="card__title">
      <NuxtLink :to="localePath(unit.path)">{{ title }}</NuxtLink>
    </h3>
    <p v-if="unit.head" class="org-card__head">
      <strong>{{ unit.head }}</strong>
      <span v-if="unit.headPost">{{ unit.headPost }}</span>
    </p>
    <div class="org-card__contacts">
      <a v-if="phone" :href="`tel:${phone.replace(/[^\d+]/g, '')}`">{{ phone }}</a>
      <a v-if="email" :href="`mailto:${email}`">{{ email }}</a>
    </div>
    <span class="card__arrow" aria-hidden="true">↗</span>
  </article>
</template>

<style scoped>
.org-card__head {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.org-card__head strong {
  font-size: 0.9rem;
}

.org-card__contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: auto;
  padding-top: var(--space-3);
  font-size: 0.82rem;
}

.org-card__contacts a {
  color: var(--color-primary-700);
  text-decoration: none;
}

.org-card__contacts a:hover {
  text-decoration: underline;
}
</style>
