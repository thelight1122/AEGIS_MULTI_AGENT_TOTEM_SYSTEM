import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

export function createTempRepo(): Promise<string> {
  return mkdtemp(join(tmpdir(), "aegis-totem-"));
}
