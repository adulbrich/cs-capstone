// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

import { ViewToggle } from "#/components/view-toggle";
import { readStoredView } from "#/lib/view-preference";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("ViewToggle", () => {
  it("persists the chosen view to storage when toggled", () => {
    render(<ViewToggle onChange={vi.fn()} value="card" />);
    screen.getByRole("button", { name: "Row view" }).click();
    expect(readStoredView()).toBe("row");
  });

  it("still reports the choice to onChange when toggled", () => {
    const onChange = vi.fn();
    render(<ViewToggle onChange={onChange} value="card" />);
    screen.getByRole("button", { name: "Row view" }).click();
    expect(onChange).toHaveBeenCalledWith("row");
  });
});
