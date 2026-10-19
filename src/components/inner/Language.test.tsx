import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, LanguageSwitcher } from "./Language";
import { ExplorationForm } from "./ExplorationForm";
import { CharacterForm } from "./CharacterForm";
import { LANGUAGE_STORAGE_KEY } from "@/lib/translations";

beforeEach(() => localStorage.clear());
afterEach(cleanup);
describe("language changes preserve authored responses", () => {
  it("retains unsaved exploration input and sends only answer fields and status", async () => {
    const save = vi.fn().mockResolvedValue(null);
    render(<LanguageProvider><LanguageSwitcher /><ExplorationForm onSave={save} onCancel={() => {}} /></LanguageProvider>);
    fireEvent.change(document.getElementById("x-decision_text") as HTMLTextAreaElement, { target: { value: "قراري الأصلي" } });
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect((document.getElementById("x-decision_text") as HTMLTextAreaElement).value).toBe("قراري الأصلي");
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ decision_text: "قراري الأصلي", motivation_text: null, potential_cost: null, author_reflection: null }, "draft"));
  });
  it("does not overwrite a character name when switching", () => {
    render(<LanguageProvider><LanguageSwitcher /><CharacterForm initial={{ name: "اسم أصلي" }} onSubmit={async () => null} onCancel={() => {}} /></LanguageProvider>);
    fireEvent.change(document.getElementById("c-name") as HTMLInputElement, { target: { value: "اسم غير محفوظ" } });
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect((document.getElementById("c-name") as HTMLInputElement).value).toBe("اسم غير محفوظ");
  });
});
