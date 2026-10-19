import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const publicDir = path.resolve(process.env.PUBLIC_DIR || path.join(process.cwd(), 'public'))
const port = Number(process.env.PORT || 3000)
const host = process.env.HOST || '0.0.0.0'

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.pdf': 'application/pdf',
  '.map': 'application/json; charset=utf-8'
}

let redirects = new Map()
let gone = new Set()

async function loadRules() {
  redirects = new Map()
  gone = new Set()
  try {
    const list = JSON.parse(await readFile(path.join(publicDir, 'redirects.json'), 'utf8'))
    for (const item of list) redirects.set(item.from, item.to)
  } catch {
    console.warn('redirects.json not found, skipping redirects')
  }
  try {
    gone = new Set(JSON.parse(await readFile(path.join(publicDir, 'gone.json'), 'utf8')))
  } catch {
    console.warn('gone.json not found, skipping 410 rules')
  }
}

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
}

function cacheHeaders(pathname) {
  if (pathname.startsWith('/_nuxt/')) {
    return { 'Cache-Control': 'public, max-age=31536000, immutable' }
  }
  if (pathname.startsWith('/pagefind/')) {
    return { 'Cache-Control': 'public, max-age=604800' }
  }
  if (pathname.startsWith('/media/')) {
    return { 'Cache-Control': 'public, max-age=2592000' }
  }
  return { 'Cache-Control': 'no-cache' }
}

async function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname)
  const safePath = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '')
  const base = path.join(publicDir, safePath)
  const relative = path.relative(publicDir, base)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null

  const candidates = [base]
  if (decoded.endsWith('/')) {
    candidates.unshift(path.join(base, 'index.html'))
  } else {
    candidates.push(path.join(base, 'index.html'))
    if (!path.extname(decoded)) candidates.push(`${base}.html`)
  }

  for (const candidate of candidates) {
    try {
      const info = await stat(candidate)
      if (info.isFile()) return candidate
    } catch {
      // try the next candidate
    }
  }
  return null
}

async function sendFile(res, filePath, pathname, status = 200, method = 'GET') {
  const body = await readFile(filePath)
  const type = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': body.length,
    ...securityHeaders(),
    ...cacheHeaders(pathname)
  })
  if (method === 'HEAD') res.end()
  else res.end(body)
}

const server = createServer(async (req, res) => {
  const method = req.method || 'GET'
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', ...securityHeaders() })
    res.end('Method Not Allowed')
    return
  }

  let url
  try {
    url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  } catch {
    res.writeHead(400, securityHeaders())
    res.end('Bad Request')
    return
  }

  const pathname = url.pathname
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  if (gone.has(normalized) || gone.has(pathname)) {
    res.writeHead(410, { 'Content-Type': 'text/plain; charset=utf-8', ...securityHeaders() })
    res.end('Gone')
    return
  }

  const target = redirects.get(normalized) || redirects.get(pathname)
  if (target) {
    res.writeHead(301, { Location: target, ...securityHeaders() })
    res.end()
    return
  }

  try {
    const file = await resolveFile(pathname)
    if (file) {
      await sendFile(res, file, pathname, 200, method)
      return
    }
    await sendFile(res, path.join(publicDir, '404.html'), pathname, 404, method)
  } catch (error) {
    console.error(error)
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', ...securityHeaders() })
    res.end('Internal Server Error')
  }
})

await loadRules()
server.listen(port, host, () => {
  console.log(`Frontend server: http://${host}:${port}`)
  console.log(`Static root: ${publicDir}`)
  console.log(`Redirects: ${redirects.size}, gone: ${gone.size}`)
})

function shutdown(signal) {
  console.log(`${signal} received, shutting down`)
  server.close(() => process.exit(0))
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
