# 05. Frontend architecture

## 1. Стек

| Слой | Выбор |
|---|---|
| Framework | Nuxt 3 (Vue 3.5+) |
| Язык | TypeScript 5.x, `strict: true` |
| Рендеринг | SSG по умолчанию; SSR как опция |
| Build | Vite, `nuxt generate` |
| UI | PrimeVue + собственные обёртки/токены |
| Стили | CSS-переменные + PrimeVue theme preset; без Tailwind |
| State | Pinia для UI, навигации, языка |
| Данные | Статические JSON/файлы, загрузка на этапе сборки |
| Валидация | Zod |
| Поиск | Pagefind |
| i18n | @nuxtjs/i18n, RU + EN |
| Forms | Моки |
| Tests | Vitest, Vue Test Utils, Playwright, axe-core, Lighthouse CI |
| Lint | ESLint 9 + Prettier + `vue-tsc` |

## 2. Структура проекта

```
app/
  app.vue
  error.vue
  layouts/
    default.vue
    landing.vue
    article.vue
    sveden.vue
  pages/
    index.vue
    about/...
    admissions/...
    education/...
    science/...
    student-life/...
    international/...
    news/...
    contacts/...
    sveden/...
    search.vue
    sitemap.vue
  components/
    layout/
    navigation/
    content/
    cards/
    forms/
    search/
    sveden/
    ui/
  composables/
    useContent.ts
    useSeo.ts
    useBreadcrumbs.ts
    useNavigation.ts
    useSearch.ts
    useAnalytics.ts
    useExternalService.ts
  stores/
    navigation.ts
    ui.ts
    locale.ts
  assets/
    styles/
      tokens.css
      base.css
      primevue.css
  content/ (или ../content)
  public/
    media/
  types/
    content.ts
    search.ts
  utils/
    format.ts
    validation.ts
    slug.ts
  plugins/
    primevue.ts
    pagefind.client.ts
  nuxt.config.ts
  i18n/
    ru.json
    en.json
```

Правило: компоненты не читают JSON напрямую; данные приходят через composables/`useAsyncData` на странице.

## 3. Роутинг и SSG

- Маршруты соответствуют IA (`01-information-architecture.md`).
- RU — без префикса, EN — `/en/...`.
- Все публичные страницы пререндерятся: `nitro.prerender.routes` или `nuxt generate` по карте маршрутов.
- Динамические маршруты (`programs/[slug]`, `news/[slug]`, `employees/[slug]`) генерируются из JSON на этапе build.
- 404 — `error.vue` + статический `404.html`; хостинг отдаёт его с кодом 404.
- 410 — `gone.json` + Nginx; frontend не создаёт страницы.
- Редиректы — Nginx по `redirects.json`; в Nuxt не дублировать, кроме dev-режима.
- `routeRules` использовать для заголовков/пререндера, не для сотен редиректов.
- Хлебные крошки — из данных страницы или `route.meta`.

## 4. Макеты

| Макет | Использование |
|---|---|
| `default` | Большинство страниц |
| `landing` | Главная и разделы |
| `article` | Новости, статьи |
| `catalog` | Каталоги с фильтрами |
| `contact` | Контакты, карта, форма |
| `sveden` | Обязательный раздел |

## 5. Компоненты

### Layout

`AppHeader`, `AppFooter`, `MainNav`, `MobileNav`, `UtilityNav`, `LanguageSwitcher`, `SearchTrigger`, `Breadcrumbs`, `SkipLink`, `CookieConsent`, `AccessibilityToggle`.

### Content

`Hero`, `SectionCards`, `ContentRenderer`, `Callout`, `Accordion`, `DataTable`, `DocumentList`, `Gallery`, `VideoEmbed`, `StatGrid`, `Timeline`.

### Cards

`ProgramCard`, `OrgUnitCard`, `EmployeeCard`, `NewsCard`, `EventCard`, `JournalCard`, `ContactCard`.

### Forms (mocks)

`ContactForm`, `FeedbackForm`, `SearchForm`, `FilterPanel`, `FormField`, `FormError`, `ConsentCheckbox`, `DemoNotice`.

### Search

`SearchInput`, `SearchResults`, `SearchFacets`, `SearchEmpty`, `SearchSkeleton`.

### Sveden

`SvedenNav`, `SvedenSection`, `SvedenTable`, `SvedenField`, `SvedenDocumentList`.

### UI

`BaseButton`, `BaseLink`, `BaseBadge`, `BaseTag`, `Pagination`, `Modal`, `Drawer`, `Tabs`, `Alert`, `Skeleton`, `EmptyState`, `ErrorState`, `Spinner`.

Требования:

- Типизированные props/emits.
- Нет бизнес-логики в UI-компонентах.
- Все состояния: default, hover, focus-visible, active, disabled, loading, error, empty.
- PrimeVue используется через обёртки, чтобы можно было менять тему и поведение.
- Не тащить тяжёлые PrimeVue-модули, если компонент не используется.

## 6. Данные

- Все данные — статические JSON/файлы (см. `04-data-contract.md`).
- Загрузка: `import.meta.glob`, Nuxt Content или сгенерированный индекс.
- `useAsyncData` с ключом `locale + type + slug`.
- SSR/SSG: данные доступны на сервере, гидратация без повторной загрузки.
- Нет `fetch()` к API.
- Нет клиентской загрузки контента.
- Ошибка данных = ошибка сборки, а не пустая страница.
- Для фильтров/поиска допустима клиентская фильтрация статических данных.

Пример:

```ts
export function usePage(slug: string) {
  const { locale } = useI18n();
  return useAsyncData(`page:${locale.value}:${slug}`, () =>
    loadContent<Page>(`pages/${slug}`, locale.value)
  );
}
```

## 7. State (Pinia)

- `navigation`: меню, футер, быстрые ссылки.
- `ui`: мобильное меню, cookie consent, тема слабовидящих.
- `locale`: текущий язык (синхронизируется с роутером).
- Серверные данные в Pinia не храним.

## 8. i18n

- `@nuxtjs/i18n`, `locales: ['ru', 'en']`, `defaultLocale: 'ru'`.
- RU без префикса, EN `/en`.
- Все строки интерфейса — в `i18n/ru.json`, `i18n/en.json`.
- Контент — `content/ru`, `content/en`.
- Переключатель языка сохраняет страницу, если перевод есть; иначе ведёт на раздел.
- `hreflang` и `x-default` на всех страницах.
- Непереведённые страницы не публикуются в EN-навигации.
- EN-переводы готовит frontend: машинный перевод + выборочная проверка, глоссарий. Внешнего приёмщика нет.
- Даты/числа — `Intl`.

## 9. SEO

- `useSeo({ title, description, canonical, ogImage, noindex, jsonLd })`.
- Уникальные title/description.
- Canonical без query.
- Open Graph/Twitter.
- JSON-LD: `Organization`/`CollegeOrUniversity`, `WebSite`, `BreadcrumbList`, `NewsArticle`, `Course`, `Person`, `Event`, `FAQPage`.
- Sitemap генерируется по всем пререндеренным страницам RU/EN.
- `robots.txt` генерируется; `/sveden` открыт.
- 404/410 — корректные статусы на хостинге.
- Sveden: microdata сохраняется.

## 10. Доступность

- WCAG 2.1 AA + ГОСТ Р 52872-2019.
- Семантические `header/nav/main/section/footer`.
- Один `h1`, корректная иерархия.
- Skip link.
- Контраст ≥ 4.5:1.
- Видимый фокус.
- Клавиатурная навигация, focus trap, Escape.
- Формы: label, `aria-describedby`, `aria-invalid`.
- Таблицы: `th`, `scope`, `caption`.
- Изображения: alt; декоративные — `alt=""`.
- Уважать `prefers-reduced-motion`.
- Версия для слабовидящих: крупный шрифт, высокий контраст, отключение фонов, сохранение настроек.
- Проверка axe в CI.

## 11. Производительность

- Начальный JS ≤ 200 КБ gzip.
- PrimeVue — только используемые компоненты, tree-shaking.
- CSS ≤ 50 КБ gzip.
- Изображения WebP/AVIF, `srcset`, lazy.
- Шрифты: 2 начертания, `font-display: swap`, subset.
- Критический CSS.
- SSG + Nginx.
- Pagefind-индекс загружается асинхронно только на `/search`.
- Карты/галереи/видео — динамический импорт.
- Lighthouse CI на PR.

## 12. Поиск (Pagefind)

- Индекс создаётся после `nuxt generate`.
- `pagefind` CLI + UI-обёртка.
- RU/EN фасеты.
- Поиск по страницам, новостям, программам, сотрудникам, документам, событиям.
- Debounce 250 мс.
- URL результатов: `/search?q=...`; состояние в query.
- Нет серверного поиска.
- Pagefind не индексирует PDF; документы индексируются по метаданным.

## 13. Формы

- Только UI и валидация.
- Мок-отправка с `setTimeout`.
- Сообщение «Демо-режим, отправка не настроена».
- Согласие на ПДн.
- Не логировать значения.
- При появлении внешнего endpoint заменить мок, не меняя компоненты.

## 14. Внешние сервисы

- Ссылки: ЛК, портал, оплата.
- Embed: расписание, виртуальный тур, карта, видео.
- Конфиг: `content/shared/external-services.json`.
- iframe: HTTPS, `title`/`aria-label`, lazy, адаптивный размер, fallback-ссылка.
- Внешние ссылки — `target="_blank"`, `rel="noopener noreferrer"`, иконка.
- Health-check не входит во frontend; ссылки проверяются в CI по списку.

## 15. Деплой

- Основной сценарий: `nuxt generate` → статика → Nginx.
- `redirects.json`, `gone.json`, `sitemap.xml`, `robots.txt`, `404.html` — артефакты сборки.
- Хостинг — Nginx; генерируем `nginx.conf`/`map`. Адаптеры Cloudflare/Netlify/Vercel — опционально.
- Edge/сервер применяет редиректы до отдачи статики.
- Node SSR не обязателен; если понадобится, архитектура Nuxt это допускает.
- Секретов в клиентском бандле нет.

## 16. Качество кода

- `vue-tsc --noEmit`, ESLint, Prettier.
- Запрет `any` без обоснования.
- Conventional Commits.
- CI: typecheck, lint, unit, e2e, axe, lighthouse, validate:content.
- Code review обязателен.
