import path from "node:path";
import { fileURLToPath } from "node:url";

export const projectDir = fileURLToPath(new URL("..", import.meta.url));
export const repoRoot = path.resolve(projectDir, "..");

export const paths = {
  data: path.join(projectDir, "data"),
  raw: path.join(projectDir, "data", "raw"),
  runs: path.join(projectDir, "data", "runs"),
  urls: path.join(projectDir, "data", "urls.txt"),
  errors: path.join(projectDir, "data", "errors.txt"),
  report: path.join(projectDir, "data", "report.json"),
  defaultOut: path.join(repoRoot, "Reference", "listHTML"),
};

export const settings = {
  origin: "https://aumsu.ru",
  allowedHosts: new Set(["aumsu.ru", "www.aumsu.ru"]),
  seeds: [
    "https://aumsu.ru/",
    "https://aumsu.ru/sveden",
    "https://aumsu.ru/component/content/article/8-glavnaya-stranitsa/219-karta-sajta",
  ],
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  concurrency: 4,
  requestDelayMs: 150,
  timeoutMs: 30_000,
  retries: 3,
  maxPages: 600,
  maxDepth: 5,
};
