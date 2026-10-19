import { describe, expect, it } from "vitest";
import { DEFAULT_LANGUAGE, localizedField, readLanguage } from "./translations";

describe("local language preference", () => {
  it("defaults new visitors to Arabic", () => {
    expect(DEFAULT_LANGUAGE).toBe("ar");
    expect(readLanguage(null)).toBe("ar");
  });
  it("restores English and rejects unsupported values", () => {
    expect(readLanguage("en")).toBe("en");
    expect(readLanguage("fr")).toBe("ar");
  });
});
describe("saved-language selection", () => {
  const saved = { scenario_title_snapshot: "Original title", scenario_title_snapshot_ar: "العنوان الأصلي", title: "Changed live title", title_ar: "عنوان جديد" };
  it("uses the saved Arabic snapshot, never current scenario text", () => {
    expect(localizedField(saved, "scenario_title_snapshot", "scenario_title_snapshot_ar", "ar")).toBe("العنوان الأصلي");
  });
  it("uses the saved English snapshot", () => {
    expect(localizedField(saved, "scenario_title_snapshot", "scenario_title_snapshot_ar", "en")).toBe("Original title");
  });
  it("does not substitute live text or other-language text for missing history", () => {
    expect(localizedField({ ...saved, scenario_title_snapshot_ar: null }, "scenario_title_snapshot", "scenario_title_snapshot_ar", "ar")).not.toBe("Original title");
    expect(localizedField({ ...saved, scenario_title_snapshot_ar: null }, "scenario_title_snapshot", "scenario_title_snapshot_ar", "ar")).not.toBe("عنوان جديد");
  });
});
