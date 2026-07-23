// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  readStoredView,
  VIEW_STORAGE_KEY,
  writeStoredView,
} from "#/lib/view-preference";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("view-preference", () => {
  it("round-trips a written view", () => {
    writeStoredView("row");
    expect(readStoredView()).toBe("row");
  });

  it("reads null for a garbage stored value", () => {
    localStorage.setItem(VIEW_STORAGE_KEY, "banana");
    expect(readStoredView()).toBeNull();
  });

  it("reads null (without throwing) when storage access fails", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => readStoredView()).not.toThrow();
    expect(readStoredView()).toBeNull();
  });
});
