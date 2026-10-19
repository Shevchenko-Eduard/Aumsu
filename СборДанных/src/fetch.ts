import { settings } from "./config.js";

export interface FetchResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  contentType: string;
  buffer: Buffer;
  text: string;
  fetchedAt: string;
}

export class FatalFetchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "FatalFetchError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeBody(buffer: Buffer, contentType: string): string {
  let charset = /charset=([\w-]+)/i.exec(contentType)?.[1];
  if (!charset) {
    const head = buffer.subarray(0, 4096).toString("latin1");
    charset = /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1];
  }
  try {
    return new TextDecoder(charset ?? "utf-8").decode(buffer);
  } catch {
    return new TextDecoder("utf-8").decode(buffer);
  }
}

export async function fetchPage(url: string): Promise<FetchResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= settings.retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(settings.timeoutMs),
        headers: {
          "User-Agent": settings.userAgent,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        },
      });

      if (response.status === 404 || response.status === 410) {
        throw new FatalFetchError(`HTTP ${response.status}`, response.status);
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml")
      ) {
        throw new FatalFetchError(`Not HTML: ${contentType || "unknown"}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      return {
        requestedUrl: url,
        finalUrl: response.url || url,
        status: response.status,
        contentType,
        buffer,
        text: decodeBody(buffer, contentType),
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof FatalFetchError) throw error;
      lastError = error;
      if (attempt < settings.retries) {
        await sleep(500 * 2 ** attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
