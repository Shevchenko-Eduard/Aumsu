<script setup lang="ts">
import type { NewsArticle } from '~/types/content'

const props = defineProps<{ article: NewsArticle; large?: boolean }>()
const locale = useLocale()
const localePath = useLocalePath()
const categories = getNewsCategories(locale)

const date = computed(() =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(props.article.publishedAt || props.article.createdAt))
)

const category = computed(() => categories.find((item) => props.article.categoryIds?.includes(item.id)))
</script>

<template>
  <article class="card news-card" :class="{ 'news-card--large': large }">
    <div class="news-card__media" aria-hidden="true">
      <span class="news-card__date-day">{{ new Date(article.publishedAt || article.createdAt).getDate() }}</span>
      <span class="news-card__date-month">
        {{ new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ru-RU', { month: 'short' }).format(new Date(article.publishedAt || article.createdAt)) }}
      </span>
    </div>
    <div class="news-card__body">
      <span v-if="category" class="badge badge--accent">{{ category.title }}</span>
      <h3 class="card__title">
        <NuxtLink :to="localePath(`/news/${article.slug}`)">{{ article.title }}</NuxtLink>
      </h3>
      <p class="card__text">{{ article.summary }}</p>
      <p class="news-card__meta">
        <time :datetime="article.publishedAt">{{ date }}</time>
      </p>
    </div>
  </article>
</template>

<style scoped>
.news-card {
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: var(--space-4);
  padding: var(--space-4);
}

.news-card--large {
  grid-template-columns: 110px 1fr;
  padding: var(--space-5);
}

.news-card__media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 92px;
  border-radius: var(--radius-md);
  background:
    linear-gradient(145deg, rgba(197, 138, 26, 0.22), transparent 70%),
    var(--color-primary-900);
  color: #fff;
}

.news-card--large .news-card__media {
  min-height: 118px;
}

.news-card__date-day {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.news-card__date-month {
  margin-top: 2px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.news-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.news-card__body .badge {
  margin-bottom: 2px;
}

.news-card__meta {
  margin: auto 0 0;
  color: var(--color-text-muted);
  font-size: 0.76rem;
}

@media (max-width: 639px) {
  .news-card,
  .news-card--large {
    grid-template-columns: 70px 1fr;
  }

  .news-card__media {
    min-height: 80px;
  }

  .news-card__date-day {
    font-size: 1.5rem;
  }
}
</style>
