import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getPublicUrl } from "../storage";

beforeAll(() => {
  vi.stubGlobal("import.meta.env", {
    VITE_STORAGE_PUBLIC_BASE: "http://localhost:9000/cs-capstone",
  });
});
afterAll(() => {
  vi.unstubAllGlobals();
});

describe("getPublicUrl", () => {
  it("returns null for null/undefined/empty", () => {
    expect(getPublicUrl(null)).toBeNull();
    expect(getPublicUrl(undefined)).toBeNull();
    expect(getPublicUrl("")).toBeNull();
  });

  it("returns the value unchanged for http/https URLs", () => {
    expect(getPublicUrl("https://example.com/x.png")).toBe(
      "https://example.com/x.png",
    );
    expect(getPublicUrl("http://example.com/x.png")).toBe(
      "http://example.com/x.png",
    );
  });

  it("prefixes the base for storage keys", () => {
    expect(getPublicUrl("projects/abc/img.webp")).toMatch(
      /\/projects\/abc\/img\.webp$/,
    );
  });
});
