// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UserPicker } from "#/components/user-picker";

afterEach(cleanup);

describe("UserPicker", () => {
  it("shows the selected user's name and email, not a raw id", () => {
    render(
      <UserPicker
        onChange={() => {
          // no-op
        }}
        value={{ id: "9f1c-uuid", name: "Ada Lovelace", email: "ada@x.com" }}
      />
    );
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("ada@x.com")).toBeTruthy();
    expect(screen.queryByText("9f1c-uuid")).toBeNull();
  });

  it("falls back to the email when the name is missing", () => {
    render(
      <UserPicker
        onChange={() => {
          // no-op
        }}
        value={{ id: "u2", name: null, email: "nyx@x.com" }}
      />
    );
    expect(screen.getAllByText("nyx@x.com").length).toBeGreaterThan(0);
  });
});
