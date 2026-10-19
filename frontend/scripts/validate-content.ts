import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(scriptDir, '..')
const contentRoot = path.join(root, 'content')
const errors: string[] = []
const warnings: string[] = []

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  })
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    errors.push(`${path.relative(root, file)}: invalid JSON (${(error as Error).message})`)
    return null
  }
}

const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1)
})

const baseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(['draft', 'review', 'scheduled', 'published', 'archived']),
  locale: z.enum(['ru', 'en']),
  seo: seoSchema
})

const pageSchema = baseSchema.extend({
  path: z.string().startsWith('/'),
  title: z.string().min(1),
  body: z.array(z.object({ type: z.string() }).passthrough())
})

const programSchema = baseSchema.extend({
  code: z.string().min(1),
  name: z.string().min(1),
  level: z.enum(['bachelor', 'specialist', 'master', 'graduate', 'college', 'dpo']),
  forms: z.array(z.enum(['full-time', 'part-time', 'distance', 'mixed'])).min(1)
})

const employeeSchema = baseSchema.extend({
  fullName: z.string().min(1),
  position: z.string().min(1)
})

const newsSchema = baseSchema.extend({
  title: z.string().min(1),
  summary: z.string().min(1),
  body: z.array(z.object({ type: z.string() }).passthrough())
})

const svedenSchema = pageSchema.extend({
  slug: z.string().min(1),
  sveden: z.object({
    section: z.string().min(1),
    fields: z.array(
      z.object({
        itemprop: z.string().min(1),
        label: z.string().min(1),
        value: z.union([z.string(), z.array(z.string())]),
        required: z.boolean()
      })
    ),
    tables: z.array(z.object({ headers: z.array(z.string()), rows: z.array(z.array(z.string())) }))
  })
})

const collections: Array<{
  folder: string
  schema: z.ZodTypeAny
  optional?: boolean
}> = [
  { folder: 'pages', schema: pageSchema },
  { folder: 'programs', schema: programSchema },
  { folder: 'employees', schema: employeeSchema },
  { folder: 'news', schema: newsSchema },
  { folder: 'sveden', schema: svedenSchema },
  { folder: 'org-units', schema: z.object({}).passthrough(), optional: true },
  { folder: 'events', schema: z.object({}).passthrough(), optional: true },
  { folder: 'journals', schema: z.object({}).passthrough(), optional: true }
]

const pagesByLocale: Record<string, Set<string>> = { ru: new Set(), en: new Set() }

for (const locale of ['ru', 'en'] as const) {
  for (const collection of collections) {
    const dir = path.join(contentRoot, locale, collection.folder)
    const files = walk(dir)
    if (!files.length && !collection.optional) {
      errors.push(`${locale}/${collection.folder}: collection is empty`)
    }
    for (const file of files) {
      const data = readJson(file)
      if (!data) continue
      const result = collection.schema.safeParse(data)
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push(`${path.relative(root, file)}: ${issue.path.join('.') || 'root'} — ${issue.message}`)
        }
      }
      if (collection.folder === 'pages' && data && typeof data === 'object' && 'path' in data) {
        pagesByLocale[locale].add(String((data as { path: string }).path))
      }
      if (collection.folder === 'sveden' && data && typeof data === 'object' && 'sveden' in data) {
        const page = data as { sveden: { fields: Array<{ itemprop: string; value: string | string[]; required: boolean; label: string }> } }
        for (const field of page.sveden.fields) {
          if (field.required) {
            const values = Array.isArray(field.value) ? field.value : [field.value]
            if (!values.length || values.every((value) => !value.trim())) {
              errors.push(`${path.relative(root, file)}: required field "${field.itemprop}" is empty`)
            }
          }
        }
      }
    }
  }
}

for (const file of walk(contentRoot)) {
  if (file.endsWith('routes.json') || file.endsWith('redirects.json') || file.endsWith('gone.json')) {
    const data = readJson(file)
    if (data) warnings.push(`${path.relative(root, file)}: ok`)
  }
}

const ruPages = pagesByLocale.ru
const enPages = pagesByLocale.en
for (const page of ruPages) {
  if (!enPages.has(page) && !page.startsWith('/news/archive')) {
    warnings.push(`EN mirror missing: ${page}`)
  }
}

const routesFile = path.join(contentRoot, 'routes.json')
if (fs.existsSync(routesFile)) {
  const routes = readJson(routesFile) as string[]
  const routeSet = new Set(routes)
  const navigation = readJson(path.join(contentRoot, 'ru/navigation.json')) as {
    main: Array<{ path: string }>
    footer: Array<{ path: string }>
    utility: Array<{ path: string }>
  }
  const menuPaths = [...navigation.main, ...navigation.footer, ...navigation.utility].map((item) => item.path)
  for (const menuPath of menuPaths) {
    if (!routeSet.has(menuPath)) errors.push(`Navigation target not found in routes: ${menuPath}`)
  }

  const redirects = readJson(path.join(contentRoot, 'shared/redirects.json')) as Array<{ from: string; to: string }>
  const fromSet = new Set(redirects.map((item) => item.from))
  for (const redirect of redirects) {
    if (fromSet.has(redirect.to)) {
      errors.push(`Redirect chain: ${redirect.from} → ${redirect.to}`)
    }
    if (redirect.to.startsWith('/') && !routeSet.has(redirect.to)) {
      warnings.push(`Redirect target not in routes: ${redirect.from} → ${redirect.to}`)
    }
  }
} else {
  errors.push('content/routes.json is missing')
}

const counts = collections.map((collection) => {
  const ru = walk(path.join(contentRoot, 'ru', collection.folder)).length
  const en = walk(path.join(contentRoot, 'en', collection.folder)).length
  return `${collection.folder}: ${ru} RU / ${en} EN`
})

console.log('Content collections:')
for (const line of counts) console.log(`  ${line}`)

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`)
  for (const warning of warnings.slice(0, 20)) console.log(`  - ${warning}`)
  if (warnings.length > 20) console.log(`  … and ${warnings.length - 20} more`)
}

if (errors.length) {
  console.error(`\nContent validation failed with ${errors.length} error(s):`)
  for (const error of errors.slice(0, 50)) console.error(`  - ${error}`)
  if (errors.length > 50) console.error(`  … and ${errors.length - 50} more`)
  process.exit(1)
}

console.log('\nContent validation passed.')
