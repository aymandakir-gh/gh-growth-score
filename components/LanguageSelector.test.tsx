/**
 * LanguageSelector.test.tsx
 * Unit tests for the LanguageSelector component.
 * Environment: jsdom (via vitest environmentMatchGlobs)
 * Coverage: open/close, option selection, keyboard nav (Escape/Enter/Space), outside click, a11y attrs.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageSelector from "./LanguageSelector";
import { LANGUAGES, type LangCode } from "@/lib/i18n";

describe("LanguageSelector", () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    current: "en" as LangCode,
    onChange: mockOnChange,
    label: "Select language",
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  // ─── Render & ARIA ───────────────────────────────────────────────────────────

  it("renders the trigger button with correct aria attributes", () => {
    render(<LanguageSelector {...defaultProps} />);
    const button = screen.getByRole("button", { name: /select language/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-haspopup", "listbox");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-label", "Select language");
  });

  it("does not render the dropdown initially", () => {
    render(<LanguageSelector {...defaultProps} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // ─── Open / Close ────────────────────────────────────────────────────────────

  it("opens the dropdown on button click and updates aria-expanded", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    const button = screen.getByRole("button", { name: /select language/i });

    await user.click(button);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("renders all language options when open", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /select language/i }));

    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(LANGUAGES.length);
  });

  it("marks only the current language as aria-selected=true", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector current="it" onChange={mockOnChange} label="Select language" />);
    await user.click(screen.getByRole("button", { name: /select language/i }));

    const options = screen.getAllByRole("option");
    const selected = options.filter((o) => o.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(1);
    // The selected option should correspond to "it"
    const itIdx = LANGUAGES.findIndex((l) => l.code === "it");
    expect(options[itIdx]).toHaveAttribute("aria-selected", "true");
  });

  // ─── Selection ───────────────────────────────────────────────────────────────

  it("calls onChange with the correct lang code when an option is clicked", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /select language/i }));

    const options = screen.getAllByRole("option");
    await user.click(options[1]); // second language (ar)

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(LANGUAGES[1].code);
  });

  it("closes the dropdown after an option is selected", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /select language/i }));

    const options = screen.getAllByRole("option");
    await user.click(options[2]); // any option

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // ─── Keyboard Navigation ─────────────────────────────────────────────────────

  it("closes the dropdown on Escape key", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /select language/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("selects an option via Enter key when the option is focused", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /select language/i }));

    const options = screen.getAllByRole("option");
    options[1].focus();
    await user.keyboard("{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith(LANGUAGES[1].code);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("selects an option via Space key when the option is focused", async () => {
    const user = userEvent.setup();
    render(<LanguageSelector {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /select language/i }));

    const options = screen.getAllByRole("option");
    options[2].focus();
    await user.keyboard(" ");

    expect(mockOnChange).toHaveBeenCalledWith(LANGUAGES[2].code);
  });

  // ─── Outside Click ───────────────────────────────────────────────────────────

  it("closes the dropdown when clicking outside the component", () => {
    render(<LanguageSelector {...defaultProps} />);

    // Open via direct click (not userEvent to avoid async complexity)
    fireEvent.click(screen.getByRole("button", { name: /select language/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Simulate mousedown on document body (outside the component)
    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
