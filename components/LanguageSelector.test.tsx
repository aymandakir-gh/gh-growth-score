/**
 * W6·QA run 12 — LanguageSelector.test.tsx
 *
 * Previous test file tested the OLD broken prop-based API (current/onChange/label props +
 * LANGUAGES/LangCode imports that don't exist in lib/i18n.ts). W5 rewrote the component
 * to be context-driven via useI18n() — tests updated accordingly.
 *
 * Coverage: initial render, open/close, locale selection, RTL (AR),
 * keyboard navigation, outside-click, edge cases (all 9 locales).
 *
 * Environment: jsdom (vitest.config.ts environmentMatchGlobs for *.test.tsx)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/lib/i18n-context";
import LanguageSelector from "@/components/LanguageSelector";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function WithI18n({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

function renderSelector() {
  return render(<LanguageSelector />, { wrapper: WithI18n });
}

function getTrigger() {
  return screen.getByRole("button", { name: /language/i });
}

// ─── Initial render ───────────────────────────────────────────────────────────

describe("LanguageSelector — initial render", () => {
  it("renders trigger button with aria-haspopup=listbox", () => {
    renderSelector();
    expect(getTrigger()).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("dropdown is closed initially (aria-expanded=false)", () => {
    renderSelector();
    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("does not render the listbox before opening", () => {
    renderSelector();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("trigger button has an accessible label containing 'Language'", () => {
    renderSelector();
    expect(getTrigger()).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Language")
    );
  });
});

// ─── Open / close ─────────────────────────────────────────────────────────────

describe("LanguageSelector — open / close", () => {
  it("opens dropdown on button click", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("closes dropdown on second click (toggle)", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    await user.click(getTrigger());
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("lists all 9 language options when open", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    expect(screen.getAllByRole("option")).toHaveLength(9);
  });

  it("aria-controls on trigger points to the listbox id", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    const listbox = screen.getByRole("listbox");
    expect(getTrigger()).toHaveAttribute("aria-controls", listbox.id);
  });

  it("listbox has aria-labelledby pointing to trigger button id", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-labelledby", getTrigger().id);
  });
});

// ─── Locale selection ─────────────────────────────────────────────────────────

describe("LanguageSelector — locale selection", () => {
  it("current locale (EN default) has aria-selected=true on open", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    expect(
      screen.getByRole("option", { name: /English/i })
    ).toHaveAttribute("aria-selected", "true");
  });

  it("non-selected locales have aria-selected=false", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    expect(
      screen.getByRole("option", { name: /Italiano/i })
    ).toHaveAttribute("aria-selected", "false");
  });

  it("clicking an option closes the dropdown", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    await user.click(screen.getByRole("option", { name: /Italiano/i }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("clicking an option returns focus to the trigger button", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    await user.click(screen.getByRole("option", { name: /Italiano/i }));
    expect(getTrigger()).toHaveFocus();
  });

  it("selected locale shows aria-selected=true on re-open", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    await user.click(screen.getByRole("option", { name: /Italiano/i }));
    await user.click(getTrigger());
    expect(
      screen.getByRole("option", { name: /Italiano/i })
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("option", { name: /English/i })
    ).toHaveAttribute("aria-selected", "false");
  });
});

// ─── RTL support ──────────────────────────────────────────────────────────────

describe("LanguageSelector — RTL support", () => {
  it("Arabic option has dir=rtl", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    expect(
      screen.getByRole("option", { name: /العربية/i })
    ).toHaveAttribute("dir", "rtl");
  });

  it("non-RTL options (EN) have dir=ltr", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    expect(
      screen.getByRole("option", { name: /English/i })
    ).toHaveAttribute("dir", "ltr");
  });
});

// ─── Keyboard navigation ──────────────────────────────────────────────────────

describe("LanguageSelector — keyboard navigation", () => {
  it("ArrowDown on trigger opens the dropdown", async () => {
    const user = userEvent.setup();
    renderSelector();
    getTrigger().focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("ArrowUp on trigger opens the dropdown", async () => {
    const user = userEvent.setup();
    renderSelector();
    getTrigger().focus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("Escape on trigger closes an open dropdown", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    getTrigger().focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

// ─── Outside click ────────────────────────────────────────────────────────────

describe("LanguageSelector — outside click", () => {
  it("closes dropdown when clicking outside the component", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

// ─── Edge cases: all 9 locales ────────────────────────────────────────────────

describe("LanguageSelector — all 9 locales present", () => {
  it("renders EN, AR, IT, NL, ZH, ES, FR, DE, PT-BR", async () => {
    const user = userEvent.setup();
    renderSelector();
    await user.click(getTrigger());
    expect(screen.getByRole("option", { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /العربية/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Italiano/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Nederlands/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /中文/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Español/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Français/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Deutsch/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Português/i })).toBeInTheDocument();
  });
});
