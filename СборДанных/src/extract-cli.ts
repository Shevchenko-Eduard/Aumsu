import * as cheerio from "cheerio";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { paths } from "./config.js";
import {
  appendJsonl,
  writeErrorReport,
  writeJson,
} from "./storage.js";
import {
  extractCommon,
  extractEducation,
  extractEmployees,
  extractManagers,
  extractPageData,
  extractStructDepartments,
  type CommonData,
  type Department,
  type EducationProgram,
  type Employee,
  type EmploymentRecord,
  type Manager,
  type PageMeta,
} from "./structured.js";

interface Options {
  runId: string;
  outDir: string;
  limit: number | null;
}

interface AggregatedDocument {
  url: string;
  text: string;
  itemprop?: string;
  sections: string[];
  sources: string[];
}

function getArg(name: string): string | undefined {
  const equalsPrefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(equalsPrefix));
  if (inline) return inline.slice(equalsPrefix.length);

  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

function getNumber(name: string, fallback: number): number {
  const raw = getArg(name);
  if (raw === undefined) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return value;
}

async function latestRunId(): Promise<string> {
  const entries = await readdir(paths.runs, { withFileTypes: true });
  const runs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const latest = runs.at(-1);
  if (!latest) {
    throw new Error(`No crawl runs found in ${paths.runs}. Run "npm run crawl" first.`);
  }
  return latest;
}

function readOptions(runId: string): Options {
  const limitRaw = getArg("--limit");
  return {
    runId: getArg("--run") ?? runId,
    outDir: path.resolve(
      getArg("--out") ?? path.join(paths.data, "extracted"),
    ),
    limit: limitRaw === undefined ? null : getNumber("--limit", 0),
  };
}

function dedupeBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyFn(item).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function firstField(
  fields: Record<string, string | string[]>,
  key: string,
): string {
  const value = fields[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

async function main(): Promise<void> {
  const startedAt = new Date();
  const runId = await latestRunId();
  const options = readOptions(runId);
  const pagesFile = path.join(paths.runs, options.runId, "pages.jsonl");
  const outDir = options.outDir;
  const svedenDir = path.join(outDir, "sveden");
  const outputPagesFile = path.join(outDir, "pages.jsonl");

  await mkdir(svedenDir, { recursive: true });
  await writeFile(outputPagesFile, "", "utf8");

  const lines = (await readFile(pagesFile, "utf8"))
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  const records = lines
    .map((line) => JSON.parse(line) as PageMeta & { type?: string })
    .filter((record) => record.type === "page");
  const selected = options.limit ? records.slice(0, options.limit) : records;

  let common: CommonData | null = null;
  const departments: Department[] = [];
  const managers: Manager[] = [];
  const employees: Employee[] = [];
  const programs: EducationProgram[] = [];
  const employment: EmploymentRecord[] = [];
  const accreditation: string[][] = [];
  const documents = new Map<string, AggregatedDocument>();
  const errors: Array<{ url: string; error: string }> = [];
  let extractedPages = 0;

  console.log(
    `Extracting run ${options.runId}: pages=${selected.length}, output=${outDir}`,
  );

  for (const record of selected) {
    try {
      const compressed = await readFile(
        path.join(paths.data, record.rawPath),
      );
      const html = gunzipSync(compressed).toString("utf8");
      const $ = cheerio.load(html);
      const pathname = new URL(record.url).pathname;
      const isSveden =
        pathname === "/sveden" || pathname.startsWith("/sveden/");
      const isCommon = pathname === "/sveden/common";
      const isStruct =
        pathname === "/sveden/struct" ||
        pathname.startsWith("/sveden/struct/");
      const isManagers = pathname === "/sveden/managers";
      const isEmployees = pathname === "/sveden/employees";
      const isEducation = pathname === "/sveden/education";
      const isDocument =
        pathname === "/sveden/document" ||
        pathname.startsWith("/sveden/document/");

      const includeMicrodata =
        isSveden &&
        !isCommon &&
        !isStruct &&
        !isManagers &&
        !isEmployees &&
        !isEducation &&
        !isDocument;

      const page = extractPageData($, record, includeMicrodata);
      await appendJsonl(outputPagesFile, page);
      extractedPages += 1;

      if (isCommon) common = extractCommon($, record.url);
      if (isStruct) {
        departments.push(...extractStructDepartments($, record.url));
      }
      if (isManagers) managers.push(...extractManagers($, record.url));
      if (isEmployees) employees.push(...extractEmployees($, record.url));
      if (isEducation) {
        const data = extractEducation($, record.url);
        programs.push(...data.programs);
        employment.push(...data.employment);
        accreditation.push(...data.accreditation);
      }

      for (const document of page.documents) {
        const existing = documents.get(document.url);
        if (existing) {
          existing.sources.push(record.url);
          if (document.section) existing.sections.push(document.section);
        } else {
          documents.set(document.url, {
            url: document.url,
            text: document.text,
            ...(document.itemprop ? { itemprop: document.itemprop } : {}),
            sections: document.section ? [document.section] : [],
            sources: [record.url],
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ url: record.url, error: message });
    }

    if (extractedPages % 50 === 0 && extractedPages > 0) {
      console.log(
        `extracted=${extractedPages} errors=${errors.length} departments=${departments.length} managers=${managers.length} employees=${employees.length} programs=${programs.length}`,
      );
    }
  }

  const uniqueDepartments = dedupeBy(
    departments,
    (item) => `${item.name}|${item.head}`,
  );
  const uniqueManagers = dedupeBy(
    managers,
    (item) => `${item.category}|${item.fio}|${item.post}|${item.sourceUrl}`,
  );
  const uniqueEmployees = dedupeBy(
    employees,
    (item) => `${item.fio}|${item.post}|${item.sourceUrl}`,
  );
  const uniquePrograms = dedupeBy(
    programs,
    (item) =>
      `${item.code}|${item.name}|${item.level}|${item.profile}|${item.form}|${item.sourceUrl}`,
  );
  const uniqueEmployment = dedupeBy(
    employment,
    (item) =>
      `${item.code}|${item.name}|${item.sourceUrl}|${JSON.stringify(item.years)}`,
  );
  const uniqueAccreditation = [
    ...new Map(
      accreditation.map((row) => [row.join("|"), row] as const),
    ).values(),
  ];

  const documentList = [...documents.values()]
    .map((document) => ({
      ...document,
      sections: [...new Set(document.sections)].sort(),
      sources: [...new Set(document.sources)].sort(),
    }))
    .sort((a, b) => a.text.localeCompare(b.text) || a.url.localeCompare(b.url));

  const rector =
    uniqueManagers.find(
      (manager) =>
        /ректор/i.test(manager.post) && !/проректор/i.test(manager.post),
    ) ??
    uniqueManagers.find((manager) => manager.category === "rucovodstvo") ??
    null;

  const organization = {
    name: common ? firstField(common.fields, "fullName") : "",
    shortName: common ? firstField(common.fields, "shortName") : "",
    address: common ? firstField(common.fields, "address") : "",
    regDate: common ? firstField(common.fields, "regDate") : "",
    website: "https://aumsu.ru",
    phones: common?.phones ?? [],
    emails: common?.emails ?? [],
    rector: rector
      ? {
          fio: rector.fio,
          post: rector.post,
          phones: rector.phones,
          emails: rector.emails,
        }
      : null,
    counts: {
      departments: uniqueDepartments.length,
      managers: uniqueManagers.length,
      employees: uniqueEmployees.length,
      programs: uniquePrograms.length,
      documents: documentList.length,
    },
    sourceUrls: [
      ...new Set([
        ...(common ? [common.sourceUrl] : []),
        ...uniqueManagers.map((item) => item.sourceUrl),
        ...uniqueEmployees.map((item) => item.sourceUrl),
        ...uniquePrograms.map((item) => item.sourceUrl),
        ...uniqueDepartments.map((item) => item.sourceUrl),
      ]),
    ].sort(),
  };

  await writeJson(path.join(svedenDir, "common.json"), common);
  await writeJson(path.join(svedenDir, "struct.json"), {
    count: uniqueDepartments.length,
    departments: uniqueDepartments,
  });
  await writeJson(path.join(svedenDir, "managers.json"), {
    count: uniqueManagers.length,
    managers: uniqueManagers,
  });
  await writeJson(path.join(svedenDir, "employees.json"), {
    count: uniqueEmployees.length,
    employees: uniqueEmployees,
  });
  await writeJson(path.join(svedenDir, "education.json"), {
    counts: {
      programs: uniquePrograms.length,
      employment: uniqueEmployment.length,
      accreditationRows: uniqueAccreditation.length,
    },
    programs: uniquePrograms,
    employment: uniqueEmployment,
    accreditation: uniqueAccreditation,
  });
  await writeJson(path.join(outDir, "documents.json"), {
    count: documentList.length,
    documents: documentList,
  });
  await writeJson(path.join(outDir, "organization.json"), organization);
  await writeErrorReport(path.join(outDir, "errors.txt"), errors);

  const finishedAt = new Date();
  await writeJson(path.join(outDir, "report.json"), {
    runId: options.runId,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    pages: extractedPages,
    errors: errors.length,
    counts: {
      departments: uniqueDepartments.length,
      managers: uniqueManagers.length,
      employees: uniqueEmployees.length,
      programs: uniquePrograms.length,
      employment: uniqueEmployment.length,
      documents: documentList.length,
    },
  });

  console.log(
    `Done: pages=${extractedPages}, departments=${uniqueDepartments.length}, managers=${uniqueManagers.length}, employees=${uniqueEmployees.length}, programs=${uniquePrograms.length}, documents=${documentList.length}, errors=${errors.length}`,
  );
  console.log(`Output: ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
