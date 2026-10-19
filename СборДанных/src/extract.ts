import * as cheerio from "cheerio";
import { normalizeUrl } from "./url.js";

export interface ExtractedPage {
  title: string;
  description: string;
  h1: string;
  lang: string;
  canonical: string;
  generator: string;
  links: string[];
}

function clean(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function extractPage(text: string, pageUrl: string): ExtractedPage {
  const $ = cheerio.load(text);

  let base = pageUrl;
  const baseHref = $("base[href]").first().attr("href");
  if (baseHref) {
    try {
      base = new URL(baseHref, pageUrl).href;
    } catch {
      base = pageUrl;
    }
  }

  const links = new Set<string>();
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    const normalized = normalizeUrl(href, base);
    if (normalized) links.add(normalized);
  });

  return {
    title: clean($("title").first().text()),
    description: clean($('meta[name="description"]').attr("content")),
    h1: clean($("h1").first().text()),
    lang: clean($("html").attr("lang")),
    canonical: clean($('link[rel="canonical"]').attr("href")),
    generator: clean($('meta[name="generator"]').attr("content")),
    links: [...links],
  };
}
