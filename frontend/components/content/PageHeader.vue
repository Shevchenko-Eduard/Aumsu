<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    summary?: string
    eyebrow?: string
    variant?: 'light' | 'navy'
    current?: string
  }>(),
  { variant: 'light' }
)
</script>

<template>
  <section class="page-header" :class="`page-header--${variant}`">
    <div class="container">
      <AppBreadcrumbs :current="current || title" />
      <div class="page-header__content">
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p v-if="summary" class="page-header__summary">{{ summary }}</p>
        <div v-if="$slots.actions" class="page-header__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-header {
  position: relative;
  padding-block: var(--space-6) clamp(40px, 5vw, 64px);
  overflow: hidden;
}

.page-header--light {
  background:
    radial-gradient(circle at 92% 10%, rgba(197, 138, 26, 0.1), transparent 30%),
    var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border);
}

.page-header--navy {
  background:
    radial-gradient(circle at 88% 15%, rgba(197, 138, 26, 0.22), transparent 35%),
    linear-gradient(125deg, var(--color-primary-950), var(--color-primary-800));
  color: #e8f0f7;
}

.page-header--navy::after {
  position: absolute;
  pointer-events: none;
  right: -80px;
  bottom: -160px;
  width: 460px;
  height: 460px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 50%;
  content: "";
  box-shadow:
    0 0 0 60px rgba(255, 255, 255, 0.025),
    0 0 0 120px rgba(255, 255, 255, 0.02);
}

.page-header--navy h1,
.page-header--navy .eyebrow {
  color: #fff;
}

.page-header--navy :deep(.breadcrumbs a),
.page-header--navy :deep(.breadcrumbs li + li::before) {
  color: rgba(255, 255, 255, 0.62);
}

.page-header--navy :deep(.breadcrumbs [aria-current="page"]) {
  color: #fff;
}

.page-header__content {
  max-width: 900px;
}

.page-header h1 {
  margin-bottom: var(--space-3);
}

.page-header__summary {
  max-width: 720px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 1.05rem;
}

.page-header--navy .page-header__summary {
  color: rgba(255, 255, 255, 0.78);
}

.page-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-5);
}
</style>
