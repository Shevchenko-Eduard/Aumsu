<script setup lang="ts">
const props = defineProps<{ current?: string }>()
const items = useBreadcrumbs(props.current)
</script>

<template>
  <nav v-if="items.length" class="breadcrumbs" :aria-label="$t('common.youAreHere')">
    <ol>
      <li v-for="(item, index) in items" :key="item.path">
        <NuxtLink v-if="index < items.length - 1" :to="item.path">{{ item.title }}</NuxtLink>
        <span v-else aria-current="page">{{ item.title }}</span>
      </li>
    </ol>
  </nav>
</template>
