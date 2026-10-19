<script setup lang="ts">
withDefaults(defineProps<{ text?: string }>(), { text: '' })
const { t } = useI18n()
</script>

<template>
  <div class="demo-notice" role="note">
    <i class="pi pi-info-circle" aria-hidden="true" />
    <span>{{ text || t('form.demoNotice') }}</span>
  </div>
</template>

<style scoped>
.demo-notice {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: var(--space-5);
  padding: 12px 16px;
  border: 1px dashed var(--color-accent-600);
  border-radius: var(--radius-md);
  background: var(--color-accent-100);
  color: #6b4a06;
  font-size: 0.84rem;
}

.demo-notice .pi {
  margin-top: 2px;
  color: var(--color-accent-700);
}
</style>
