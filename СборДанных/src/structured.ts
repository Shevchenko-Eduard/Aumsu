import type { CheerioAPI } from "cheerio";
import { normalizeUrl } from "./url.js";

type Selection = ReturnType<CheerioAPI>;

export interface PageMeta {
  url: string;
  finalUrl: string;
  title: string;
  description: string;
  h1: string;
  lang: string;
  fetchedAt: string;
  rawPath: string;
}

export interface ContactInfo {
  phones: string[];
  emails: string[];
  addresses: string[];
}

export interface DocumentLink {
  url: string;
  text: string;
  itemprop?: string;
  section?: string;
}

export interface PageRecord extends ContactInfo {
  url: string;
  finalUrl: string;
  title: string;
  description: string;
  h1: string;
  lang: string;
  fetchedAt: string;
  headings: string[];
  text: string;
  textLength: number;
  textTruncated: boolean;
  documents: DocumentLink[];
  internalLinks: string[];
  externalLinks: string[];
  images: Array<{ src: string; alt: string }>;
  tables: Array<{
    itemprop?: string;
    className?: string;
    headers: string[];
    rows: number;
  }>;
  microdata?: Record<string, string | string[]>;
}

export interface CommonData {
  sourceUrl: string;
  fields: Record<string, string | string[]>;
  phones: string[];
  emails: string[];
  documents: DocumentLink[];
}

export interface Department {
  name: string;
  head: string;
  post: string;
  address: string;
  phones: string[];
  emails: string[];
  site?: string;
  regulation?: { text: string; url: string };
  sourceUrl: string;
}

export interface Manager {
  category: string;
  fio: string;
  post: string;
  phones: string[];
  emails: string[];
  image?: string;
  link?: string;
  nameFil?: string;
  sourceUrl: string;
}

export interface Employee {
  fio: string;
  post: string;
  educationLevel: string;
  disciplines: string[];
  professionalDevelopment: string;
  experience: string;
  degree: string;
  academicTitle: string;
  qualifications: string[];
  sourceUrl: string;
}

export interface ProgramDocument {
  kind: string;
  links: Array<{ text: string; url: string }>;
}

export interface EducationProgram {
  code: string;
  name: string;
  level: string;
  profile: string;
  form: string;
  documents: ProgramDocument[];
  sourceUrl: string;
}

export interface EmploymentStat {
  year: string;
  graduated: string;
  employed: string;
}

export interface EmploymentRecord {
  code: string;
  name: string;
  years: EmploymentStat[];
  sourceUrl: string;
}

export interface EducationData {
  sourceUrl: string;
  programs: EducationProgram[];
  employment: EmploymentRecord[];
  accreditation: string[][];
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const DOCUMENT_EXTENSIONS = new Set([
  ".7z",
  ".doc",
  ".docx",
  ".odp",
  ".ods",
  ".odt",
  ".pdf",
  ".ppt",
  ".pptx",
  ".rar",
  ".xls",
  ".xlsx",
  ".zip",
]);

export function cleanText(value: string | undefined): string {
  return (value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueValues(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const cleaned = cleanText(value);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      try {
        return String.fromCodePoint(Number.parseInt(hex, 16));
      } catch {
        return "";
      }
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      try {
        return String.fromCodePoint(Number.parseInt(dec, 10));
      } catch {
        return "";
      }
    })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function decodeObfuscatedEmails(html: string): string[] {
  const values = new Map<string, string>();
  for (const line of html.split(/\r?\n/)) {
    const match = /\baddy(\d+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const name = `addy${match[1] ?? ""}`;
    const rightSide = match[2] ?? "";
    const literals = [...rightSide.matchAll(/'([^']*)'/g)].map((item) =>
      decodeEntities(item[1] ?? ""),
    );
    const chunk = literals.join("");
    if (!chunk) continue;
    values.set(name, `${values.get(name) ?? ""}${chunk}`);
  }

  const emails = new Set<string>();
  for (const value of values.values()) {
    for (const email of value.match(EMAIL_RE) ?? []) {
      emails.add(email);
    }
  }
  for (const match of html.matchAll(/mailto:([^"'<>?\s]+)/gi)) {
    const email = decodeEntities(match[1] ?? "");
    if (email.includes("@")) emails.add(email);
  }
  for (const email of html.match(EMAIL_RE) ?? []) {
    emails.add(email);
  }
  return [...emails];
}

export function extractPhones(text: string): string[] {
  const normalized = text.replace(/\u00a0/g, " ");
  const patterns = [
    /(?:\+7|8)\s*\(?\d{3,4}\)?[\s-]*\d{2,3}[\s-]*\d{2}[\s-]*\d{2,3}/g,
    /(?:\+7|8)\s*\(?\d{3,4}\)?[\s-]*\d{6,7}/g,
    /\b\d{2}[‑\-–]\d{2}[‑\-–]\d{2}\b/g,
  ];
  const phones = new Set<string>();
  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) {
      const value = cleanText(match[0]);
      const digits = value.replace(/\D/g, "");
      if (digits.length >= 5) phones.add(value);
    }
  }
  return [...phones];
}

function absoluteUrl(href: string, base: string): string | null {
  try {
    const url = new URL(href, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

function isInternalUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "aumsu.ru" || host === "www.aumsu.ru";
  } catch {
    return false;
  }
}

export function isDocumentUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const dot = pathname.lastIndexOf(".");
    return dot >= 0 && DOCUMENT_EXTENSIONS.has(pathname.slice(dot));
  } catch {
    return false;
  }
}

function getContent($: CheerioAPI): Selection {
  const itemPage = $(".item-page").first();
  return itemPage.length ? itemPage : $("body");
}

function sectionFor($: CheerioAPI, element: Selection): string {
  let current: Selection = element;
  for (let depth = 0; depth < 6 && current.length > 0; depth += 1) {
    const heading = current.prevAll("h2,h3,h4").first();
    if (heading.length > 0) return cleanText(heading.text());
    current = current.parent();
  }
  return "";
}

function extractEmails($: CheerioAPI, selector: string): string[] {
  const html = $(selector)
    .map((_, element) => $(element).html() ?? "")
    .get()
    .join("\n");
  return decodeObfuscatedEmails(html);
}

function extractContacts($: CheerioAPI, base: string): ContactInfo {
  const content = getContent($);
  const clone = content.clone();
  clone.find("script, style, noscript").remove();
  const text = cleanText(clone.text());

  const phones = uniqueValues([
    ...content
      .find('[itemprop="telephone"], [itemprop="fax"], [itemprop="telUchred"]')
      .map((_, element) => cleanText($(element).text()))
      .get()
      .flatMap((value) => extractPhones(value)),
    ...extractPhones(text),
  ]);

  const emails = uniqueValues([
    ...extractEmails($, "body"),
    ...(text.match(EMAIL_RE) ?? []),
  ]);

  const addresses = uniqueValues(
    content
      .find(
        '[itemprop="address"], [itemprop="addressStr"], [itemprop="addressFil"], [itemprop="addressUchred"], [itemprop="addressPlace"]',
      )
      .map((_, element) => cleanText($(element).text()))
      .get(),
  );

  return { phones, emails, addresses };
}

function linkLabel(link: Selection, url: string): string {
  const text = cleanText(link.text());
  if (text && !/^\.?pdf$/i.test(text) && text.toLowerCase() !== "pdf") {
    return text;
  }
  const titled = cleanText(link.attr("title") ?? link.attr("aria-label"));
  if (titled) return titled;
  const filename = url.split("/").pop() ?? url;
  try {
    return cleanText(decodeURIComponent(filename));
  } catch {
    return cleanText(filename);
  }
}

function extractDocuments($: CheerioAPI, base: string): DocumentLink[] {
  const documents: DocumentLink[] = [];
  const seen = new Set<string>();

  getContent($)
    .find("a[href]")
    .each((_, element) => {
      const link = $(element);
      const href = link.attr("href");
      if (!href) return;
      const url = absoluteUrl(href, base);
      if (!url) return;
      const className = link.attr("class") ?? "";
      if (!isDocumentUrl(url) && !className.includes("doc__")) return;

      const text = linkLabel(link, url);
      const key = `${url}|${text}`;
      if (seen.has(key)) return;
      seen.add(key);

      const itemprop = link.attr("itemprop");
      const section = sectionFor($, link);
      documents.push({
        url,
        text,
        ...(itemprop ? { itemprop } : {}),
        ...(section ? { section } : {}),
      });
    });

  return documents;
}

function extractMicrodata(
  $: CheerioAPI,
  base: string,
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};

  $("[itemprop]").each((_, element) => {
    if (Object.keys(result).length >= 500) return false;
    const selection = $(element);
    if (selection.find("[itemprop]").length > 0) return;

    const key = cleanText(selection.attr("itemprop"));
    if (!key) return;

    const clone = selection.clone();
    clone.find("script, style").remove();
    clone.find("br").replaceWith(" ");
    clone
      .find("p, div, li, tr, td, th, h1, h2, h3, h4")
      .each((__, node) => {
        $(node).append(" ");
      });
    let value = cleanText(clone.text());

    if (!value) value = cleanText(selection.attr("content"));
    if (!value) {
      const href = selection.attr("href");
      if (href) value = absoluteUrl(href, base) ?? href;
    }
    if (!value) {
      const src = selection.attr("src");
      if (src) value = absoluteUrl(src, base) ?? src;
    }

    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("email") ||
      lowerKey.includes("mail") ||
      value.includes("var prefix") ||
      value.includes("addy")
    ) {
      const emails = decodeObfuscatedEmails(selection.html() ?? "");
      if (emails.length > 0) {
        value = emails.join(", ");
      } else if (/защищен от спам/i.test(value)) {
        return;
      }
    }

    if (!value) return;

    const current = result[key];
    if (current === undefined) {
      result[key] = value;
    } else if (Array.isArray(current)) {
      current.push(value);
    } else {
      result[key] = [current, value];
    }
  });

  return result;
}

export function extractPageData(
  $: CheerioAPI,
  meta: PageMeta,
  includeMicrodata: boolean,
): PageRecord {
  const base = meta.finalUrl || meta.url;
  const content = getContent($);
  const clone = content.clone();
  clone
    .find(
      "script, style, noscript, form, nav, header, footer, .article-info, .skiplinks, .unseen, .pagination, .pagenav",
    )
    .remove();
  clone.find("br").replaceWith(" ");
  clone.find("p, div, li, tr, td, th, h1, h2, h3, h4").each((_, node) => {
    $(node).append(" ");
  });
  const fullText = cleanText(clone.text());
  const textLimit = 50_000;

  const headings = [
    ...new Set(
      content
        .find("h1,h2,h3,h4")
        .map((_, element) => cleanText($(element).text()))
        .get()
        .filter((value) => value.length > 0),
    ),
  ].slice(0, 100);

  const internal = new Set<string>();
  const external = new Set<string>();
  content.find("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href || /^(mailto|tel|javascript|#)/i.test(href)) return;
    const normalized = normalizeUrl(href, base);
    if (normalized) {
      internal.add(normalized);
      return;
    }
    const url = absoluteUrl(href, base);
    if (url && !isInternalUrl(url)) external.add(url);
  });

  const images = content
    .find("img[src]")
    .map((_, element) => ({
      src: absoluteUrl($(element).attr("src") ?? "", base) ?? "",
      alt: cleanText($(element).attr("alt")),
    }))
    .get()
    .filter((image) => image.src.length > 0);

  const tables = content
    .find("table")
    .map((_, element) => {
      const table = $(element);
      const headers = table
        .find("tr")
        .first()
        .find("th,td")
        .map((__, cell) => cleanText($(cell).text()))
        .get()
        .filter((value) => value.length > 0);
      const itemprop = table.attr("itemprop");
      const className = table.attr("class");
      return {
        ...(itemprop ? { itemprop } : {}),
        ...(className ? { className } : {}),
        headers: headers.slice(0, 20),
        rows: table.find("tr").length,
      };
    })
    .get();

  const contacts = extractContacts($, base);
  const microdata = includeMicrodata ? extractMicrodata($, base) : undefined;

  return {
    url: meta.url,
    finalUrl: meta.finalUrl,
    title: meta.title,
    description: meta.description,
    h1: meta.h1,
    lang: meta.lang,
    fetchedAt: meta.fetchedAt,
    headings,
    text: fullText.slice(0, textLimit),
    textLength: fullText.length,
    textTruncated: fullText.length > textLimit,
    ...contacts,
    documents: extractDocuments($, base),
    internalLinks: [...internal].slice(0, 300),
    externalLinks: [...external].slice(0, 300),
    images: images.slice(0, 100),
    tables: tables.slice(0, 30),
    ...(microdata ? { microdata } : {}),
  };
}

export function extractCommon($: CheerioAPI, sourceUrl: string): CommonData {
  const contacts = extractContacts($, sourceUrl);
  return {
    sourceUrl,
    fields: extractMicrodata($, sourceUrl),
    phones: contacts.phones,
    emails: contacts.emails,
    documents: extractDocuments($, sourceUrl),
  };
}

export function extractStructDepartments(
  $: CheerioAPI,
  sourceUrl: string,
): Department[] {
  const departments: Department[] = [];

  $('tr[itemprop="structOrgUprav"]').each((_, element) => {
    const row = $(element);
    const nameCell = row.find('[itemprop="name"]').first();
    const nameClone = nameCell.clone();
    nameClone.find("a").remove();
    const name = cleanText(nameClone.text());

    const head = cleanText(row.find('[itemprop="fio"]').first().text());
    if (!name && !head) return;

    const address = cleanText(
      row.find('[itemprop="addressStr"]').first().text(),
    );
    const clone = row.clone();
    clone.find("script, style").remove();
    const rowText = cleanText(clone.text());

    const docLink = row.find('[itemprop="divisionClauseDocLink"]').first();
    const docHref = docLink.attr("href");
    const docUrl = docHref ? absoluteUrl(docHref, sourceUrl) : null;

    const siteLink = row.find('[itemprop="site"] a').first();
    const siteHref = siteLink.attr("href");
    const site = siteHref ? absoluteUrl(siteHref, sourceUrl) : null;

    departments.push({
      name,
      head,
      post: cleanText(row.find('[itemprop="post"]').first().text()),
      address,
      phones: uniqueValues(extractPhones(`${address} ${rowText}`)),
      emails: decodeObfuscatedEmails(
        row.find('[itemprop="email"]').html() ?? "",
      ),
      ...(site ? { site } : {}),
      ...(docUrl
        ? {
            regulation: {
              text: cleanText(docLink.text()),
              url: docUrl,
            },
          }
        : {}),
      sourceUrl,
    });
  });

  return departments;
}

export function extractManagers($: CheerioAPI, sourceUrl: string): Manager[] {
  const managers: Manager[] = [];

  $(
    'tr[itemprop="rucovodstvo"], tr[itemprop="rucovodstvoZam"], tr[itemprop="rucovodstvoFil"], tr[itemprop="rucovodstvoRep"]',
  ).each((_, element) => {
    const row = $(element);
    const fio = cleanText(row.find('[itemprop="fio"]').first().text());
    const post = cleanText(row.find('[itemprop="post"]').first().text());
    const nameFil = cleanText(row.find('[itemprop="nameFil"]').first().text());
    if (!fio && !nameFil) return;
    if (fio === "отсутствует" && post === "отсутствует") return;

    const clone = row.clone();
    clone.find("script, style").remove();
    const rowText = cleanText(clone.text());

    const imageHref = row.find("img").first().attr("src");
    const image = imageHref ? absoluteUrl(imageHref, sourceUrl) : null;

    const linkElement = row
      .find('a[href]')
      .filter((__, link) => !/^(mailto|tel|javascript|#)/i.test($(link).attr("href") ?? ""))
      .first();
    const linkHref = linkElement.attr("href");
    const link = linkHref ? absoluteUrl(linkHref, sourceUrl) : null;

    managers.push({
      category: cleanText(row.attr("itemprop")),
      fio,
      post,
      phones: uniqueValues([
        ...row
          .find('[itemprop="telephone"]')
          .map((__, phone) => cleanText($(phone).text()))
          .get()
          .flatMap((value) => extractPhones(value)),
        ...extractPhones(rowText),
      ]),
      emails: uniqueValues([
        ...decodeObfuscatedEmails(row.html() ?? ""),
        ...(rowText.match(EMAIL_RE) ?? []),
      ]),
      ...(image ? { image } : {}),
      ...(link ? { link } : {}),
      ...(nameFil ? { nameFil } : {}),
      sourceUrl,
    });
  });

  return managers;
}

export function extractEmployees(
  $: CheerioAPI,
  sourceUrl: string,
): Employee[] {
  const table = $("table")
    .filter((_, element) => {
      const header = $(element).find("tr").first().text();
      return /Фамилия/i.test(header);
    })
    .first();
  if (!table.length) return [];

  const employees: Employee[] = [];
  table.find("tr").each((index, element) => {
    if (index === 0) return;
    const row = $(element);
    const cells = row.find("td");
    if (cells.length === 0) return;

    const values = cells
      .map((__, cell) => cleanText($(cell).text()))
      .get();
    const get = (itemprop: string, column: number): string =>
      cleanText(row.find(`[itemprop="${itemprop}"]`).first().text()) ||
      values[column] ||
      "";

    const fio = get("fio", 0);
    if (!fio || fio.startsWith("Фамилия")) return;

    const itempropQualifications = row
      .find('[itemprop="employeeQualification"]')
      .map((__, qualification) => cleanText($(qualification).text()))
      .get()
      .filter((value) => value.length > 0 && value !== "&nbsp;");

    const qualifications =
      itempropQualifications.length > 0
        ? itempropQualifications
        : values
            .slice(8)
            .filter((value) => value.length > 0 && value !== "&nbsp;");

    const disciplines = get("teachingDiscipline", 3)
      .split(/;+/)
      .map((value) => cleanText(value))
      .filter((value) => value.length > 0);

    employees.push({
      fio,
      post: get("post", 1),
      educationLevel: get("teachingLevel", 2),
      disciplines,
      professionalDevelopment: get("profDevelopment", 4),
      experience: get("specExperience", 5),
      degree: get("degree", 6),
      academicTitle: get("academStat", 7),
      qualifications,
      sourceUrl,
    });
  });

  return employees;
}

function extractPrograms(
  $: CheerioAPI,
  sourceUrl: string,
): EducationProgram[] {
  const table = $('table[itemprop="eduOp"]').first();
  if (!table.length) return [];

  const headerRow = table.find("tr").first();
  const headers = headerRow
    .find("th,td")
    .map((_, cell) => {
      const selection = $(cell);
      return {
        key: cleanText(selection.attr("itemprop")) || cleanText(selection.text()),
        text: cleanText(selection.text()),
      };
    })
    .get();

  const textKeys = new Set([
    "eduCode",
    "eduName",
    "eduLevel",
    "eduProf",
    "eduForm",
  ]);
  const programs: EducationProgram[] = [];

  table.find("tr").slice(1).each((_, element) => {
    const row = $(element);
    const cells = row.find("td");
    if (cells.length === 0) return;

    const data: Record<string, string> = {};
    const documentGroups: Record<string, Array<{ text: string; url: string }>> =
      {};

    cells.each((index, cell) => {
      const header = headers[index];
      if (!header || !header.key) return;
      const selection = $(cell);

      if (textKeys.has(header.key)) {
        data[header.key] = cleanText(selection.text());
        return;
      }

      const links = selection
        .find("a[href]")
        .map((__, link) => {
          const href = $(link).attr("href");
          const url = href ? absoluteUrl(href, sourceUrl) : null;
          if (!url) return null;
          return { text: linkLabel($(link), url), url };
        })
        .get()
        .filter((link): link is { text: string; url: string } => link !== null);

      if (links.length > 0) documentGroups[header.key] = links;
    });

    if (!data.eduCode && !data.eduName) return;

    programs.push({
      code: data.eduCode ?? "",
      name: data.eduName ?? "",
      level: data.eduLevel ?? "",
      profile: data.eduProf ?? "",
      form: data.eduForm ?? "",
      documents: Object.entries(documentGroups).map(([kind, links]) => ({
        kind,
        links,
      })),
      sourceUrl,
    });
  });

  return programs;
}

function extractEmployment(
  $: CheerioAPI,
  sourceUrl: string,
): EmploymentRecord[] {
  const records: EmploymentRecord[] = [];

  $('table[itemprop="graduateJob"]').each((_, element) => {
    const table = $(element);
    const rows = table.find("tr");
    if (rows.length < 3) return;

    const years = rows
      .first()
      .find("th,td")
      .map((__, cell) => cleanText($(cell).text()))
      .get()
      .filter((value) => /^\d{4}$/.test(value));
    if (years.length === 0) return;

    rows.slice(2).each((__, rowElement) => {
      const row = $(rowElement);
      const code = cleanText(row.find('[itemprop="eduCode"]').first().text());
      const name = cleanText(row.find('[itemprop="eduName"]').first().text());
      if (!code && !name) return;

      const stats: EmploymentStat[] = years.map((year, index) => ({
        year,
        graduated: cleanText(
          row.find(`[itemprop="v${index + 1}"]`).first().text(),
        ),
        employed: cleanText(
          row.find(`[itemprop="t${index + 1}"]`).first().text(),
        ),
      }));

      records.push({ code, name, years: stats, sourceUrl });
    });
  });

  return records;
}

function extractAccreditation($: CheerioAPI): string[][] {
  const table = $('table[itemprop="eduAccred"]').first();
  if (!table.length) return [];

  const rows: string[][] = [];
  table.find("tr").each((_, element) => {
    const row = $(element)
      .find("th,td")
      .map((__, cell) => cleanText($(cell).text()))
      .get()
      .filter((value) => value.length > 0);
    if (row.length > 0) rows.push(row);
  });
  return rows;
}

export function extractEducation(
  $: CheerioAPI,
  sourceUrl: string,
): EducationData {
  return {
    sourceUrl,
    programs: extractPrograms($, sourceUrl),
    employment: extractEmployment($, sourceUrl),
    accreditation: extractAccreditation($),
  };
}
