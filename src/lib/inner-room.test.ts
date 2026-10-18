import { describe, expect, it } from "vitest";
import { canCompleteExploration, clean } from "./inner-room";

describe("exploration completion rule", () => {
  it("allows completion with decision and motivation", () => {
    expect(canCompleteExploration("تكشف الحقيقة", "لأنها لا تحتمل الكذب")).toBe(true);
  });
  it("blocks completion when motivation is whitespace", () => {
    expect(canCompleteExploration("تكشف الحقيقة", "   \n ")).toBe(false);
  });
  it("blocks completion when decision is missing", () => {
    expect(canCompleteExploration(null, "سبب")).toBe(false);
  });
  it("stores blank optional text as null", () => {
    expect(clean("  ")).toBeNull();
  });
});
