import { describe, expect, it } from "vitest";
import { hashObject } from "../utils/hashUtils";

describe("hashObject", () => {
  it("returns a 64-character hexadecimal SHA-256 string", () => {
    const hash = hashObject({ a: 1, b: "test" });
    expect(typeof hash).toBe("string");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("is deterministic for the same input", () => {
    const obj = { x: 1, y: 2 };
    expect(hashObject(obj)).toBe(hashObject(obj));
  });

  it("throws a TypeError when input is not an object", () => {
    expect(() => hashObject("not an object" as unknown as Record<string, unknown>)).toThrow(TypeError);
  });
});
