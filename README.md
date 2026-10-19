# Сайт ГМУ им. адм. Ф.Ф. Ушакова

Frontend официального сайта Государственного морского университета имени адмирала Ф.Ф. Ушакова.

Проект собран на Nuxt 3 с полной статической генерацией (SSG). Backend, CMS и админка не используются: контент хранится в JSON внутри репозитория, формы работают в демо-режиме, поиск собирается в статический индекс Pagefind.

## Содержание

- [Стек](#стек)
- [Структура репозитория](#структура-репозитория)
- [Быстрый старт](#быстрый-старт)
- [Команды](#команды)
- [Как устроен контент](#как-устроен-контент)
- [Генерация данных и артефактов](#генерация-данных-и-артефактов)
- [Локализация](#локализация)
- [Поиск](#поиск)
- [Доступность](#доступность)
- [Карта](#карта)
- [Маршруты и редиректы](#маршруты-и-редиректы)
- [Сборка и деплой в Nginx](#сборка-и-деплой-в-nginx)
- [Проверки](#проверки)
- [Текущее наполнение](#текущее-наполнение)
- [Ограничения](#ограничения)

## Стек

| Слой | Технология |
|---|---|
| Framework | Nuxt 3.21, Vue 3.5 |
| Язык | TypeScript, `strict: true` |
| Рендеринг | SSG, `nuxt generate` |
| UI | PrimeVue 4, PrimeIcons, собственные компоненты и CSS-токены |
| Состояние | Pinia |
| Локализация | `@nuxtjs/i18n`, RU + EN |
| Данные | статические JSON |
| Валидация | Zod |
| Поиск | Pagefind |
| Карта | Leaflet + OpenStreetMap |
| Линт | ESLint 9 |
| Проверка типов | `vue-tsc` |
| Сборка | Vite, Nitro static preset |

Требования:

- Node.js >= 20.19 (в репозитории есть `.nvmrc`, рекомендуется Node 24);
- npm 10+;
- Nginx для production-раздачи статики.

## Структура репозитория

```text
.
├── frontend/                  # Nuxt-приложение
│   ├── assets/styles/         # токены, базовые стили, стили PrimeVue
│   ├── components/            # layout, cards, content, forms, ui
│   ├── composables/           # загрузка контента, SEO, поиск, хлебные крошки
│   ├── content/               # сгенерированный контент RU/EN
│   │   ├── ru/
│   │   ├── en/
│   │   └── shared/            # external-services, redirects, gone
│   ├── deploy/                # nginx.conf
│   ├── i18n/locales/          # строки интерфейса RU/EN
│   ├── layouts/               # default layout
│   ├── pages/                 # маршруты Nuxt
│   ├── public/                # статические файлы, map.html, vendor/leaflet
│   ├── scripts/               # seed, artifacts, validate
│   ├── stores/                # Pinia UI state
│   ├── types/                 # модели контента
│   ├── app.vue
│   ├── error.vue
│   ├── nuxt.config.ts
│   ├── package.json
│   └── .output/public/        # результат сборки
├── specs/                     # спецификации проекта
├── Reference/                 # исходные материалы, логотип, url-map
├── СборДанных/                # сборщик и извлечённые данные
└── README.md
```

Исходный код сайта отделён от спецификаций и исходных материалов: всё, что относится к приложению, находится в `frontend/`.

## Быстрый старт

```bash
cd frontend
npm ci
npm run dev
```

Сайт откроется на `http://localhost:3000`.

Полная сборка статики:

```bash
cd frontend
npm run generate
```

Результат — `frontend/.output/public`.

## Команды

Все команды выполняются из папки `frontend`.

| Команда | Что делает |
|---|---|
| `npm run dev` | Dev-сервер Nuxt |
| `npm run build` | Production-сборка без SSG-пререндера |
| `npm run generate` | `seed` → `artifacts` → `validate:content` → `nuxt generate` → Pagefind |
| `npm run preview` | Предпросмотр production-сборки |
| `npm run seed` | Генерирует `content/` из `СборДанных/` и ручных данных |
| `npm run artifacts` | Генерирует редиректы, `sitemap.xml`, `robots.txt`, `nginx.conf` |
| `npm run validate:content` | Проверяет JSON через Zod и ссылки |
| `npm run typecheck` | Проверка типов Nuxt |
| `npm run lint` | ESLint |
| `npx vue-tsc --noEmit` | Проверка типов Vue/TS |

## Как устроен контент

Контент лежит в `frontend/content/` отдельно для каждого языка:

```text
content/
├── ru/
│   ├── site.json
│   ├── navigation.json
│   ├── sections.json
│   ├── pages/
│   ├── programs/
│   ├── org-units/
│   ├── employees/
│   ├── news/
│   ├── events/
│   ├── journals/
│   ├── sveden/
│   ├── documents.json
│   ├── faq.json
│   ├── contacts.json
│   └── news-categories.json
├── en/
│   └── ... та же структура ...
├── shared/
│   ├── external-services.json
│   ├── redirects.json
│   └── gone.json
└── routes.json
```

Основные типы:

- `Page` — статические страницы и лендинги;
- `Program` — образовательные программы;
- `OrgUnit` — факультеты, институты, колледжи, управления;
- `Employee` — сотрудники и преподаватели;
- `NewsArticle` — новости;
- `Event` — события;
- `Journal` — научные журналы;
- `SvedenPage` — страницы обязательного раздела `sveden`;
- `Document` — документы.

Компоненты не читают JSON напрямую. Загрузка идёт через `composables/useContent.ts`; данные доступны на этапе SSG.

## Генерация данных и артефактов

### `npm run seed`

Скрипт `frontend/scripts/seed-content.mjs`:

- читает `СборДанных/data/extracted/`;
- формирует программы, подразделения, сотрудников, документы, новости, события, журналы и `sveden`;
- создаёт RU/EN-файлы в `frontend/content/`;
- формирует `frontend/content/routes.json` для пререндера.

Важно: `seed` перезаписывает сгенерированные файлы в `content/`. Если контент правился вручную, изменения нужно либо перенести в скрипт, либо не запускать `seed` повторно.

### `npm run artifacts`

Скрипт `frontend/scripts/generate-artifacts.mjs`:

- читает `specs/redirects/url-map.csv`;
- создаёт `content/shared/redirects.json` и `content/shared/gone.json`;
- копирует их в `public/`;
- генерирует `deploy/nginx.conf` с `map` для 301/410;
- генерирует `public/sitemap.xml` и `public/robots.txt`.

### `npm run validate:content`

Скрипт `frontend/scripts/validate-content.ts` проверяет:

- JSON по Zod-схемам;
- обязательные поля страниц, программ, сотрудников, новостей и `sveden`;
- наличие EN-пары для страниц;
- существование целей редиректов;
- отсутствие цепочек редиректов;
- цели навигации.

Сборка не должна проходить с невалидным контентом.

## Локализация

- Основной язык — русский, без префикса: `/about`.
- Английская версия — с префиксом `/en`: `/en/about`.
- Полное зеркало основных разделов.
- Переключатель языка сохраняет текущую страницу.
- `hreflang` для RU/EN и `x-default` генерируется в `usePageSeo`.
- Строки интерфейса — в `frontend/i18n/locales/ru.json` и `en.json`.
- Контент — в `frontend/content/ru/` и `frontend/content/en/`.
- Названия подразделений в EN переведены; часть ФИО и должностей сотрудников остаётся на русском.

## Поиск

- В production используется Pagefind по статическому HTML после `nuxt generate`.
- Индекс собирается командой `pagefind --site .output/public` в `postgenerate`.
- В dev-режиме Pagefind не загружается: используется локальный поиск по JSON, чтобы не возникало 404.
- Поиск ищет по страницам, новостям, программам, сотрудникам, документам, событиям и журналам.
- Фильтр по типу результата; состояние запроса хранится в `?q=`.
- Для индексации используется `data-pagefind-body` на `<main>`.

## Доступность

- WCAG 2.1 AA как ориентир.
- Семантическая разметка, skip-link, один `h1`, хлебные крошки.
- Видимый фокус, клавиатурная навигация, Escape закрывает мобильное меню.
- Формы с `label`, `aria-invalid`, `aria-describedby`.
- Таблицы с `th`, `scope` и `caption`.
- Режим для слабовидящих:
  - включается кнопкой в шапке;
  - сохраняется в `localStorage` (`aumsu-a11y`);
  - использует чёрный фон, белый текст, жёлтые ссылки и кнопки;
  - принудительно перекрашивает кнопки и вложенные элементы;
  - отключает декоративные изображения и карту;
  - дополнительный runtime-слой стилей не зависит от кэша CSS.

## Карта

- `frontend/public/map.html` — отдельная страница карты.
- Leaflet и его ресурсы лежат локально в `frontend/public/vendor/leaflet/`.
- Тайлы — OpenStreetMap с лёгким обесцвечиванием под дизайн.
- Маркер установлен по адресу: Новороссийск, проспект Ленина, 93.
- Язык карты переключается параметром `?lang=ru|en`.
- В iframe передаются `title`/`aria-label`, используется `loading="lazy"`.
- Атрибуция OpenStreetMap вынесена под карту.
- Fallback-ссылка ведёт на Яндекс Карты.

## Маршруты и редиректы

- `content/routes.json` — список всех маршрутов для SSG.
- `nuxt.config.ts` читает этот файл и передаёт маршруты в `nitro.prerender.routes`.
- Статические страницы обрабатываются `pages/[...slug].vue`.
- Динамические сущности имеют отдельные страницы:
  - `/education/programs/:slug`;
  - `/about/employees/:slug`;
  - `/news/:slug`;
  - `/science/journals/:slug`;
  - `/about/structure/:type/:slug`;
  - `/sveden/:section`.
- Специальные страницы: `/search`, `/sitemap`, `/news/archive`, `/news/video`, `/about/structure/military-center`.
- Старые URL → 301 через `map` в `deploy/nginx.conf`.
- Удалённые страницы → 410 через `gone.json`.

## Сборка и деплой в Nginx

Node на production-сервере не нужен: раздаётся только статика.

### 1. Сборка

```bash
cd frontend
npm ci
NUXT_PUBLIC_SITE_URL=https://aumsu.ru npm run generate
```

Результат:

```text
frontend/.output/public/
├── index.html
├── 404.html
├── _nuxt/
├── pagefind/
├── media/
├── sitemap.xml
├── robots.txt
├── redirects.json
└── gone.json
```

### 2. Копирование на сервер

```bash
rsync -av --delete frontend/.output/public/ user@server:/var/www/aumsu/
```

### 3. Nginx

```bash
sudo cp frontend/deploy/nginx.conf /etc/nginx/conf.d/aumsu.conf
sudo nano /etc/nginx/conf.d/aumsu.conf
```

Проверить и при необходимости изменить:

- `server_name`;
- `root /var/www/aumsu;`;
- пути к SSL-сертификатам;
- `listen 80/443`.

В сгенерированном конфиге уже есть:

- `map` для 301/410;
- `try_files $uri $uri/ $uri.html /404.html`;
- кэширование `_nuxt/` и `pagefind/`;
- отдача `404.html`.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

TLS можно выпустить через Certbot:

```bash
sudo certbot --nginx -d aumsu.ru -d www.aumsu.ru
```

Если домен отличается от `aumsu.ru`, обновите `siteUrl` в `frontend/scripts/generate-artifacts.mjs` и переменную `NUXT_PUBLIC_SITE_URL` при сборке.

## Проверки

Перед деплоем:

```bash
cd frontend
npm run lint
npx vue-tsc --noEmit
npm run validate:content
npm run generate
```

Сейчас в репозитории нет отдельного набора Vitest/Playwright-тестов. Проверка выполняется через типы, ESLint, Zod-валидацию контента и сборку. При развитии проекта тесты стоит добавить в CI.

## Текущее наполнение

На момент последней генерации:

| Сущность | Количество |
|---|---:|
| Маршруты RU + EN | 1318 |
| Страницы | 119 RU / 119 EN |
| Программы | 56 RU / 56 EN |
| Подразделения | 31 RU / 31 EN |
| Сотрудники | 441 RU / 441 EN |
| Документы | 91 |
| Новости | 10 RU / 10 EN |
| События | 5 RU / 5 EN |
| Журналы | 2 RU / 2 EN |
| Разделы `sveden` | 14 RU / 14 EN |
| Редиректы | 347 |
| Удалённые URL | 5 |

## Ограничения

- Backend, API, CMS и админка отсутствуют.
- Формы работают в демо-режиме и не отправляют данные.
- Документы и часть внешних ссылок ведут на `aumsu.ru`.
- Не все старые страницы, новости и документы перенесены: часть контента остаётся в исходных материалах.
- Английские ФИО и должности сотрудников могут оставаться на русском.
- Ночной режим не реализован; есть только светлая тема и режим для слабовидящих.
- Внешние сервисы (расписание, виртуальный тур, ЛК, оплата) открываются как ссылки/iframe.
- Медиафайлы и документы не хранятся в репозитории в полном объёме.
