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
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
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
