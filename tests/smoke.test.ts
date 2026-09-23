import { describe, expect, it } from "vitest";
import { buildProgram } from "../src/cli.js";

describe("CLI scaffold", () => {
  it("names the program", () => {
    expect(buildProgram().name()).toBe("aegis-totem");
  });
});
