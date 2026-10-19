# 03. Content model

## 1. Общие правила

- Все сущности имеют `id` (UUID/ULID), `slug`, `status`, `createdAt`, `updatedAt`, `publishedAt`, `createdBy`, `updatedBy`.
- `status`: `draft`, `review`, `scheduled`, `published`, `archived`.
- Текстовые поля хранятся как структурированный rich text (блоки), а не как произвольный HTML.
- Медиа — отдельные сущности `MediaAsset`; в контенте хранятся ссылки по `id`.
- SEO-поля общие: `seo.title`, `seo.description`, `seo.canonical`, `seo.ogImage`, `seo.noindex`.
- Локализация: `locale` (`ru`, `en`), `translationOf` (если появится EN).
- Даты — ISO 8601 UTC.
- Slug уникален в пределах `type`.
- Удаление — через удаление файла/записи из статического набора; версионирование обеспечивает Git.
- Источник данных — статические JSON/файлы; API и админки нет.
- Формат JSON не согласован; контракт — `schemas/content.ts` + Zod. Поставщики контента приводят данные к нему.
- В сборку попадают только записи со `status = published` (или без статуса, если набор уже опубликован).

## 2. Локализация

- `locale`: `ru` | `en`; `translationOf` связывает переводы.
- Для полного EN-зеркала у каждой основной сущности должен быть EN-перевод.
- Файлы: `content/ru/...` и `content/en/...` с одинаковой структурой.
- Slug может отличаться; связь — через `translationOf`/`id`.
- Если перевода нет, EN-страница не публикуется и не попадает в EN-навигацию.
- `hreflang` строится по связям переводов.

## 3. Статический формат

```
content/
  ru/
    site.json
    navigation.json
    pages/*.json
    news/*.json
    programs/*.json
    org-units/*.json
    employees/*.json
    documents/*.json
    journals/*.json
    events/*.json
    contacts/*.json
    sveden/*.json
  en/
    ... та же структура ...
  shared/
    external-services.json
    redirects.json
    gone.json
```

- Один JSON-файл — одна сущность или небольшой справочник.
- Изображения и документы — в `public/media/`.
- Имена файлов: `slug.json`, без пробелов и кириллицы.
- Валидация — Zod-схемы, сгенерированные из `schemas/content.ts`.
- Сборка падает, если JSON не соответствует схеме.

## 4. Сущности

### 4.1 Page

Произвольная статическая страница (о вузе, правила, справка).

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `id` | string | да | Идентификатор |
| `slug` | string | да | Уникальный слаг в рамках раздела |
| `path` | string | да | Полный путь, например `/about/history` |
| `sectionId` | ref Section | да | Раздел |
| `title` | string | да | H1 |
| `subtitle` | string? | нет | Подзаголовок |
| `summary` | string? | нет | Краткое описание для карточек |
| `body` | Block[] | да | Блоки контента |
| `heroImage` | ref MediaAsset? | нет | Обложка |
| `audiences` | Audience[] | нет | `applicant`, `student`, `staff`, `alumni`, `partner`, `media` |
| `tags` | string[] | нет | Теги |
| `related` | ref[] | нет | Связанные страницы/сущности |
| `seo` | Seo | да | SEO |
| `status` | Status | да | Статус |
| `publishedAt` | datetime? | нет | Публикация |
| `createdAt` | datetime | да | |
| `updatedAt` | datetime | да | |

### 4.2 Section

Раздел или подраздел навигации.

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `id` | string | да | |
| `key` | string | да | `about`, `admissions`, `education`, `science`, `student-life`, `international`, `news`, `contacts` |
| `title` | string | да | Название в меню |
| `path` | string | да | `/education` |
| `parentId` | ref Section? | нет | Родитель |
| `order` | number | да | Порядок |
| `visible` | boolean | да | Показывать в меню |
| `description` | string? | нет | Для landing |
| `icon` | string? | нет | Иконка |
| `seo` | Seo | да | |
| `status` | Status | да | |

### 4.3 UniversityInfo

Единая карточка вуза для главной, контактов и футера. Не дублирует sveden, а ссылается на него.

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `id` | string | да | |
| `fullName` | string | да | Полное наименование |
| `shortName` | string | да | Короткое |
| `legalAddress` | string | да | Юридический адрес |
| `postalAddress` | string? | нет | Почтовый |
| `phone` | string[] | да | Основные телефоны |
| `email` | string[] | да | |
| `website` | string | да | |
| `foundedAt` | date | да | Дата основания |
| `rectorId` | ref Employee? | нет | Ректор |
| `workingHours` | string? | нет | |
| `map` | GeoPoint? | нет | Координаты |
| `socialLinks` | SocialLink[] | нет | |
| `svedenUrl` | string | да | `/sveden` |
| `updatedAt` | datetime | да | |

### 4.4 Faculty / Institute / College

Общая сущность `OrgUnit` с `type`: `faculty`, `institute`, `college`, `department`, `administration`, `branch`, `military-center`.

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `id` | string | да | |
| `type` | OrgUnitType | да | |
| `slug` | string | да | |
| `name` | string | да | Полное название |
| `shortName` | string? | нет | |
| `path` | string | да | `/about/structure/faculties/:slug` |
| `parentId` | ref OrgUnit? | нет | Институт → кафедры |
| `headId` | ref Employee? | нет | Руководитель |
| `headTitle` | string? | нет | Должность |
| `description` | Block[] | нет | |
| `address` | string? | нет | |
| `phones` | string[] | нет | |
| `emails` | string[] | нет | |
| `siteUrl` | string? | нет | Внешний/внутренний сайт |
| `workingHours` | string? | нет | |
| `programIds` | ref Program[] | нет | Программы |
| `employeeIds` | ref Employee[] | нет | Сотрудники |
| `documentIds` | ref Document[] | нет | Документы |
| `regulation` | ref Document? | нет | Положение |
| `image` | ref MediaAsset? | нет | |
| `order` | number | да | |
| `seo` | Seo | да | |
| `status` | Status | да | |

Правило: одна и та же кафедра не должна иметь две разные страницы на основном сайте и в sveden. Основная карточка — `/about/structure/...`; sveden-страница ссылается на неё и содержит обязательные поля.

### 4.5 Employee

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `id` | string | да | |
| `slug` | string | да | |
| `fullName` | string | да | ФИО |
| `displayName` | string? | нет | Как показывать |
| `position` | string | да | Должность |
| `degree` | string? | нет | Учёная степень |
| `academicTitle` | string? | нет | Учёное звание |
| `departmentId` | ref OrgUnit? | нет | Кафедра/подразделение |
| `unitIds` | ref OrgUnit[] | нет | Все подразделения |
| `email` | string[] | нет | |
| `phones` | string[] | нет | |
| `office` | string? | нет | Кабинет |
| `photo` | ref MediaAsset? | нет | |
| `bio` | Block[] | нет | |
| `disciplines` | string[] | нет | |
| `education` | string[] | нет | |
| `qualifications` | string[] | нет | |
| `experienceYears` | number? | нет | |
| `isManager` | boolean | да | |
| `managerCategory` | string? | нет | `rector`, `vice-rector`, `director`, `head` |
| `order` | number | да | |
| `seo` | Seo | да | |
| `status` | Status | да | |

Персональные данные публикуются только при наличии согласия. Для sveden — обязательный набор полей.

### 4.6 Program

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `id` | string | да | |
| `slug` | string | да | |
| `code` | string | да | Код специальности/направления |
| `name` | string | да | Название |
| `level` | ProgramLevel | да | `bachelor`, `specialist`, `master`, `graduate`, `college`, `dpo` |
| `profile` | string? | нет | Профиль/направленность |
| `facultyId` | ref OrgUnit | да | Факультет/институт |
| `departmentIds` | ref OrgUnit[] | нет | Кафедры |
| `form` | StudyForm[] | да | `full-time`, `part-time`, `distance`, `mixed` |
| `duration` | string? | нет | Срок обучения |
| `language` | string[] | да | |
| `budgetPlaces` | number? | нет | Бюджетные места |
| `paidPlaces` | number? | нет | Платные места |
| `tuition` | Money[] | нет | Стоимость по годам/формам |
| `description` | Block[] | нет | |
| `curriculum` | ref Document[] | нет | Учебный план |
| `annotations` | ref Document[] | нет | Рабочие программы |
| `admission` | AdmissionInfo? | нет | Экзамены, проходные баллы |
| `accreditation` | string? | нет | |
| `seo` | Seo | да | |
| `status` | Status | да | |

### 4.7 AdmissionCampaign

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `id` | string | да | |
| `year` | number | да | Год кампании |
| `isCurrent` | boolean | да | Текущая |
| `levels` | AdmissionLevel[] | да | |
| `startDate` | date? | нет | |
| `endDate` | date? | нет | |
| `rulesUrl` | string? | нет | Правила |
| `documents` | ref Document[] | нет | |
| `faq` | FaqItem[] | нет | |
| `contacts` | ContactBlock | да | |
| `status` | Status | да | |

`AdmissionLevel`: `bachelor`, `specialist`, `master`, `graduate`, `college`, `dpo`, `international`; поля: `title`, `description`, `exams`, `minScores`, `places`, `tuition`, `deadlines`, `documents`.

### 4.8 NewsArticle

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `id` | string | да | |
| `slug` | string | да | |
| `title` | string | да | |
| `summary` | string | да | |
| `body` | Block[] | да | |
| `cover` | ref MediaAsset? | нет | |
| `categoryIds` | ref NewsCategory[] | да | |
| `tagIds` | ref NewsTag[] | нет | |
| `audiences` | Audience[] | нет | |
| `publishedAt` | datetime | да | |
| `eventDate` | datetime? | нет | Для анонсов |
| `location` | string? | нет | |
| `authorId` | ref Employee? | нет | |
| `related` | ref[] | нет | |
| `seo` | Seo | да | |
| `status` | Status | да | |

URL: `/news/:slug`; дата хранится в `publishedAt`, архив — `/news/archive/:year`. Старые K2-новости получают 301 на новый URL.

### 4.9 NewsCategory / NewsTag

`NewsCategory`: `id`, `slug`, `title`, `order`, `seo`. `NewsTag`: `id`, `slug`, `title`.

### 4.10 Event

Может быть отдельной сущностью или новостью с `eventDate`. Рекомендуется отдельная `Event` для календаря.

| Поле | Тип | Обяз. |
|---|---|---|
| `id` | string | да |
| `slug` | string | да |
| `title` | string | да |
| `summary` | string | да |
| `body` | Block[] | нет |
| `startAt` | datetime | да |
| `endAt` | datetime? | нет |
| `location` | string? | нет |
| `category` | string? | нет |
| `cover` | ref MediaAsset? | нет |
| `registrationUrl` | string? | нет |
| `status` | Status | да |
| `seo` | Seo | да |

### 4.11 Document

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `id` | string | да | |
| `slug` | string | да | |
| `title` | string | да | |
| `description` | string? | нет | |
| `file` | ref MediaAsset | да | PDF/DOC/XLS |
| `categoryId` | ref DocumentCategory | да | |
| `sectionId` | ref Section? | нет | |
| `orgUnitId` | ref OrgUnit? | нет | |
| `programId` | ref Program? | нет | |
| `publishedAt` | date? | нет | Дата документа |
| `validFrom` | date? | нет | |
| `validTo` | date? | нет | |
| `version` | string? | нет | |
| `isMandatory` | boolean | да | Для sveden |
| `svedenItemprop` | string? | нет | Для обязательных документов |
| `status` | Status | да | |
| `seo` | Seo | да | |

Документы дедуплицируются по хешу файла. Старые версии сохраняются, но не показываются по умолчанию.

### 4.12 MediaAsset

| Поле | Тип | Обяз. |
|---|---|---|
| `id` | string | да |
| `filename` | string | да |
| `mimeType` | string | да |
| `size` | number | да |
| `width` | number? | нет |
| `height` | number? | нет |
| `url` | string | да |
| `alt` | string | да |
| `caption` | string? | нет |
| `hash` | string | да |
| `createdAt` | datetime | да |

`alt` обязателен для изображений, кроме декоративных (`alt=""` + `role="presentation"`).

### 4.13 Contact / PhoneEntry

`Contact`: `id`, `title`, `orgUnitId`, `address`, `phones`, `emails`, `workingHours`, `map`, `responsibleEmployeeId`, `order`.

`PhoneEntry`: `id`, `orgUnitId`, `title`, `phone`, `email?`, `address?`, `order`, `status`.

### 4.14 Journal / JournalIssue

`Journal`: `id`, `slug`, `title`, `issn`, `description`, `editorialBoard`, `rules`, `ethics`, `issues`, `seo`, `status`.

`JournalIssue`: `id`, `journalId`, `year`, `number`, `title`, `cover`, `pdf`, `publishedAt`, `articles`, `status`.

### 4.15 FaqItem

`id`, `question`, `answer` (Block[]), `category`, `order`, `status`.

### 4.16 Redirect

| Поле | Тип | Обяз. |
|---|---|---|
| `id` | string | да |
| `from` | string | да |
| `to` | string | да |
| `status` | 301/302/410 | да |
| `note` | string? | нет |
| `createdAt` | datetime | да |
| `hits` | number | да |

### 4.17 Sveden

Sveden-страницы хранятся как `Page` с `template = "sveden"` и дополнительным `sveden`-объектом:

```ts
interface SvedenData {
  section: string;
  itemtype?: string;
  fields: Array<{
    itemprop: string;
    label: string;
    value: string | string[];
    type: "text" | "link" | "table" | "list";
    required: boolean;
  }>;
  tables?: SvedenTable[];
}
```

Требования:

- `itemprop` и `itemtype` сохраняются.
- Обязательные поля не удаляются.
- Таблицы доступны, имеют заголовки и `scope`.
- Страницы sveden не закрываются в `robots.txt`.
- Изменения проходят валидацию и согласование.

## 5. Связи

```
Section 1─* Page
OrgUnit 1─* OrgUnit (parent/children)
OrgUnit 1─* Employee
OrgUnit 1─* Program
Program *─* OrgUnit (faculties/departments)
NewsArticle *─* NewsCategory
NewsArticle *─* NewsTag
Document *─1 DocumentCategory
Document *─1 Section / OrgUnit / Program
Journal 1─* JournalIssue
Event *─* OrgUnit / NewsCategory
```

## 6. Валидация данных

- `title` не пустой, 5–120 символов.
- `slug` соответствует `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- `seo.title` ≤ 60 символов, `seo.description` ≤ 160.
- Изображения: `alt` обязателен; размер ≤ 5 МБ; форматы WebP/AVIF/JPEG/PNG/SVG.
- Документы: PDF/DOC/DOCX/XLS/XLSX/PPT/PPTX; размер ≤ 50 МБ; вирусная проверка.
- Сборка невозможна без `seo`, `slug` и валидного JSON.
- `status = draft/review` не попадает в сборку.
- `archived`: `noindex`, скрыт из меню и поиска.
- Для EN: отсутствие перевода не ломает сборку RU, но EN-страница не создаётся.

## 7. TypeScript-модели

См. `specs/schemas/content.ts`. Модели — источник истины для статических JSON и фронтенда. При изменении формата обновлять схему, JSON и валидаторы.

Дополнительные типы статического контракта: `SiteConfig`, `NavigationConfig`, `RedirectConfig`, `ContentIndex`, `SearchDocument`, `ContentBundle`, `ExternalService`.
