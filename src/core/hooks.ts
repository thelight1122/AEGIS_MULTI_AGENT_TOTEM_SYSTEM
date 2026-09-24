import { chmod, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function preCommitHookTemplate(): string {
  return `#!/bin/sh
# Installed by aegis-totem. Local-only hook; not a Git config mutation.
if command -v aegis-totem >/dev/null 2>&1; then
  aegis-totem validate
else
  echo "AEGIS Totem pre-commit hook: aegis-totem command not found." >&2
  echo "Install or link the CLI, or remove .git/hooks/pre-commit if this hook is not wanted." >&2
  exit 1
fi
`;
}

export async function installPreCommitHook(rootDir: string): Promise<string> {
  const hooksDir = join(rootDir, ".git", "hooks");
  const hookPath = join(hooksDir, "pre-commit");
  await mkdir(hooksDir, { recursive: true });
  await writeFile(hookPath, preCommitHookTemplate(), { flag: "wx" });
  await chmod(hookPath, 0o755);
  return hookPath;
}
