import type { BreadcrumbItem } from '~/types/content'

const labels: Record<string, string> = {
  about: 'Университет',
  admissions: 'Поступление',
  education: 'Образование',
  science: 'Наука',
  'student-life': 'Студенческая жизнь',
  international: 'Международное сотрудничество',
  news: 'Новости',
  contacts: 'Контакты',
  sveden: 'Сведения об образовательной организации',
  programs: 'Программы',
  employees: 'Сотрудники',
  documents: 'Документы',
  structure: 'Структура',
  faculties: 'Факультеты',
  institutes: 'Институты',
  colleges: 'Колледжи',
  administrations: 'Управления и отделы',
  departments: 'Кафедры',
  branches: 'Филиалы',
  library: 'Библиотека',
  journals: 'Журналы',
  archive: 'Архив',
  phonebook: 'Телефонный справочник',
  feedback: 'Обратная связь',
  search: 'Поиск',
  sitemap: 'Карта сайта'
}

const englishLabels: Record<string, string> = {
  about: 'University',
  admissions: 'Admissions',
  education: 'Education',
  science: 'Research',
  'student-life': 'Student life',
  international: 'International',
  news: 'News',
  contacts: 'Contacts',
  sveden: 'Information about the organisation',
  programs: 'Programmes',
  employees: 'Staff',
  documents: 'Documents',
  structure: 'Structure',
  faculties: 'Faculties',
  institutes: 'Institutes',
  colleges: 'Colleges',
  administrations: 'Administrations',
  departments: 'Departments',
  branches: 'Branches',
  library: 'Library',
  journals: 'Journals',
  archive: 'Archive',
  phonebook: 'Phone directory',
  feedback: 'Feedback',
  search: 'Search',
  sitemap: 'Site map'
}

function prettify(segment: string, locale: 'ru' | 'en') {
  if (locale === 'en') return englishLabels[segment] || segment.replace(/-/g, ' ')
  return labels[segment] || segment.replace(/-/g, ' ')
}

export function useBreadcrumbs(currentTitle?: string): BreadcrumbItem[] {
  const route = useRoute()
  const locale = useLocale()
  const localePath = useLocalePath()
  const path = route.path.replace(/^\/en(?=\/|$)/, '') || '/'
  if (path === '/') return []

  const segments = path.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = [{ title: locale === 'en' ? 'Home' : 'Главная', path: localePath('/') }]
  let accumulated = ''

  segments.forEach((segment, index) => {
    accumulated += `/${segment}`
    const page = getPage(locale, accumulated)
    const section = getSections(locale).find((item) => item.path === accumulated)
    const isLast = index === segments.length - 1
    let title = isLast && currentTitle ? currentTitle : page?.title || section?.title || prettify(segment, locale)
    if (page?.title === title && isLast) title = currentTitle || page.title
    items.push({ title, path: localePath(accumulated) })
  })

  return items
}
