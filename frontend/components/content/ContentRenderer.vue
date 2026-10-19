<script setup lang="ts">
import type { Block } from '~/types/content'

defineProps<{ blocks: Block[] }>()

function isList(block: Block): block is Extract<Block, { type: 'list' }> {
  return block.type === 'list'
}
</script>

<template>
  <div class="prose content-renderer">
    <template v-for="(block, index) in blocks" :key="index">
      <p v-if="block.type === 'paragraph'">{{ block.text }}</p>

      <component
        :is="`h${block.level}`"
        v-else-if="block.type === 'heading'"
      >
        {{ block.text }}
      </component>

      <ol v-else-if="isList(block) && block.ordered">
        <li v-for="item in block.items" :key="item">{{ item }}</li>
      </ol>
      <ul v-else-if="isList(block)">
        <li v-for="item in block.items" :key="item">{{ item }}</li>
      </ul>

      <div v-else-if="block.type === 'table'" class="table-wrap">
        <table>
          <caption v-if="block.caption">{{ block.caption }}</caption>
          <thead>
            <tr>
              <th v-for="header in block.headers" :key="header" scope="col">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
              <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="block.type === 'callout'" class="callout" :class="`callout--${block.tone}`">
        <p v-if="block.title" class="callout__title">{{ block.title }}</p>
        <p class="callout__text">{{ block.text }}</p>
      </div>

      <div v-else-if="block.type === 'accordion'" class="accordion">
        <details v-for="item in block.items" :key="item.title" class="accordion__item">
          <summary class="accordion__summary">{{ item.title }}</summary>
          <div class="accordion__content">{{ item.content }}</div>
        </details>
      </div>

      <div v-else-if="block.type === 'html'" class="trusted-html" v-html="block.html" />

      <figure v-else-if="block.type === 'image'" class="content-figure">
        <img :src="`/media/${block.mediaId}`" :alt="block.alt" loading="lazy" />
        <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
      </figure>
    </template>
  </div>
</template>

<style scoped>
.content-renderer {
  color: var(--color-text);
}

.content-renderer > :last-child {
  margin-bottom: 0;
}

.callout {
  margin: var(--space-5) 0;
  padding: var(--space-4) var(--space-5);
  border-left: 4px solid var(--color-info);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: var(--color-info-bg);
}

.callout--warning {
  border-color: var(--color-warning);
  background: var(--color-warning-bg);
}

.callout--success {
  border-color: var(--color-success);
  background: var(--color-success-bg);
}

.callout__title {
  margin: 0 0 6px;
  color: var(--color-primary-900);
  font-weight: 800;
}

.callout__text {
  margin: 0;
  color: var(--color-text);
}

.accordion {
  margin: var(--space-5) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #fff;
}

.accordion__item + .accordion__item {
  border-top: 1px solid var(--color-border);
}

.accordion__summary {
  padding: 16px 20px;
  color: var(--color-primary-900);
  font-weight: 700;
  cursor: pointer;
}

.accordion__summary::marker {
  color: var(--color-accent-600);
}

.accordion__content {
  padding: 0 20px 18px;
  color: var(--color-text-muted);
}

.trusted-html {
  overflow-wrap: anywhere;
}

.content-figure {
  margin: var(--space-5) 0;
}

.content-figure img {
  border-radius: var(--radius-md);
}

.content-figure figcaption {
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: 0.82rem;
}
</style>
