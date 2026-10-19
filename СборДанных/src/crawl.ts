import { mkdir } from "node:fs/promises";
import path from "node:path";
import { paths, settings } from "./config.js";
import { extractPage } from "./extract.js";
import { fetchPage } from "./fetch.js";
import {
  appendJsonl,
  ensureDataDirs,
  readUrlList,
  saveRaw,
  writeErrorReport,
  writeJson,
  writePlainUrls,
  writeUrlList,
} from "./storage.js";
import { normalizeUrl } from "./url.js";

interface Options {
  out: string;
  maxPages: number;
  maxDepth: number;
  concurrency: number;
  delayMs: number;
}

interface QueueItem {
  url: string;
  depth: number;
}

interface PageError {
  url: string;
  error: string;
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

function readOptions(): Options {
  return {
    out: path.resolve(getArg("--out") ?? paths.defaultOut),
    maxPages: getNumber("--max-pages", settings.maxPages),
    maxDepth: getNumber("--max-depth", settings.maxDepth),
    concurrency: getNumber("--concurrency", settings.concurrency),
    delayMs: getNumber("--delay", settings.requestDelayMs),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const options = readOptions();
  const startedAt = new Date();
  const runId = startedAt.toISOString().replace(/[:.]/g, "-");
  const runDir = path.join(paths.runs, runId);
  const pagesFile = path.join(runDir, "pages.jsonl");

  await ensureDataDirs();
  await mkdir(runDir, { recursive: true });

  const existing = await readUrlList(options.out);
  const seedUrls = new Set<string>();
  for (const raw of [...settings.seeds, ...existing]) {
    const normalized = normalizeUrl(raw, settings.origin);
    if (normalized) seedUrls.add(normalized);
  }

  const queue: QueueItem[] = [];
  const queued = new Set<string>();
  const visited = new Set<string>();
  const successful = new Set<string>();
  const discovered = new Set<string>(seedUrls);
  const errors: PageError[] = [];

  let active = 0;
  let processed = 0;
  let saved = 0;

  const enqueue = (url: string, depth: number): void => {
    if (visited.has(url) || queued.has(url)) return;
    queued.add(url);
    discovered.add(url);
    queue.push({ url, depth });
  };

  for (const url of seedUrls) enqueue(url, 0);

  console.log(
    `Crawling ${settings.origin}: maxPages=${options.maxPages}, maxDepth=${options.maxDepth}, concurrency=${options.concurrency}, seeds=${seedUrls.size}`,
  );

  const worker = async (): Promise<void> => {
    while (true) {
      if (processed >= options.maxPages) return;

      const item = queue.shift();
      if (!item) {
        if (active === 0) return;
        await sleep(50);
        continue;
      }

      if (visited.has(item.url)) continue;
      visited.add(item.url);
      queued.delete(item.url);
      active += 1;
      processed += 1;

      try {
        const result = await fetchPage(item.url);
        const extracted = extractPage(result.text, result.finalUrl);
        const raw = await saveRaw(result.buffer);
        saved += 1;
        successful.add(item.url);

        await appendJsonl(pagesFile, {
          type: "page",
          runId,
          url: item.url,
          finalUrl: result.finalUrl,
          depth: item.depth,
          status: result.status,
          contentType: result.contentType,
          fetchedAt: result.fetchedAt,
          bytes: result.buffer.byteLength,
          sha256: raw.sha256,
          rawPath: raw.relativePath,
          title: extracted.title,
          description: extracted.description,
          h1: extracted.h1,
          lang: extracted.lang,
          canonical: extracted.canonical,
          generator: extracted.generator,
          linkCount: extracted.links.length,
        });

        if (item.depth < options.maxDepth) {
          for (const link of extracted.links) {
            enqueue(link, item.depth + 1);
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        errors.push({ url: item.url, error: message });
        await appendJsonl(pagesFile, {
          type: "error",
          runId,
          url: item.url,
          depth: item.depth,
          error: message,
          fetchedAt: new Date().toISOString(),
        });
        console.warn(`FAIL ${item.url}: ${message}`);
      } finally {
        active -= 1;
      }

      if (processed % 10 === 0) {
        console.log(
          `processed=${processed} saved=${saved} queued=${queue.length} discovered=${discovered.size} errors=${errors.length}`,
        );
      }

      await sleep(options.delayMs);
    }
  };

  await Promise.all(
    Array.from({ length: options.concurrency }, () => worker()),
  );

  const finishedAt = new Date();
  const discoveredUrls = [...discovered].sort((a, b) => a.localeCompare(b));
  const outputUrls = discoveredUrls.filter((url) => successful.has(url));
  const mergedCount = await writeUrlList(options.out, outputUrls, existing);
  await writePlainUrls(paths.urls, outputUrls);
  await writeErrorReport(paths.errors, errors);

  const report = {
    runId,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    outputPath: options.out,
    settings: {
      maxPages: options.maxPages,
      maxDepth: options.maxDepth,
      concurrency: options.concurrency,
      delayMs: options.delayMs,
    },
    visited: visited.size,
    processed,
    saved,
    successful: successful.size,
    discovered: discovered.size,
    outputUrls: outputUrls.length,
    mergedUrls: mergedCount,
    errors: errors.length,
    errorSamples: errors.slice(0, 25),
  };

  await writeJson(path.join(runDir, "report.json"), report);
  await writeJson(paths.report, report);

  console.log(
    `Done: visited=${visited.size}, saved=${saved}, errors=${errors.length}, urls=${outputUrls.length}, list=${mergedCount}`,
  );
  console.log(`URL list: ${options.out}`);
  console.log(`Errors: ${paths.errors}`);
  console.log(`Run data: ${runDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
