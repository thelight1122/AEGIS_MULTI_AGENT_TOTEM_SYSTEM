import { describe, expect, it } from "vitest";
import { sanitizeLaneName } from "../src/core/schema.js";

describe("sanitizeLaneName", () => {
  it("normalizes names", () => expect(sanitizeLaneName("Claude Review")).toBe("claude-review"));
  it("rejects empty names", () => expect(() => sanitizeLaneName("   ")).toThrow("Unsafe lane name"));
  it("rejects traversal", () => expect(() => sanitizeLaneName("../outside")).toThrow("Unsafe lane name"));
});
