import { settings } from "./config.js";

const EXCLUDED_PREFIXES = [
  "/administrator",
  "/cache",
  "/component/k2",
  "/component/search",
  "/component/users",
  "/components",
  "/images",
  "/language",
  "/media",
  "/modules",
  "/plugins",
  "/templates",
];

const EXCLUDED_EXTENSIONS = new Set([
  ".7z",
  ".avi",
  ".css",
  ".doc",
  ".docx",
  ".eot",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".mp3",
  ".mp4",
  ".pdf",
  ".png",
  ".ppt",
  ".pptx",
  ".rar",
  ".svg",
  ".ttf",
  ".webp",
  ".woff",
  ".woff2",
  ".xls",
  ".xlsx",
  ".zip",
]);

const SKIPPED_QUERY_KEYS = new Set([
  "format",
  "lang",
  "limitstart",
  "offset",
  "page",
  "print",
  "searchword",
  "start",
  "tmpl",
]);

const TRACKING_QUERY_KEYS = new Set([
  "_openstat",
  "fbclid",
  "gclid",
  "yclid",
]);

function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function normalizeUrl(raw: string, base: string): string | null {
  const value = raw.trim();
  if (!value || value.startsWith("#")) return null;
  if (/\s/.test(value)) return null;
  if (/^(mailto|tel|javascript|data):/i.test(value)) return null;
  if (/^www\./i.test(value)) return null;
  if (/^%20|^%E2%80%93/i.test(value)) return null;

  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!settings.allowedHosts.has(url.hostname.toLowerCase())) return null;

  let decodedPath = url.pathname;
  try {
    decodedPath = decodeURIComponent(decodedPath);
  } catch {
    return null;
  }
  if (/https?:/i.test(decodedPath) || /(^|\/)www\./i.test(decodedPath)) {
    return null;
  }

  let pathname = url.pathname.replace(/\/{2,}/g, "/");
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  if (!pathname) pathname = "/";

  const lastSegment = pathname.split("/").pop() ?? "";
  const dot = lastSegment.lastIndexOf(".");
  if (dot > 0 && EXCLUDED_EXTENSIONS.has(lastSegment.slice(dot).toLowerCase())) {
    return null;
  }
  if (EXCLUDED_PREFIXES.some((prefix) => hasPrefix(pathname, prefix))) return null;

  const params = [...url.searchParams.entries()].filter(
    ([key]) =>
      !TRACKING_QUERY_KEYS.has(key.toLowerCase()) &&
      !key.toLowerCase().startsWith("utm_"),
  );

  if (
    params.some(
      ([key, value]) =>
        SKIPPED_QUERY_KEYS.has(key.toLowerCase()) ||
        (key.toLowerCase() === "view" && value.toLowerCase() === "featured") ||
        (key.toLowerCase() === "option" && value.toLowerCase() === "com_users"),
    )
  ) {
    return null;
  }

  params.sort(([aKey, aValue], [bKey, bValue]) => {
    const byKey = aKey.localeCompare(bKey);
    return byKey !== 0 ? byKey : aValue.localeCompare(bValue);
  });

  const query = params.length
    ? `?${params
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join("&")}`
    : "";

  return `${settings.origin}${pathname}${query}`;
}

export function isCrawlableUrl(url: string): boolean {
  return normalizeUrl(url, settings.origin) === url;
}
