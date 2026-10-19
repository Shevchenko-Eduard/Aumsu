# 07. SEO, accessibility, performance

## 1. SEO

### 1.1 Обязательные требования

- SSG: контент присутствует в HTML первого ответа; публикация на Nginx.
- Уникальный `<title>` (≤ 60 символов) и `meta description` (≤ 160) на каждой индексируемой странице.
- `link rel="canonical"` на всех страницах.
- Один `<h1>` на страницу.
- Человекочитаемые URL (см. `02-url-and-redirects.md`).
- `sitemap.xml` и корректный `robots.txt`.
- 301 со всех старых URL; без цепочек.
- 404/410 отдают правильный HTTP-статус.
- Open Graph и Twitter Card.
- `lang="ru"` / `lang="en"`.
- `hreflang` для RU/EN и `x-default` (RU).
- Изображения с `alt`, осмысленные имена файлов.
- Внутренние ссылки с описательным текстом.
- Не индексировать: `/search`, `/en/search`, фильтры, `/archive/*`, служебные страницы.

### 1.2 Метаданные

```html
<title>Поступление в ГМУ им. адм. Ф.Ф. Ушакова — 2026</title>
<meta name="description" content="Правила приёма, сроки, вступительные испытания, стоимость и подача документов." />
<link rel="canonical" href="https://aumsu.ru/admissions" />
<meta property="og:type" content="website" />
<meta property="og:title" content="Поступление — 2026" />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://aumsu.ru/media/og/admissions.jpg" />
<meta property="og:url" content="https://aumsu.ru/admissions" />
<meta name="twitter:card" content="summary_large_image" />
```

### 1.3 JSON-LD

- `Organization` / `CollegeOrUniversity` на главной.
- `WebSite` + `SearchAction` на главной.
- `BreadcrumbList` на всех страницах с крошками.
- `NewsArticle` для новостей.
- `Course` для программ.
- `Person` для сотрудников.
- `FAQPage` для FAQ.
- `Event` для событий.
- `Document` не обязателен; документы лучше описывать в sitemap.

Пример:

```json
{
  "@context": "https://schema.org",
  "@type": "CollegeOrUniversity",
  "name": "Государственный морской университет имени адмирала Ф.Ф. Ушакова",
  "url": "https://aumsu.ru",
  "logo": "https://aumsu.ru/media/logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Новороссийск",
    "addressCountry": "RU",
    "streetAddress": "проспект Ленина, 93"
  },
  "telephone": "+7 (8617) 71-75-25"
}
```

### 1.4 Sitemap

- `sitemap.xml` — индекс, генерируется на этапе SSG.
- `sitemap-pages.xml`, `sitemap-news.xml`, `sitemap-programs.xml`, `sitemap-employees.xml`, `sitemap-documents.xml`.
- Отдельные URL для RU/EN + `hreflang`.
- `lastmod` — из данных/Git.
- Не включать архив, фильтры, пагинацию, `/search`.
- Sveden включать, если разрешено; robots не закрывать.

### 1.5 Robots

```
User-agent: *
Allow: /
Disallow: /search
Disallow: /en/search
Disallow: /archive
Sitemap: https://aumsu.ru/sitemap.xml
```

Не закрывать `/sveden`.

### 1.6 Sveden microdata

- Сохранять `itemscope`, `itemtype`, `itemprop`.
- Не менять структуру таблиц и полей без согласования.
- Проверять валидатором и приёмочными тестами.
- Не удалять обязательные поля ради дизайна.
- URL `/sveden/*` не менять.
- Добавить мониторинг: обязательные `itemprop` присутствуют на каждой странице.

## 2. Доступность

### 2.1 Стандарты

- WCAG 2.1 AA.
- ГОСТ Р 52872-2019 — обязательно.
- Версия для слабовидящих.

### 2.2 Требования

- Семантические ориентиры: `header`, `nav`, `main`, `aside`, `footer`.
- Skip link.
- Один `h1`, корректная иерархия `h2–h6`.
- Контраст текста ≥ 4.5:1; крупного ≥ 3:1; элементов управления ≥ 3:1.
- Фокус видим и не скрыт.
- Все действия доступны с клавиатуры.
- `aria-expanded`, `aria-controls`, `aria-current` для навигации.
- Модальные окна: focus trap, возврат фокуса, Escape.
- Формы: `label`, `aria-describedby`, `aria-invalid`, сообщения об ошибках.
- Таблицы: `th`, `scope`, `caption`, не только цвет для выделения.
- Изображения: `alt`; декоративные — `alt=""`.
- Видео: субтитры, управление с клавиатуры, без автозапуска со звуком.
- Уважать `prefers-reduced-motion`.
- Текст увеличивается до 200% без потери функциональности.
- Нет горизонтального скролла на 320px.
- Язык страницы и частей — `lang`.

### 2.3 Версия для слабовидящих

- Переключатель в шапке.
- Крупный шрифт, высокий контраст, отключение фоновых изображений.
- Сохранять структуру и навигацию.
- Настройка запоминается.
- Не отдельный сайт, а тема.

## 3. Производительность

### 3.1 Бюджеты

| Метрика | Бюджет |
|---|---|
| LCP (mobile, p75) | ≤ 2.5 с |
| INP | ≤ 200 мс |
| CLS | ≤ 0.1 |
| TTFB | ≤ 800 мс |
| Начальный JS | ≤ 200 КБ gzip |
| CSS на страницу | ≤ 50 КБ gzip |
| Шрифты | ≤ 2 файла, ≤ 150 КБ |
| Изображения первого экрана | ≤ 300 КБ |
| Количество запросов первого экрана | ≤ 30 |

### 3.2 Меры

- SSG + Nginx.
- Код-сплиттинг по маршрутам и ленивая загрузка PrimeVue-компонентов.
- Ленивые изображения и `srcset`.
- WebP/AVIF, `width`/`height` для предотвращения CLS.
- `font-display: swap`, preload, subset.
- Критический CSS.
- Кэширование статики и файлов на Nginx.
- Не подключать тяжёлые UI-библиотеки без необходимости.
- Карты, галереи, видео — динамический импорт.
- Pagefind-индекс загружается только на странице поиска.
- Минификация и сжатие Brotli/Gzip.

### 3.3 Мониторинг

- Lighthouse CI на PR.
- Web Vitals в проде.
- Sentry/аналог для ошибок.
- Проверка 404 и внешних ссылок.
- Алерты при деградации LCP/INP.

## 4. Чек-лист приёмки

- [ ] Все страницы имеют title, description, canonical.
- [ ] Один h1, корректная иерархия.
- [ ] Нет 404 в основном меню.
- [ ] Sitemap и robots корректны.
- [ ] 301 покрывают старые URL.
- [ ] JSON-LD валиден.
- [ ] Sveden microdata сохранены.
- [ ] ГОСТ Р 52872-2019 проверен.
- [ ] Версия для слабовидящих работает и сохраняет настройки.
- [ ] axe: 0 critical, 0 serious.
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] Клавиатурная навигация проверена.
- [ ] Проверка на 320px и при 200% zoom.
- [ ] Нет горизонтального скролла.
- [ ] Формы доступны и валидируются.
