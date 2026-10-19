import type { Block, SearchDocument } from '~/types/content'

type ResultType = SearchDocument['type'] | 'all'

function blockText(blocks: Block[] | undefined): string {
  if (!blocks) return ''
  return blocks
    .map((block) => {
      if (block.type === 'paragraph' || block.type === 'heading') return block.text
      if (block.type === 'list') return block.items.join(' ')
      if (block.type === 'callout') return block.text
      if (block.type === 'accordion') return block.items.map((item) => `${item.title} ${item.content}`).join(' ')
      return ''
    })
    .join(' ')
}

export function useSiteSearch() {
  const locale = useLocale()
  const route = useRoute()
  const router = useRouter()
  const query = ref(String(route.query.q || ''))
  const type = ref<ResultType>((route.query.type as ResultType) || 'all')
  const results = ref<SearchDocument[]>([])
  const loading = ref(false)
  const pagefindReady = ref(false)
  const mode = ref<'pagefind' | 'local'>('local')
  let pagefind: any = null
  let timer: ReturnType<typeof setTimeout> | null = null

  const localIndex = computed<SearchDocument[]>(() => {
    const documents: SearchDocument[] = []
    const localePrefix = locale === 'en' ? '/en' : ''

    for (const page of getPages(locale)) {
      if (['/search', '/sitemap', '/news/archive'].includes(page.path)) continue
      documents.push({
        id: `page-${page.id}`,
        type: 'page',
        locale,
        title: page.title,
        excerpt: page.summary || page.seo.description,
        url: `${localePrefix}${page.path === '/' ? (locale === 'en' ? '/en' : '/') : page.path}`,
        section: page.sectionId,
        tags: page.tags,
        date: page.publishedAt
      })
    }

    for (const article of getNews(locale)) {
      documents.push({
        id: `news-${article.id}`,
        type: 'news',
        locale,
        title: article.title,
        excerpt: article.summary,
        url: `${localePrefix}/news/${article.slug}`,
        section: 'news',
        date: article.publishedAt
      })
    }

    for (const program of getPrograms(locale)) {
      documents.push({
        id: `program-${program.id}`,
        type: 'program',
        locale,
        title: program.name,
        excerpt: `${program.code} · ${program.seo.description}`,
        url: `${localePrefix}/education/programs/${program.slug}`,
        section: 'education',
        tags: [program.level]
      })
    }

    for (const employee of getEmployees(locale)) {
      documents.push({
        id: `employee-${employee.id}`,
        type: 'employee',
        locale,
        title: employee.fullName,
        excerpt: [employee.position, employee.degree].filter(Boolean).join(' · '),
        url: `${localePrefix}/about/employees/${employee.slug}`,
        section: 'about'
      })
    }

    for (const document of getDocuments(locale)) {
      documents.push({
        id: `document-${document.id}`,
        type: 'document',
        locale,
        title: document.title,
        excerpt: document.description || document.category || '',
        url: document.url || '',
        section: 'documents',
        date: document.publishedAt
      })
    }

    for (const event of getEvents(locale)) {
      documents.push({
        id: `event-${event.id}`,
        type: 'event',
        locale,
        title: event.title,
        excerpt: event.summary,
        url: `${localePrefix}/student-life/events`,
        section: 'student-life',
        date: event.startAt.slice(0, 10)
      })
    }

    for (const journal of getJournals(locale)) {
      documents.push({
        id: `journal-${journal.id}`,
        type: 'journal',
        locale,
        title: journal.title,
        excerpt: blockText(journal.description),
        url: `${localePrefix}/science/journals/${journal.slug}`,
        section: 'science'
      })
    }

    return documents
  })

  const availableTypes = computed(() => {
    const present = new Set(results.value.map((item) => item.type))
    return ['all', ...['page', 'news', 'program', 'employee', 'document', 'event', 'journal'].filter((item) => present.has(item as SearchDocument['type']))] as ResultType[]
  })

  const visibleResults = computed(() =>
    type.value === 'all' ? results.value : results.value.filter((item) => item.type === type.value)
  )

  function localSearch(value: string): SearchDocument[] {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return []
    const terms = normalized.split(/\s+/).filter(Boolean)
    return localIndex.value
      .map((item) => {
        const haystack = `${item.title} ${item.excerpt} ${(item.tags || []).join(' ')}`.toLowerCase()
        let score = 0
        for (const term of terms) {
          if (item.title.toLowerCase().includes(term)) score += 8
          if (item.excerpt.toLowerCase().includes(term)) score += 3
          if (haystack.includes(term)) score += 1
        }
        return { item, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)
      .map((entry) => entry.item)
  }

  async function search(value: string) {
    loading.value = true
    try {
      if (pagefind) {
        const response = await pagefind.search(value)
        const data = await Promise.all(response.results.slice(0, 60).map((item: any) => item.data()))
        results.value = data.map((item: any) => ({
          id: item.url,
          type: (item.meta?.type as SearchDocument['type']) || 'page',
          locale,
          title: item.meta?.title || item.url,
          excerpt: item.excerpt || '',
          url: item.url,
          section: item.meta?.section,
          tags: item.meta?.tags ? String(item.meta.tags).split(',').filter(Boolean) : []
        }))
        mode.value = 'pagefind'
      } else {
        results.value = localSearch(value)
        mode.value = 'local'
      }
    } finally {
      loading.value = false
    }
  }

  function scheduleSearch() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      const queryParams = { ...route.query }
      if (query.value.trim()) queryParams.q = query.value.trim()
      else delete queryParams.q
      if (type.value !== 'all') queryParams.type = type.value
      else delete queryParams.type
      router.replace({ query: queryParams })
      search(query.value)
    }, 250)
  }

  onMounted(async () => {
    const initialQuery = String(new URLSearchParams(window.location.search).get('q') || route.query.q || '')
    if (initialQuery) query.value = initialQuery

    if (import.meta.dev) {
      mode.value = 'local'
      if (query.value.trim()) await search(query.value)
      return
    }

    try {
      const pagefindPath = '/pagefind/pagefind.js'
      const module = await import(/* @vite-ignore */ pagefindPath)
      pagefind = (module as any).default || module
      if (pagefind?.options) {
        await pagefind.options({ excerptLength: 32 })
      }
      pagefindReady.value = true
      mode.value = 'pagefind'
    } catch {
      pagefind = null
      pagefindReady.value = false
      mode.value = 'local'
    }
    if (query.value.trim()) await search(query.value)
  })

  watch(query, scheduleSearch)
  watch(type, () => {
    const queryParams = { ...route.query, type: type.value === 'all' ? undefined : type.value }
    router.replace({ query: queryParams })
  })

  return {
    query,
    type,
    results,
    visibleResults,
    availableTypes,
    loading,
    mode,
    pagefindReady,
    search
  }
}
