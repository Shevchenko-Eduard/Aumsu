import type {
  Contact,
  Document,
  Employee,
  Event,
  FaqItem,
  Journal,
  NavigationConfig,
  NewsArticle,
  OrgUnit,
  Page,
  Program,
  Section,
  SiteConfig,
  SvedenPage
} from '~/types/content'

type Locale = 'ru' | 'en'

interface JsonModule {
  default?: unknown
}

const modules = import.meta.glob('../content/**/*.json', { eager: true }) as Record<string, JsonModule | unknown>

function read<T>(file: string): T | null {
  const module = modules[file]
  if (!module) return null
  const value = (module as JsonModule).default ?? module
  return value as T
}

function filesUnder(locale: Locale, folder: string): string[] {
  return Object.keys(modules).filter((file) => file.includes(`/content/${locale}/${folder}/`))
}

function collection<T>(locale: Locale, folder: string): T[] {
  return filesUnder(locale, folder)
    .map((file) => read<T>(file))
    .filter((item): item is T => Boolean(item))
}

const cache = new Map<string, unknown>()

function cached<T>(key: string, factory: () => T): T {
  if (!cache.has(key)) cache.set(key, factory())
  return cache.get(key) as T
}

export function getSite(locale: Locale): SiteConfig {
  return cached(`site:${locale}`, () => read<SiteConfig>(`../content/${locale}/site.json`) as SiteConfig)
}

export function getNavigation(locale: Locale): NavigationConfig {
  return cached(`navigation:${locale}`, () => read<NavigationConfig>(`../content/${locale}/navigation.json`) as NavigationConfig)
}

export function getSections(locale: Locale): Section[] {
  return cached(`sections:${locale}`, () => read<Section[]>(`../content/${locale}/sections.json`) ?? [])
}

export function getPages(locale: Locale): Page[] {
  return cached(`pages:${locale}`, () => collection<Page>(locale, 'pages'))
}

export function getPage(locale: Locale, routePath: string): Page | null {
  const normalized = normalizePath(routePath)
  return cached(`page:${locale}:${normalized}`, () => {
    const pages = getPages(locale)
    return pages.find((page) => normalizePath(page.path) === normalized) ?? null
  })
}

export function getPrograms(locale: Locale): Program[] {
  return cached(`programs:${locale}`, () => collection<Program>(locale, 'programs'))
}

export function getProgram(locale: Locale, slug: string): Program | null {
  return getPrograms(locale).find((program) => program.slug === slug) ?? null
}

export function getOrgUnits(locale: Locale): OrgUnit[] {
  return cached(`org-units:${locale}`, () => collection<OrgUnit>(locale, 'org-units'))
}

export function getOrgUnit(locale: Locale, slug: string): OrgUnit | null {
  return getOrgUnits(locale).find((unit) => unit.slug === slug) ?? null
}

export function getEmployees(locale: Locale): Employee[] {
  return cached(`employees:${locale}`, () => collection<Employee>(locale, 'employees'))
}

export function getEmployee(locale: Locale, slug: string): Employee | null {
  return getEmployees(locale).find((employee) => employee.slug === slug) ?? null
}

export function getNews(locale: Locale): NewsArticle[] {
  return cached(`news:${locale}`, () =>
    collection<NewsArticle>(locale, 'news').sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
  )
}

export function getNewsItem(locale: Locale, slug: string): NewsArticle | null {
  return getNews(locale).find((item) => item.slug === slug) ?? null
}

export function getEvents(locale: Locale): Event[] {
  return cached(`events:${locale}`, () =>
    collection<Event>(locale, 'events').sort((a, b) => String(a.startAt).localeCompare(String(b.startAt)))
  )
}

export function getJournals(locale: Locale): Journal[] {
  return cached(`journals:${locale}`, () => collection<Journal>(locale, 'journals'))
}

export function getJournal(locale: Locale, slug: string): Journal | null {
  return getJournals(locale).find((journal) => journal.slug === slug) ?? null
}

export function getSveden(locale: Locale): SvedenPage[] {
  return cached(`sveden:${locale}`, () => {
    const order = ['common', 'struct', 'document', 'education', 'edustandarts', 'managers', 'employees', 'objects', 'grants', 'paid_edu', 'budget', 'vacant', 'inter', 'catering']
    return collection<SvedenPage>(locale, 'sveden').sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
  })
}

export function getSvedenPage(locale: Locale, slug: string): SvedenPage | null {
  return getSveden(locale).find((page) => page.slug === slug) ?? null
}

export function getDocuments(locale: Locale): Document[] {
  return cached(`documents:${locale}`, () => {
    const bundle = read<{ items: Document[] }>(`../content/${locale}/documents.json`)
    return bundle?.items ?? []
  })
}

export function getFaq(locale: Locale): FaqItem[] {
  return cached(`faq:${locale}`, () => read<FaqItem[]>(`../content/${locale}/faq.json`) ?? [])
}

export function getContacts(locale: Locale): Contact[] {
  return cached(`contacts:${locale}`, () => read<Contact[]>(`../content/${locale}/contacts.json`) ?? [])
}

export function getNewsCategories(locale: Locale): Array<{ id: string; slug: string; title: string }> {
  return cached(`news-categories:${locale}`, () =>
    read<Array<{ id: string; slug: string; title: string }>>(`../content/${locale}/news-categories.json`) ?? []
  )
}

export function getExternalServices(): Array<{
  key: string
  title: string
  titleEn?: string
  url: string
  external: boolean
  embed: boolean
  embedKind?: 'iframe' | 'script' | 'link'
  embedUrl?: string
  fallbackUrl?: string
}> {
  return cached('external-services', () =>
    read<Array<{ key: string; title: string; titleEn?: string; url: string; external: boolean; embed: boolean; embedKind?: 'iframe' | 'script' | 'link'; embedUrl?: string; fallbackUrl?: string }>>(
      '../content/shared/external-services.json'
    ) ?? []
  )
}

export function normalizePath(input: string): string {
  let value = input.split('?')[0]?.split('#')[0] || '/'
  value = value.replace(/^\/en(?=\/|$)/, '')
  if (!value.startsWith('/')) value = `/${value}`
  if (value.length > 1) value = value.replace(/\/+$/, '')
  return value || '/'
}

export function useLocale(): Locale {
  const { locale } = useI18n()
  return locale.value === 'en' ? 'en' : 'ru'
}
