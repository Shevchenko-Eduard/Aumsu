interface PageSeoOptions {
  title: string
  description: string
  path?: string
  ogImage?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export function usePageSeo(options: PageSeoOptions) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { locale } = useI18n()
  const siteUrl = String(config.public.siteUrl || 'https://aumsu.ru').replace(/\/$/, '')

  const currentPath = options.path || route.path
  const cleanPath = currentPath.split('?')[0] || '/'
  const ruPath = cleanPath.replace(/^\/en(?=\/|$)/, '') || '/'
  const enPath = ruPath === '/' ? '/en' : `/en${ruPath}`
  const canonical = `${siteUrl}${cleanPath === '/' && locale.value === 'en' ? '/en' : cleanPath}`
  const ogImage = options.ogImage ? `${siteUrl}${options.ogImage}` : `${siteUrl}/media/og/default.svg`
  const title = options.title
  const description = options.description

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogUrl: canonical,
    ogImage,
    ogLocale: locale.value === 'en' ? 'en_US' : 'ru_RU',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    robots: options.noindex ? 'noindex, nofollow' : 'index, follow'
  })

  useHead(() => ({
    htmlAttrs: { lang: locale.value === 'en' ? 'en' : 'ru' },
    link: [
      { rel: 'canonical', href: canonical },
      { rel: 'alternate', hreflang: 'ru', href: `${siteUrl}${ruPath}` },
      { rel: 'alternate', hreflang: 'en', href: `${siteUrl}${enPath}` },
      { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}${ruPath}` }
    ],
    script: options.jsonLd
      ? [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(options.jsonLd)
          }
        ]
      : []
  }))
}

export function organizationJsonLd() {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || 'https://aumsu.ru').replace(/\/$/, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: 'Государственный морской университет имени адмирала Ф.Ф. Ушакова',
    alternateName: 'ГМУ им. адм. Ф.Ф. Ушакова',
    url: siteUrl,
    logo: `${siteUrl}/media/logo.svg`,
    image: `${siteUrl}/media/og/default.svg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Новороссийск',
      addressCountry: 'RU',
      streetAddress: 'проспект Ленина, 93',
      postalCode: '353924'
    },
    telephone: '+7 (8617) 71-75-25',
    email: 'mail@nsma.ru'
  }
}

export function breadcrumbJsonLd(items: Array<{ title: string; path: string }>) {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || 'https://aumsu.ru').replace(/\/$/, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      item: `${siteUrl}${item.path}`
    }))
  }
}
