import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(frontendRoot, '..')
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://aumsu.ru').replace(/\/$/, '')
const routes = JSON.parse(fs.readFileSync(path.join(frontendRoot, 'content/routes.json'), 'utf8'))
const routeSet = new Set(routes.map((route) => route.replace(/^\/en(?=\/|$)/, '') || '/'))

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function write(rel, value) {
  const file = path.join(frontendRoot, rel)
  ensureDir(path.dirname(file))
  fs.writeFileSync(file, value, 'utf8')
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''))
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ''))
    rows.push(row)
  }
  return rows
}

function normalizeLegacy(value) {
  try {
    const url = new URL(value)
    return decodeURI(url.pathname).replace(/\/+$/, '') || '/'
  } catch {
    const clean = String(value).split('?')[0].split('#')[0]
    return clean.startsWith('/') ? clean.replace(/\/+$/, '') || '/' : `/${clean}`
  }
}

function sectionFallback(target) {
  if (routeSet.has(target)) return target
  const segments = target.split('/').filter(Boolean)
  for (let length = segments.length; length > 0; length -= 1) {
    const candidate = `/${segments.slice(0, length).join('/')}`
    if (routeSet.has(candidate)) return candidate
  }
  return '/'
}

const csvPath = path.join(repoRoot, 'specs/redirects/url-map.csv')
const csv = fs.readFileSync(csvPath, 'utf8')
const rows = parseCsv(csv)
const header = rows.shift()
const indexes = {
  current_url: header.indexOf('current_url'),
  title: header.indexOf('title'),
  status: header.indexOf('status'),
  action: header.indexOf('action'),
  proposed_url: header.indexOf('proposed_url'),
  note: header.indexOf('note')
}

const redirects = new Map()
const gone = new Set()

for (const row of rows) {
  if (row.length < 5) continue
  const current = row[indexes.current_url]
  const action = row[indexes.action]
  const proposed = row[indexes.proposed_url]
  if (!current) continue
  const from = normalizeLegacy(current)
  if (from === '/' || from === '') continue

  if (action === 'delete') {
    gone.add(from)
    continue
  }

  if (['redirect', 'merge', 'rewrite'].includes(action)) {
    let to = proposed && proposed.startsWith('/') ? proposed.replace(/\/+$/, '') || '/' : ''
    if (to) to = sectionFallback(to)
    if (!to) to = sectionFallback(`/${from.split('/').filter(Boolean)[0] || ''}`)
    if (from !== to) redirects.set(from, { from, to, status: 301 })
    continue
  }

  if (action === 'archive') {
    const to = from.includes('news') || from.includes('archiv') ? '/news/archive' : '/news/archive'
    redirects.set(from, { from, to, status: 301 })
  }
}

for (const from of gone) {
  redirects.delete(from)
}

// Add a few known aliases from the current site.
for (const [from, to] of Object.entries({
  '/abitur': '/admissions',
  '/abitur/bachelor': '/admissions/bachelor',
  '/abitur/magistr': '/admissions/master',
  '/abitur/special': '/admissions/specialist',
  '/abitur/aspirant': '/admissions/graduate',
  '/abitur/spo': '/admissions/college',
  '/obrazovanie': '/education',
  '/education/bakalavriat': '/education/bachelor',
  '/education/specialitet': '/education/specialist',
  '/education/magistratura': '/education/master',
  '/education/biblioteka': '/education/library',
  '/istoriya-universiteta': '/about/history',
  '/uchenyj-sovet': '/about/academic-council',
  '/o-rektore': '/about/rector',
  '/telefonnyj-spravochnik': '/contacts/phonebook',
  '/archiv_news': '/news/archive',
  '/arkhiv-novostej': '/news/archive',
  '/spec': '/education/specialist',
  '/index.php/obrazovanie': '/education',
  '/index.php/abiturientu': '/admissions'
})) {
  if (routeSet.has(to)) redirects.set(from, { from, to, status: 301 })
}

const redirectList = [...redirects.values()].sort((a, b) => a.from.localeCompare(b.from))
const goneList = [...gone].sort()

write('content/shared/redirects.json', JSON.stringify(redirectList, null, 2) + '\n')
write('content/shared/gone.json', JSON.stringify(goneList, null, 2) + '\n')
write('public/redirects.json', JSON.stringify(redirectList, null, 2) + '\n')
write('public/gone.json', JSON.stringify(goneList, null, 2) + '\n')

const mapLines = redirectList.map((item) => `  ${item.from} ${item.to};`).join('\n')
const goneMapLines = goneList.map((item) => `  ${item} /410;`).join('\n')
const nginx = `# Generated by scripts/generate-artifacts.mjs
# Place this file in /etc/nginx/conf.d/aumsu.conf and adjust paths.

map $uri $redirect_target {
  default "";
${mapLines}
${goneMapLines}
}

server {
  listen 80;
  server_name aumsu.ru www.aumsu.ru;
  return 301 https://aumsu.ru$request_uri;
}

server {
  listen 443 ssl http2;
  server_name aumsu.ru;

  root /var/www/aumsu/.output/public;
  index index.html;

  # Configure TLS certificates before enabling this server.
  # ssl_certificate /etc/letsencrypt/live/aumsu.ru/fullchain.pem;
  # ssl_certificate_key /etc/letsencrypt/live/aumsu.ru/privkey.pem;

  if ($redirect_target = "/410") {
    return 410;
  }
  if ($redirect_target) {
    return 301 $redirect_target;
  }

  location /_nuxt/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
  }

  location /pagefind/ {
    expires 7d;
    add_header Cache-Control "public";
    try_files $uri =404;
  }

  location / {
    try_files $uri $uri/ $uri.html /404.html;
  }

  error_page 404 /404.html;
}
`
write('deploy/nginx.conf', nginx)

const publicRoutes = routes.filter((route) => !['/search', '/en/search', '/news/archive', '/en/news/archive'].includes(route))
const sitemapEntries = publicRoutes
  .map((route) => {
    const loc = `${siteUrl}${route === '/' ? '' : route}`
    const ruPath = route.replace(/^\/en(?=\/|$)/, '') || '/'
    const enPath = ruPath === '/' ? '/en' : `/en${ruPath}`
    const alternates = [
      `    <xhtml:link rel="alternate" hreflang="ru" href="${siteUrl}${ruPath === '/' ? '' : ruPath}" />`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${enPath}" />`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${ruPath === '/' ? '' : ruPath}" />`
    ].join('\n')
    return `  <url>\n    <loc>${loc}</loc>\n${alternates}\n  </url>`
  })
  .join('\n')

write(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapEntries}\n</urlset>\n`
)

write(
  'public/robots.txt',
  `User-agent: *\nAllow: /\nDisallow: /search\nDisallow: /en/search\nDisallow: /news/archive\nDisallow: /en/news/archive\nSitemap: ${siteUrl}/sitemap.xml\n`
)

console.log(`Artifacts generated: ${redirectList.length} redirects, ${goneList.length} gone, ${publicRoutes.length} sitemap URLs`)
