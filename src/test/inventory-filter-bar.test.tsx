// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { InventoryFilterBar } from "#/components/inventory-filter-bar";

describe("InventoryFilterBar", () => {
  it("debounces search input", async () => {
    vi.useFakeTimers();
    const onQChange = vi.fn();
    const { getByPlaceholderText } = render(
      <InventoryFilterBar
        q=""
        status={null}
        category={null}
        view="card"
        categories={[]}
        onQChange={onQChange}
        onStatusChange={() => {}}
        onCategoryChange={() => {}}
        onViewChange={() => {}}
      />,
    );
    fireEvent.change(getByPlaceholderText("Search inventory"), {
      target: { value: "arduino" },
    });
    expect(onQChange).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(310);
    });
    expect(onQChange).toHaveBeenCalledWith("arduino");
    vi.useRealTimers();
  });

  it("clicking the active status chip clears it", () => {
    const onStatusChange = vi.fn();
    const { getAllByText } = render(
      <InventoryFilterBar
        q=""
        status="available"
        category={null}
        view="card"
        categories={[]}
        onQChange={() => {}}
        onStatusChange={onStatusChange}
        onCategoryChange={() => {}}
        onViewChange={() => {}}
      />,
    );
    // Multiple elements may match "Available" because the shadcn Select
    // renders a hidden trigger. The chip is the <button> whose inline
    // borderColor is the brand-primary token (the active-state style).
    const matches = getAllByText("Available").filter(
      (el) =>
        el.tagName === "BUTTON" &&
        (el as HTMLButtonElement).style.borderColor.includes("brand-primary"),
    );
    expect(matches).toHaveLength(1);
    fireEvent.click(matches[0]);
    expect(onStatusChange).toHaveBeenCalledWith(null);
  });
});
