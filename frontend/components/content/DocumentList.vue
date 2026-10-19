<script setup lang="ts">
const locale = useLocale()
const { t } = useI18n()
const documents = getDocuments(locale)
const query = ref('')
const category = ref('all')

const categories = computed(() => [...new Set(documents.map((item) => item.category).filter(Boolean))] as string[])

const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  return documents.filter((document) => {
    const matchesQuery =
      !normalized ||
      document.title.toLowerCase().includes(normalized) ||
      (document.description || '').toLowerCase().includes(normalized)
    const matchesCategory = category.value === 'all' || document.category === category.value
    return matchesQuery && matchesCategory
  })
})

function formatDate(value?: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value))
}
</script>

<template>
  <div class="document-list">
    <div class="document-filters">
      <div class="form-field">
        <label for="document-search">{{ locale === 'en' ? 'Search documents' : 'Поиск по документам' }}</label>
        <input id="document-search" v-model="query" class="input" type="search" />
      </div>
      <div class="form-field">
        <label for="document-category">{{ locale === 'en' ? 'Category' : 'Категория' }}</label>
        <select id="document-category" v-model="category" class="input">
          <option value="all">{{ t('common.all') }}</option>
          <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>
    </div>

    <p class="document-count" role="status">
      {{ locale === 'en' ? `Found: ${filtered.length}` : `Найдено документов: ${filtered.length}` }}
    </p>

    <ul v-if="filtered.length" class="documents">
      <li v-for="document in filtered" :key="document.id" class="document">
        <div class="document__icon" aria-hidden="true">
          <i class="pi pi-file-pdf" />
        </div>
        <div class="document__body">
          <a :href="document.url" target="_blank" rel="noopener noreferrer" class="document__title">
            {{ document.title }}
            <i class="pi pi-download" aria-hidden="true" />
          </a>
          <p v-if="document.description" class="document__description">{{ document.description }}</p>
          <p class="document__meta">
            <span v-if="document.category">{{ document.category }}</span>
            <span v-if="document.publishedAt">{{ formatDate(document.publishedAt) }}</span>
            <span v-if="document.isMandatory" class="badge badge--accent">{{ locale === 'en' ? 'Mandatory' : 'Обязательный' }}</span>
          </p>
        </div>
      </li>
    </ul>
    <p v-else class="empty">{{ t('common.noResults') }}</p>
  </div>
</template>

<style scoped>
.document-filters {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: var(--space-4);
  align-items: end;
  margin-bottom: var(--space-4);
}

.document-count {
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.documents {
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--color-border);
  list-style: none;
}

.document {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
}

.document__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 48px;
  flex: 0 0 42px;
  border-radius: var(--radius-sm);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 1.2rem;
}

.document__body {
  min-width: 0;
}

.document__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary-700);
  font-weight: 700;
  text-decoration: none;
}

.document__title:hover {
  text-decoration: underline;
}

.document__title .pi {
  font-size: 0.75rem;
}

.document__description {
  margin: 4px 0;
  color: var(--color-text-muted);
  font-size: 0.84rem;
}

.document__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.76rem;
}

.empty {
  padding: var(--space-5);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 639px) {
  .document-filters {
    grid-template-columns: 1fr;
  }
}
</style>
