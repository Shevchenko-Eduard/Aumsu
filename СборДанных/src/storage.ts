import { createHash } from "node:crypto";
import {
  access,
  appendFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { paths, settings } from "./config.js";
import { normalizeUrl } from "./url.js";

let writeChain: Promise<void> = Promise.resolve();

export async function ensureDataDirs(): Promise<void> {
  await mkdir(paths.raw, { recursive: true });
  await mkdir(paths.runs, { recursive: true });
}

export async function saveRaw(
  buffer: Buffer,
): Promise<{ sha256: string; relativePath: string }> {
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const folder = path.join(paths.raw, sha256.slice(0, 2));
  const file = path.join(folder, `${sha256}.html.gz`);
  await mkdir(folder, { recursive: true });

  try {
    await access(file);
  } catch {
    try {
      await writeFile(file, gzipSync(buffer, { level: 9 }), { flag: "wx" });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
  }

  return {
    sha256,
    relativePath: path.relative(paths.data, file),
  };
}

export function appendJsonl(file: string, value: unknown): Promise<void> {
  const line = `${JSON.stringify(value)}\n`;
  const next = writeChain.then(() => appendFile(file, line, "utf8"));
  writeChain = next.catch(() => undefined);
  return next;
}

export async function readUrlList(file: string): Promise<string[]> {
  try {
    const content = await readFile(file, "utf8");
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    const normalized = normalizeUrl(url, settings.origin) ?? url;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(url);
  }
  return result;
}

export async function writeUrlList(
  file: string,
  urls: string[],
  existing: string[],
): Promise<number> {
  const lines = dedupeUrls([...existing, ...urls]);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${lines.join("\n\n")}\n`, "utf8");
  return lines.length;
}

export async function writePlainUrls(
  file: string,
  urls: string[],
): Promise<void> {
  const lines = [...new Set(urls)].sort((a, b) => a.localeCompare(b));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${lines.join("\n")}\n`, "utf8");
}

export async function writeErrorReport(
  file: string,
  errors: Array<{ url: string; error: string }>,
): Promise<void> {
  const lines = errors
    .map(({ url, error }) => `${url}\t${error}`)
    .sort((a, b) => a.localeCompare(b));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, lines.length ? `${lines.join("\n")}\n` : "", "utf8");
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
