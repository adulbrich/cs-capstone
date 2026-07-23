// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  // biome-ignore lint/a11y/useValidAnchor: unused route-mock stub, never rendered by these tests
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useRouter: () => ({ invalidate: () => undefined }),
}));
vi.mock("#/server/interests", () => ({
  getMyInterests: () => Promise.resolve({ interestsText: "" }),
  saveMyInterests: vi.fn(),
}));
vi.mock("#/server/profile", () => ({ updateProfile: vi.fn() }));
vi.mock("#/lib/auth-client", () => ({ authClient: {} }));

import { MentorFields } from "#/routes/_authed/profile";

afterEach(cleanup);

describe("MentorFields", () => {
  it("labels the switch and shows the audience note", () => {
    render(
      <MentorFields
        count={1}
        onCountChange={() => {}}
        onToggle={() => {}}
        wants={false}
      />
    );
    expect(
      screen.getByRole("switch", { name: /want to mentor/i })
    ).toBeTruthy();
    expect(document.body.textContent).toContain(
      "For professionals and faculty, not students"
    );
  });

  it("reveals the team-count field only when opted in", () => {
    const { rerender } = render(
      <MentorFields
        count={1}
        onCountChange={() => {}}
        onToggle={() => {}}
        wants={false}
      />
    );
    expect(screen.queryByLabelText(/how many teams/i)).toBeNull();
    rerender(
      <MentorFields
        count={2}
        onCountChange={() => {}}
        onToggle={() => {}}
        wants
      />
    );
    expect(screen.getByLabelText(/how many teams/i)).toBeTruthy();
  });
});
