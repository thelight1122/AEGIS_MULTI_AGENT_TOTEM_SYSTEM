import { access } from "node:fs/promises";
import { dirname, parse, resolve } from "node:path";

async function exists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

export async function findRepoRoot(startDir: string): Promise<string | null> {
  let current = resolve(startDir);
  const root = parse(current).root;
  while (true) {
    if (await exists(resolve(current, ".aegis", "config.json"))) return current;
    if (current === root) return null;
    current = dirname(current);
  }
}

export function ensureInsideRoot(root: string, target: string): string {
  const resolvedRoot = resolve(root);
  const resolvedTarget = resolve(target);
  const relativeTarget = resolvedTarget.slice(resolvedRoot.length);
  if (resolvedTarget !== resolvedRoot && !relativeTarget.startsWith("\\") && !relativeTarget.startsWith("/")) {
    throw new Error(`Refusing to access path outside repo root: ${target}`);
  }
  return resolvedTarget;
}
