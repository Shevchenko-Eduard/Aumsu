# 04. Data contract and static content

## 1. Принципы

- Формат JSON не согласован. Контракт задаёт этот документ и `schemas/content.ts`; поставщики контента адаптируют данные под него.
- Frontend не ходит в API. Все данные — статические JSON/файлы в репозитории.
- Один JSON-файл — одна сущность или небольшой справочник.
- Формат фиксируется `schemas/content.ts` и Zod-схемами; это единственный источник истины.
- Сборка падает, если JSON не валиден.
- RU и EN — параллельные наборы с одинаковой структурой.
- Медиа и документы лежат в `public/media/` и адресуются относительными путями.
- На этапе сборки генерируются `sitemap.xml`, `robots.txt`, `redirects.json`, поисковый индекс Pagefind.

## 2. Конвертация текущего контента

JSON готовит frontend из уже собранных данных (`Reference/`, `СборДанных/data/extracted/`, `pages.jsonl`).

Правила:

- Скрипты конвертации лежат в репозитории и воспроизводимы.
- Источник: HTML + извлечённые сущности + ручные правки.
- Один скрипт на тип сущности: pages, news, programs, org-units, employees, documents, journals.
- Результат проходит Zod-валидацию.
- Спорные/неполные записи помечаются `review` и не публикуются до проверки.
- EN-переводы готовятся отдельным проходом: машинный перевод + выборочная проверка силами frontend.
- Скрипты не ходят в сеть на этапе сборки; используются локальные данные.

## 3. Структура репозитория

```
content/
  ru/
    site.json
    navigation.json
    pages/
    news/
    programs/
    org-units/
    employees/
    documents/
    journals/
    events/
    contacts/
    sveden/
  en/
    ... та же структура ...
  shared/
    external-services.json
    redirects.json
    gone.json
public/
  media/
    images/
    documents/
    og/
  favicon.ico
  robots.txt (генерируется)
```

Правила:

- Имена файлов — `slug.json`, латиница, дефисы.
- В одном файле — одна сущность.
- Справочники (категории, теги, подразделения) могут быть массивами в одном файле.
- Не хранить в JSON HTML-строки, кроме `sveden`/санитизированных фрагментов.
- Пути к медиа — `/media/...`, без абсолютных URL на прод.

## 4. Загрузка данных в Nuxt

Рекомендуемый вариант:

```ts
// composables/useContent.ts
export async function usePage(path: string, locale: 'ru' | 'en') {
  const key = `page:${locale}:${path}`;
  return useAsyncData(key, async () => {
    const modules = import.meta.glob('~/content/*/pages/**/*.json', { eager: true });
    const match = Object.entries(modules).find(([file]) =>
      file.includes(`/content/${locale}/pages/`) && (file.endsWith(`${path}.json`) || file.endsWith(`${path}/index.json`))
    );
    if (!match) return null;
    return match[1] as Page;
  });
}
```

Альтернативы:

- Nuxt Content v3: коллекции `pages`, `news`, `programs`, `employees`, `documents`, `sveden`; запросы через `queryCollection`.
- Простые импорты JSON + собственный индекс `content/index.generated.json`.

Требования:

- Типизация через `schemas/content.ts`.
- Валидация Zod на этапе сборки.
- Нет `fetch()` к внешнему API.
- Нет клиентской загрузки контента (контент в HTML/SSG).
- Для динамических маршрутов — `prerenderRoutes`/`nitro.prerender.routes`.

## 5. Site config

`content/ru/site.json` и `content/en/site.json`:

```json
{
  "locale": "ru",
  "siteUrl": "https://aumsu.ru",
  "siteName": "ГМУ им. адм. Ф.Ф. Ушакова",
  "shortName": "ГМУ",
  "defaultSeo": {
    "titleTemplate": "%s — ГМУ им. адм. Ф.Ф. Ушакова",
    "description": "Официальный сайт Государственного морского университета имени адмирала Ф.Ф. Ушакова",
    "ogImage": "/media/og/default.jpg"
  },
  "contacts": {
    "address": "353924, Краснодарский край, г. Новороссийск, проспект Ленина, 93",
    "phones": ["+7 (8617) 71-75-25"],
    "emails": ["mail@nsma.ru"]
  },
  "socialLinks": [],
  "quickLinks": [],
  "externalServices": [
    {
      "key": "lkabit",
      "title": "Личный кабинет абитуриента",
      "url": "https://lkabit.aumsu.ru:98/",
      "external": true,
      "embed": false
    }
  ]
}
```

## 6. Navigation

`content/ru/navigation.json`:

```json
{
  "main": [
    { "id": "about", "title": "Университет", "path": "/about", "order": 1, "visible": true },
    { "id": "admissions", "title": "Поступление", "path": "/admissions", "order": 2, "visible": true }
  ],
  "utility": [],
  "footer": []
}
```

Требования:

- Меню валидируется: нет пустых `title`, `path` должен начинаться с `/` или быть внешним URL.
- Все `path` должны существовать в статической сборке; проверка на этапе build.
- EN-меню — отдельный файл.
- Внешние ссылки — `external: true`.
- iframe/embed — только если сервис разрешает и есть fallback-ссылка.

## 7. Redirects and gone

`content/shared/redirects.json`:

```json
[
  { "from": "/obrazovanie", "to": "/education", "status": 301 },
  { "from": "/abitur/bachelor", "to": "/admissions/bachelor", "status": 301 }
]
```

`content/shared/gone.json`:

```json
["/index.php/54634565767", "/index.php/5675676yjtyy"]
```

Правила:

- `from` уникален, начинается с `/`.
- `to` начинается с `/` или является внешним URL.
- Нет цепочек.
- `redirects.json` кладётся в `public/` при сборке для Nginx.
- Frontend не выполняет 301 во Vue-роутере; это делает Nginx.
- Для локальной разработки можно включить dev-middleware, повторяющий правила, но прод — Nginx.

## 8. Search (Pagefind)

- Pagefind индексирует собранный HTML после `nuxt generate`.
- Индексируются RU и EN отдельно (или с языковым фасетом).
- Индексируемые типы: страницы, новости, программы, сотрудники, документы, события.
- Исключить: `/search`, `/archive`, служебные страницы.
- Для документов индексировать метаданные, не содержимое PDF.
- Поисковый UI — собственный компонент на PrimeVue, запросы к Pagefind API.
- Подсказки/фасеты — по типам и разделам.
- Лимит запросов и debounce 200–300 мс.

Артефакты сборки:

```
dist/
  pagefind/
  index.html
  en/
  sitemap.xml
  robots.txt
  redirects.json
```

## 9. Forms (mocks)

Формы входят только как UI:

- Валидация Zod.
- Состояния: idle, submitting, success, error.
- Имитация отправки (setTimeout) и сообщение «Демо-режим».
- Никаких реальных писем/запросов.
- Поля с персональными данными не логируются.
- Согласие на обработку ПДн — чекбокс (текст предоставляется).
- Если позже появится внешний endpoint, заменить мок на вызов, не меняя UI.

## 10. Sveden data

- `content/ru/sveden/*.json` и `content/en/sveden/*.json`.
- Структура: `section`, `itemtype`, `fields`, `tables`.
- Поля с `itemprop` обязательны.
- Валидация: обязательные поля не пустые; `itemtype` корректен.
- Рендер — отдельным шаблоном, без компонентов, ломающих microdata.
- URL и данные предоставляются ответственным за раскрытие информации.

## 11. Валидация на сборке

- `npm run validate:content` — проверка JSON по Zod.
- Проверка ссылок: все внутренние `path` существуют.
- Проверка медиа: файлы существуют, alt заполнен.
- Проверка редиректов: нет цепочек, `to` существует.
- Проверка sveden: обязательные `itemprop` присутствуют.
- Проверка i18n: EN-страницы имеют пару RU (и наоборот) или явно помечены.
- CI падает при ошибке.

## 12. Build pipeline

```
validate:content
  → nuxt generate
  → pagefind --site .output/public
  → generate sitemap/robots/redirects
  → tests (links, a11y, lighthouse)
  → deploy to Nginx
```

Требования:

- Сборка детерминирована.
- Нет секретов в клиентском бандле.
- `redirects.json` и `sitemap.xml` проверяются в CI.
- Версия Node фиксируется в `.nvmrc`/`package.json engines`.

## 13. Embed-сервисы

Нужны через iframe/embed:

| Сервис | Тип | Fallback |
|---|---|---|
| Расписание занятий | iframe/embed | ссылка на сервис |
| Виртуальный тур | iframe | ссылка |
| Карта | iframe/карта | адрес и ссылка |
| Видео | iframe/плеер | ссылка на видео |

Остальные (ЛК, портал, оплата) — только ссылки.

Конфиг: `content/shared/external-services.json`:

```json
[
  {
    "key": "schedule",
    "title": "Расписание занятий",
    "url": "https://conference.aumsu.ru/",
    "external": true,
    "embed": true,
    "embedKind": "iframe",
    "fallbackUrl": "https://conference.aumsu.ru/"
  }
]
```

Требования:

- iframe только по HTTPS.
- `title`/`aria-label` у iframe.
- Ленивая загрузка.
- Fallback-ссылка обязательна.
- Не встраивать сервисы, которые запрещают embed.
- Размеры адаптивные, без горизонтального скролла.

## 14. Хостинг и редиректы

Провайдер — Nginx. Frontend генерирует `redirects.json` и `nginx.conf`/`map`; адаптеры для других хостингов — опционально:

- Cloudflare Pages: `_redirects` или правила.
- Netlify: `_redirects`.
- Vercel: `vercel.json`/`redirects`.
- Nginx: `map`/`return 301`.

Пример Nginx:

```nginx
map $uri $redirect_target {
  default "";
  /obrazovanie /education;
  /abitur /admissions;
  /abitur/bachelor /admissions/bachelor;
}

server {
  listen 443 ssl http2;
  server_name aumsu.ru;

  if ($redirect_target) {
    return 301 $redirect_target;
  }

  root /var/www/aumsu/dist;
  try_files $uri $uri/ /404.html;
}
```

Требования:

- Один источник — `content/shared/redirects.json`.
- Адаптеры генерируются на этапе сборки.
- Тесты проверяют, что каждый `from` попал в адаптер.
- 301 применяется до отдачи статики.
- `gone.json` → 410 там, где поддерживается.

## 15. Что не входит

- API, база данных, админка.
- Загрузка файлов и медиа.
- Реальная отправка форм.
- Серверная авторизация.
- Динамические данные (расписание, вакансии, статусы приёма) — только ссылки/embed или ручное обновление JSON.
