# 02. URL and redirects

## 1. Правила URL

1. Схема и хост: `https://aumsu.ru`, без `www`, без завершающего слэша.
2. Только нижний регистр: `/education/programs`, не `/Education/Programs`.
3. Латиница, цифры и дефис: `[a-z0-9-]`. Никаких пробелов, подчёркиваний, кириллицы и URL-encoded кириллицы.
4. Никаких `index.php`, `/component/`, `/8-glavnaya-stranitsa/`, `Itemid`, `id=`, `option=`.
5. Один канонический URL на сущность. Дубли и старые адреса — только 301.
6. Query-параметры допустимы только для поиска, фильтров, пагинации и UTM. В canonical их не включаем (кроме осмысленных фильтров, если решим индексировать).
7. Пагинация: `?page=2`; canonical на первую страницу, `rel="prev/next"` или ссылки.
8. `/sveden/*` не переименовываем: это юридически значимый раздел.
9. Максимальная длина slug — 80 символов; максимум 4 сегмента пути для контентной страницы.

## 2. Схема маршрутов

| Раздел | Паттерн | Пример |
|---|---|---|
| Главная | `/` | `/` |
| Университет | `/about` | `/about/structure` |
| История | `/about/history` | `/about/history` |
| Структура | `/about/structure` | `/about/structure/faculties/morskoy-institut` |
| Факультет | `/about/structure/faculties/:slug` | `/about/structure/faculties/sudomekhanicheskiy` |
| Кафедра | `/about/structure/departments/:slug` | `/about/structure/departments/sudovozhdenie` |
| Сотрудник | `/about/employees/:slug` | `/about/employees/kondratev-sergey-ivanovich` |
| Документы | `/about/documents` | `/about/documents` |
| Поступление | `/admissions` | `/admissions/bachelor` |
| Программа | `/education/programs/:slug` | `/education/programs/09-02-07-information-systems` |
| Каталог программ | `/education/programs` | `/education/programs?level=bachelor` |
| Расписание | `/education/schedule` | `/education/schedule` |
| Библиотека | `/education/library` | `/education/library/electronic` |
| Наука | `/science` | `/science/areas` |
| Диссовет | `/science/dissertation-council` | `/science/dissertation-council/cases/755-attestatsionnoe-delo` |
| Конференция | `/science/conferences/:slug` | `/science/conferences/molodye-uchenye-2026` |
| Журнал | `/science/journals/:slug` | `/science/journals/vestnik-gmu` |
| Выпуск журнала | `/science/journals/:slug/issues/:issue` | `/science/journals/vestnik-gmu/issues/2026-1` |
| Студенческая жизнь | `/student-life` | `/student-life/dormitory` |
| Новости | `/news` | `/news` |
| Новость | `/news/:slug` | `/news/novyy-nabor` |
| Архив новостей | `/news/archive/:year` | `/news/archive/2025` |
| Международное | `/international` | `/international/students` |
| Контакты | `/contacts` | `/contacts/phonebook` |
| Поиск | `/search` | `/search?q=магистратура` |
| Sveden | `/sveden/*` | `/sveden/common` |
| Карта сайта | `/sitemap` | `/sitemap` |

Английская версия: `/en/...` с теми же правилами и `hreflang`.

## 3. Слаги

- Генерируются из названия: транслитерация + `slugify`.
- Транслитерация: `а→a, б→b, в→v, г→g, д→d, е→e, ё→e, ж→zh, з→z, и→i, й→y, к→k, л→l, м→m, н→n, о→o, п→p, р→r, с→s, т→t, у→u, ф→f, х→kh, ц→ts, ч→ch, ш→sh, щ→shch, ъ→'', ы→y, ь→'', э→e, ю→yu, я→ya`.
- Примеры:
  - `Факультет эксплуатации водного транспорта и судовождения` → `fakultet-ekspluatatsii-vodnogo-transporta-i-sudovozhdeniya`.
  - `09.02.07 Информационные системы и программирование` → `09-02-07-informatsionnye-sistemy-i-programmirovanie`.
  - `Аттестационное дело Жука Сергея Сергеевича` → `attestatsionnoe-delo-zhuka-sergeya-sergeevicha`.
- Slug уникален в пределах типа сущности. При конфликте добавляется суффикс `-2`, `-3` или идентификатор.
- Slug не меняется после публикации без 301.
- Для новостей slug глобально уникален; дата хранится в метаданных, архив — `/news/archive/:year`.

## 4. Редиректы

### 4.1 Политика

- Все старые публичные URL получают 301 на ближайший канонический URL.
- Frontend генерирует `public/redirects.json` на этапе сборки; 301 применяет Nginx, не Nuxt-роутер.
- Один хоп: не должно быть цепочек `A → B → C`.
- 302 — только для временных изменений и A/B.
- 410 — если контент удалён навсегда и замены нет.
- 404 — только для реально отсутствующих страниц; кастомная страница с поиском.
- Query-параметры при редиректе сохраняются только если они осмысленны (например, `?page=2`); UTM отбрасываются.
- `/sveden/*` не редиректим, кроме дублей (например, `/svedeniya-m → /sveden`).
- Архивные страницы: `/archive/...` с `noindex`, но с 200, если на них есть ссылки; иначе 410.

### 4.2 Источник карты

Черновая карта: `specs/redirects/url-map.csv` (414 URL).
Колонки:

```csv
current_url,title,status,depth,current_section,action,proposed_url,note
```

Действия:

- `keep` — оставить текущий URL (с учётом нормализации).
- `merge` — 301 на `proposed_url`.
- `redirect` — 301 на `proposed_url`.
- `archive` — перенести в `/archive/*`, `noindex`.
- `delete` — 410 или удалить без редиректа (для мусора).
- `rewrite` — контент переписать, URL может остаться или измениться.
- `review` — ручная классификация.

### 4.3 Приоритетные соответствия

| Старый URL | Новый URL | Код |
|---|---|---|
| `/svedeniya-m` | `/sveden` | 301 |
| `/obrazovanie` | `/education` | 301 |
| `/nauka` | `/science` | 301 |
| `/index.php/obrazovanie` | `/education` | 301 |
| `/index.php/nauka` | `/science` | 301 |
| `/index.php/abiturientu` | `/admissions` | 301 |
| `/index.php/elektronnaya-biblioteka` | `/education/library/electronic` | 301 |
| `/archiv_news` | `/news/archive` | 301 |
| `/arkhiv-novostej` | `/news/archive` | 301 |
| `/abitur` | `/admissions` | 301 |
| `/abitur/bachelor` | `/admissions/bachelor` | 301 |
| `/abitur/special` | `/admissions/specialist` | 301 |
| `/abitur/magistr` | `/admissions/master` | 301 |
| `/abitur/aspirant` | `/admissions/graduate` | 301 |
| `/abitur/spo` | `/admissions/college` | 301 |
| `/spec` | `/education/programs` | 301 |
| `/education/bakalavriat` | `/education/bachelor` | 301 |
| `/education/specialitet` | `/education/specialist` | 301 |
| `/education/magistratura` | `/education/master` | 301 |
| `/education/magistratura/*` | `/education/master/*` | 301 |
| `/education/2021-02-19-11-46-58` | `/education/distance` | 301 |
| `/zaochnyj-fakultet` | `/education/distance` | 301 |
| `/fspoidp` | `/education/colleges` | 301 |
| `/fspoidp/morskoj-kolledzh` | `/education/colleges/morskoy-kolledzh` | 301 |
| `/fspoidp/transportnyj-kolledzh` | `/education/colleges/transportnyy-kolledzh` | 301 |
| `/institute-sea` | `/about/structure/institutes/institut-morskogo-transportnogo-menedzhmenta-ekonomiki-i-prava` | 301 |
| `/fakultet-ekspluatatsii-vodnogo-transporta-i-sudovozhdeniya` | `/about/structure/faculties/fakultet-ekspluatatsii-vodnogo-transporta-i-sudovozhdeniya` | 301 |
| `/sudomekhanicheskij-fakultet` | `/about/structure/faculties/sudomekhanicheskiy-fakultet` | 301 |
| `/kafedra-*` | `/about/structure/departments/:slug` | 301 |
| `/upravlenie-*` | `/about/structure/administrations/:slug` | 301 |
| `/nii_gmu` | `/science/institutes` | 301 |
| `/reiit` | `/about/structure/departments/reiit` | 301 |
| `/telefonnyj-spravochnik` | `/contacts/phonebook` | 301 |
| `/uchenyj-sovet` | `/about/academic-council` | 301 |
| `/o-rektore` | `/about/rector` | 301 |
| `/istoriya-universiteta` | `/about/history` | 301 |
| `/strategicheskij-plan-razvitiya-universiteta` | `/about/strategy` | 301 |
| `/bu` | `/about/projects/big-university` | 301 |
| `/stipendiaty-rossii` | `/student-life/scholarships` | 301 |
| `/yuzhnyj-tsentr-organizatsii-uchebnykh-praktik` | `/student-life/career` | 301 |
| `/obrawenie` | `/contacts/feedback` | 301 |
| `/culture_sport/*` | `/student-life/*` | 301 |
| `/international_action/*` | `/international/*` | 301 |
| `/library/*` (набор старых top-level страниц) | `/education/library/*` | 301 |
| `/o-zhurnale`, `/redaktsiya`, `/redkollegiya`, `/etika-publikatsij`, `/trebovaniya-k-publikatsiyam`, `/polozhenie-o-retsenzirovanii`, `/sbm-pravila-napravleniya/*`, `/arkhiv-nomerov`, `/vypuski` | `/science/journals/*` | 301 |
| `/component/content/article/...` | по смыслу страницы | 301 |
| 21 `/component/content?id=...` | ближайший раздел | 301 или 410 |
| `/index.php/54634565767`, `/index.php/5675676yjtyj` | — | 410 |
| `/culture_sport` | `/student-life` | 301 |
| `/raspisanie-zanyatij` | `/education/schedule` | 301 |
| `/upravlenie-bezopasnosti-i-kontrolya` | `/about/structure` | 301 |

### 4.4 Формат хранения

Frontend генерирует `public/redirects.json` из `specs/redirects/url-map.csv`/`redirects.example.json`. Edge/сервер применяет его до отдачи статики:

```json
[
  { "from": "/obrazovanie", "to": "/education", "status": 301 },
  { "from": "/abitur/bachelor", "to": "/admissions/bachelor", "status": 301 },
  { "from": "/kafedra-sudovozhdenie", "to": "/about/structure/departments/sudovozhdenie", "status": 301 }
]
```

Требования:

- Валидация при сборке: `from` уникален, `to` начинается с `/` или является внешним URL, нет цепочек.
- Автотест: каждый `from` присутствует в `redirects.json`; каждый `to` существует в статической сборке (или помечен как архив/410).
- Отчёт: сколько редиректов, сколько битых, сколько не покрыто.
- `redirects.json` не содержит query-мусор; для удалённых — отдельный `gone.json`.
- Хостинг — Nginx; frontend генерирует `nginx.conf`/`map`. Адаптеры Cloudflare/Netlify/Vercel — опционально.

## 5. Sitemap и robots

- `sitemap.xml` — генерируется на этапе SSG: страницы, новости, программы, сотрудники, документы, RU/EN.
- `robots.txt` — не закрывать `/sveden`, разрешить индексацию публичных страниц, закрыть `/search`, `/archive`, `/en/search`.
- В sitemap не включать фильтры, пагинацию, архив и служебные страницы.
- Обновление sitemap при публикации/архивации.

## 6. 404 и мониторинг

- Кастомная 404: поиск, популярные разделы, контакты, ссылка на карту сайта.
- На SSG-хостинге настроить fallback на `404.html` с корректным статусом.
- Логирование 404 — на Nginx/хостинге; frontend не собирает персональные данные.
- Раз в неделю: топ-20 404 → редирект или исправление ссылки.
- Проверять внешние ссылки (ЛК, портал, оплата) health-check’ом.
