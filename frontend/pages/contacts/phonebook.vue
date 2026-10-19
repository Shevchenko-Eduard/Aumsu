<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()
const page = getPage(locale, '/contacts/phonebook')
const units = getOrgUnits(locale)
const query = ref('')

const entries = computed(() =>
  units
    .filter((unit) => unit.phones?.length || unit.emails?.length)
    .map((unit) => ({
      id: unit.id,
      title: unit.name || unit.shortName || '',
      head: unit.head,
      phones: unit.phones || [],
      emails: unit.emails || [],
      address: unit.address
    }))
)

const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  if (!normalized) return entries.value
  return entries.value.filter((entry) =>
    `${entry.title} ${entry.head || ''} ${entry.phones.join(' ')} ${entry.emails.join(' ')}`.toLowerCase().includes(normalized)
  )
})

usePageSeo({
  title: page?.seo.title || (locale === 'en' ? 'Phone directory' : 'Телефонный справочник'),
  description: page?.seo.description || page?.summary || '',
  path: locale === 'en' ? '/en/contacts/phonebook' : '/contacts/phonebook',
  noindex: Boolean(query.value),
  jsonLd: [breadcrumbJsonLd(useBreadcrumbs(page?.title))]
})
</script>

<template>
  <div>
    <PageHeader
      :title="page?.title || (locale === 'en' ? 'Phone directory' : 'Телефонный справочник')"
      :summary="page?.summary"
      :eyebrow="locale === 'en' ? 'Contacts' : 'Контакты'"
    />

    <section class="section">
      <div class="container">
        <div class="phonebook-toolbar">
          <div class="form-field">
            <label for="phonebook-query">{{ locale === 'en' ? 'Search by unit, name or phone' : 'Поиск по подразделению, ФИО или телефону' }}</label>
            <input id="phonebook-query" v-model="query" class="input" type="search" />
          </div>
          <p class="small muted" role="status">{{ locale === 'en' ? `Records: ${filtered.length}` : `Записей: ${filtered.length}` }}</p>
        </div>

        <div class="table-wrap">
          <table>
            <caption>{{ locale === 'en' ? 'University phone directory' : 'Телефонный справочник университета' }}</caption>
            <thead>
              <tr>
                <th scope="col">{{ locale === 'en' ? 'Unit' : 'Подразделение' }}</th>
                <th scope="col">{{ locale === 'en' ? 'Head' : 'Руководитель' }}</th>
                <th scope="col">{{ t('common.phone') }}</th>
                <th scope="col">{{ t('common.email') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in filtered" :key="entry.id">
                <td>
                  <strong>{{ entry.title }}</strong>
                  <span v-if="entry.address" class="phonebook-address">{{ entry.address }}</span>
                </td>
                <td>{{ entry.head || '—' }}</td>
                <td>
                  <a v-for="phone in entry.phones" :key="phone" :href="`tel:${phone.replace(/[^\d+]/g, '')}`" class="phonebook-link">{{ phone }}</a>
                  <span v-if="!entry.phones.length">—</span>
                </td>
                <td>
                  <a v-for="email in entry.emails" :key="email" :href="`mailto:${email}`" class="phonebook-link">{{ email }}</a>
                  <span v-if="!entry.emails.length">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!filtered.length" class="empty-state">
          <p>{{ t('common.noResults') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.phonebook-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.phonebook-toolbar .form-field {
  width: min(100%, 520px);
}

.phonebook-toolbar p {
  margin-bottom: 14px;
}

.phonebook-address {
  display: block;
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 0.76rem;
  font-weight: 400;
}

.phonebook-link {
  display: block;
  color: var(--color-primary-700);
  text-decoration: none;
}

.phonebook-link:hover {
  text-decoration: underline;
}

.empty-state {
  margin-top: var(--space-5);
  padding: var(--space-6);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}
</style>
