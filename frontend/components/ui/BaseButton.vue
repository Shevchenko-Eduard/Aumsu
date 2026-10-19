<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string
    href?: string
    label?: string
    variant?: 'primary' | 'secondary' | 'navy' | 'light' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    loading: false,
    disabled: false
  }
)

defineEmits<{ click: [event: MouseEvent] }>()

const ui = useUiStore()
const a11yStyle = computed(() =>
  ui.accessibility
    ? {
        backgroundColor: '#ffe66d',
        color: '#000000',
        borderColor: '#ffe66d',
        textDecoration: 'none'
      }
    : undefined
)

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  props.size === 'sm' ? 'btn--sm' : props.size === 'lg' ? 'btn--lg' : ''
])
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes" :style="a11yStyle">
    <slot>{{ label }}</slot>
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :class="classes"
    :style="a11yStyle"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot>{{ label }}</slot>
    <span class="sr-only"> ({{ $t('common.opensNewWindow') }})</span>
  </a>
  <button
    v-else
    :type="type"
    :class="classes"
    :style="a11yStyle"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot>{{ loading ? $t('common.loading') : label }}</slot>
  </button>
</template>

<style scoped>
.btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
