<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { z } from 'zod'

const { t } = useI18n()
const uid = useId()

const state = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  consent: false
})

type Errors = Partial<Record<keyof typeof state, string>>
const errors = ref<Errors>({})
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(10),
  consent: z.literal(true)
})

const errorMessages = computed<Record<keyof typeof state, string>>(() => ({
  name: t('form.errors.name'),
  email: t('form.errors.email'),
  phone: t('form.errors.phone'),
  subject: '',
  message: t('form.errors.message'),
  consent: t('form.errors.consent')
}))

function validate() {
  const result = schema.safeParse(state)
  if (result.success) {
    errors.value = {}
    return true
  }
  const next: Errors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof typeof state
    if (field && !next[field]) next[field] = errorMessages.value[field] || issue.message
  }
  errors.value = next
  return false
}

async function onSubmit() {
  status.value = 'idle'
  if (!validate()) {
    status.value = 'error'
    await nextTick()
    const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]')
    firstInvalid?.focus()
    return
  }
  status.value = 'submitting'
  await new Promise((resolve) => setTimeout(resolve, 850))
  status.value = 'success'
  state.name = ''
  state.email = ''
  state.phone = ''
  state.subject = ''
  state.message = ''
  state.consent = false
  errors.value = {}
}
</script>

<template>
  <form class="contact-form" novalidate @submit.prevent="onSubmit">
    <DemoNotice />

    <div v-if="status === 'success'" class="form-alert form-alert--success" role="status">
      {{ t('form.successMessage') }}
    </div>
    <div v-else-if="status === 'error'" class="form-alert form-alert--error" role="alert">
      {{ t('form.errorMessage') }}
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label :for="`${uid}-name`">{{ t('fields.name') }} <span aria-hidden="true">*</span></label>
        <InputText
          :id="`${uid}-name`"
          v-model="state.name"
          :invalid="Boolean(errors.name)"
          :aria-invalid="Boolean(errors.name)"
          :aria-describedby="errors.name ? `${uid}-name-error` : undefined"
          autocomplete="name"
          :placeholder="t('fields.namePlaceholder')"
        />
        <span v-if="errors.name" :id="`${uid}-name-error`" class="error">{{ errors.name }}</span>
      </div>

      <div class="form-field">
        <label :for="`${uid}-email`">{{ t('fields.email') }} <span aria-hidden="true">*</span></label>
        <InputText
          :id="`${uid}-email`"
          v-model="state.email"
          type="email"
          :invalid="Boolean(errors.email)"
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="errors.email ? `${uid}-email-error` : undefined"
          autocomplete="email"
          :placeholder="t('fields.emailPlaceholder')"
        />
        <span v-if="errors.email" :id="`${uid}-email-error`" class="error">{{ errors.email }}</span>
      </div>

      <div class="form-field">
        <label :for="`${uid}-phone`">{{ t('fields.phone') }} <span class="hint">({{ t('common.optional') }})</span></label>
        <InputText
          :id="`${uid}-phone`"
          v-model="state.phone"
          type="tel"
          :aria-invalid="Boolean(errors.phone)"
          :aria-describedby="errors.phone ? `${uid}-phone-error` : undefined"
          autocomplete="tel"
          :placeholder="t('fields.phonePlaceholder')"
        />
        <span v-if="errors.phone" :id="`${uid}-phone-error`" class="error">{{ errors.phone }}</span>
      </div>

      <div class="form-field">
        <label :for="`${uid}-subject`">{{ t('fields.subject') }} <span class="hint">({{ t('common.optional') }})</span></label>
        <InputText
          :id="`${uid}-subject`"
          v-model="state.subject"
          :placeholder="t('fields.subjectPlaceholder')"
        />
      </div>
    </div>

    <div class="form-field">
      <label :for="`${uid}-message`">{{ t('fields.message') }} <span aria-hidden="true">*</span></label>
      <Textarea
        :id="`${uid}-message`"
        v-model="state.message"
        rows="5"
        :invalid="Boolean(errors.message)"
        :aria-invalid="Boolean(errors.message)"
        :aria-describedby="errors.message ? `${uid}-message-error` : undefined"
        :placeholder="t('fields.messagePlaceholder')"
      />
      <span v-if="errors.message" :id="`${uid}-message-error`" class="error">{{ errors.message }}</span>
    </div>

    <div class="form-field">
      <div class="checkbox-row">
        <input
          :id="`${uid}-consent`"
          v-model="state.consent"
          type="checkbox"
          :aria-invalid="Boolean(errors.consent)"
          :aria-describedby="errors.consent ? `${uid}-consent-error` : `${uid}-consent-hint`"
        />
        <label :for="`${uid}-consent`" class="checkbox-label">
          {{ t('fields.consent') }}
          <span :id="`${uid}-consent-hint`" class="hint">{{ t('fields.consentHint') }}</span>
          <span v-if="errors.consent" :id="`${uid}-consent-error`" class="error">{{ errors.consent }}</span>
        </label>
      </div>
    </div>

    <BaseButton type="submit" :loading="status === 'submitting'" size="lg">
      {{ status === 'submitting' ? t('common.sending') : t('common.submit') }}
    </BaseButton>
  </form>
</template>

<style scoped>
.contact-form {
  max-width: 760px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 var(--space-4);
}

.form-alert {
  margin-bottom: var(--space-4);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
}

.form-alert--success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.form-alert--error {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.checkbox-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-weight: 600;
  color: var(--color-text);
}

.checkbox-label .hint {
  font-weight: 400;
}

@media (max-width: 639px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
