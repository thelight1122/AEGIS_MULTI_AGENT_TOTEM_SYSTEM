import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, rm, stat } from "node:fs/promises";

const lockWaitMs = 10;
const lockTimeoutMs = 5000;
const staleLockMs = 30000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireLock(target: string): Promise<string> {
  const lockPath = `${target}.lock`;
  const started = Date.now();
  while (true) {
    try {
      await mkdir(lockPath);
      return lockPath;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST" && code !== "EPERM") throw error;
      try {
        const age = Date.now() - (await stat(lockPath)).mtimeMs;
        if (age > staleLockMs) await rm(lockPath, { recursive: true, force: true });
      } catch {
        // Another writer may be replacing the lock; retry until the bounded timeout.
      }
      if (Date.now() - started >= lockTimeoutMs) throw new Error(`Timed out waiting to append: ${target}`);
      await sleep(lockWaitMs);
    }
  }
}

export async function appendLocked(target: string, content: string): Promise<void> {
  const lockPath = await acquireLock(target);
  try {
    await appendFile(target, content, "utf8");
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

function hashEntry(previousHash: string, heading: string, body: string): string {
  return createHash("sha256").update(`${previousHash}\n${heading}\n${body}`, "utf8").digest("hex");
}

function escapeEntryHeadings(body: string): string {
  return body
    .trim()
    .split(/\r?\n/)
    .map((line) => line.startsWith("### ") ? `> ${line}` : line)
    .join("\n");
}

function latestChainHash(content: string): string {
  const matches = [...content.matchAll(/^Chain-Hash:\s+([a-f0-9]{64})$/gmi)];
  return matches.at(-1)?.[1]?.toLowerCase() ?? "GENESIS";
}

export async function appendChained(target: string, heading: string, body: string): Promise<void> {
  const existing = await readFile(target, "utf8");
  if (!existing.includes("## Append Log")) throw new Error(`${target} is missing an Append Log. Create the Totem or lane before appending.`);
  const previousHash = latestChainHash(existing);
  const safeBody = `${escapeEntryHeadings(body)}\n`;
  const entryHash = hashEntry(previousHash, heading, safeBody);
  await appendLocked(target, `\n${heading}\nChain-Prev: ${previousHash}\nChain-Hash: ${entryHash}\n${safeBody}`);
}

export function validateChainedEntries(content: string): string[] {
  const errors: string[] = [];
  const starts = [...content.matchAll(/^### .+$/gm)].map((match) => ({ index: match.index ?? 0, heading: match[0] }));
  let previousHash = "GENESIS";

  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index];
    const nextStart = starts[index + 1]?.index ?? content.length;
    const entry = content.slice(start.index, nextStart);
    const lines = entry.split(/\r?\n/);
    const previousLine = lines[1]?.match(/^Chain-Prev:\s+(.+)$/i);
    const hashLine = lines[2]?.match(/^Chain-Hash:\s+([a-f0-9]{64})$/i);

    if (!previousLine && !hashLine) continue;
    if (!previousLine || !hashLine) {
      errors.push(`entry "${start.heading}" has incomplete chain metadata`);
      continue;
    }
    const declaredPrevious = previousLine[1].trim();
    const declaredHash = hashLine[1].toLowerCase();
    const body = lines.slice(3).join("\n").replace(/\r?\n$/, "\n");
    const expectedHash = hashEntry(declaredPrevious, start.heading, body);
    if (declaredPrevious !== previousHash) errors.push(`entry "${start.heading}" links to ${declaredPrevious} but expected ${previousHash}`);
    if (declaredHash !== expectedHash) errors.push(`entry "${start.heading}" hash mismatch`);
    previousHash = declaredHash;
  }

  return errors;
}
