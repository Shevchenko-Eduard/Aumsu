<script setup lang="ts">
import type { Employee } from '~/types/content'

const props = defineProps<{ employee: Employee; compact?: boolean }>()
const localePath = useLocalePath()

const initials = computed(() => {
  const parts = (props.employee.displayName || props.employee.fullName).split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]).join('')
})
</script>

<template>
  <article class="card employee-card" :class="{ 'employee-card--compact': compact }">
    <div class="employee-card__top">
      <span class="employee-card__avatar" aria-hidden="true">
        {{ initials }}
      </span>
      <div class="employee-card__identity">
        <h3 class="card__title">
          <NuxtLink :to="localePath(`/about/employees/${employee.slug}`)">
            {{ employee.displayName || employee.fullName }}
          </NuxtLink>
        </h3>
        <p class="employee-card__position">{{ employee.position }}</p>
      </div>
    </div>
    <p v-if="employee.degree || employee.academicTitle" class="employee-card__degree">
      {{ [employee.degree, employee.academicTitle].filter(Boolean).join(', ') }}
    </p>
    <div class="employee-card__contacts">
      <a v-if="employee.phones?.[0]" :href="`tel:${employee.phones[0].replace(/[^\d+]/g, '')}`">
        <i class="pi pi-phone" aria-hidden="true" />{{ employee.phones[0] }}
      </a>
      <a v-if="employee.emails?.[0]" :href="`mailto:${employee.emails[0]}`">
        <i class="pi pi-envelope" aria-hidden="true" />{{ employee.emails[0] }}
      </a>
    </div>
  </article>
</template>

<style scoped>
.employee-card {
  gap: 12px;
}

.employee-card__top {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.employee-card__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border-radius: 50%;
  background: var(--color-primary-100);
  color: var(--color-primary-800);
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
}

.employee-card__identity {
  min-width: 0;
}

.employee-card__identity .card__title {
  font-family: var(--font-sans);
  font-size: 1rem;
}

.employee-card__position {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.employee-card__degree {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.78rem;
}

.employee-card__contacts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  font-size: 0.78rem;
}

.employee-card__contacts a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--color-primary-700);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-card__contacts a:hover {
  text-decoration: underline;
}

.employee-card__contacts .pi {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}
</style>
