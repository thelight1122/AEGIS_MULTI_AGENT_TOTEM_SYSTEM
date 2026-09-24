import { z } from "zod";

export const TotemConfigSchema = z.object({
  version: z.literal(1)
});

export type TotemConfig = z.infer<typeof TotemConfigSchema>;

export function sanitizeLaneName(name: string): string {
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new Error(`Unsafe lane name: ${name}`);
  }
  const normalized = name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!normalized) {
    throw new Error(`Unsafe lane name: ${name}`);
  }
  return normalized;
}

export function assertSafeSegment(name: string): string {
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new Error(`Unsafe path segment: ${name}`);
  }
  return name;
}
