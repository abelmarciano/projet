import { describe, expect, it } from "vitest";
import { closeQuestion, openQuestion } from "./pending-questions";

const fresh = () => {
  const state: Record<string, unknown> = {};
  openQuestion(state, { key: "offer", question: "Quelle offre veux-tu mettre en avant ?", suggestions: ["Prix de gros pour entreprises", "Je précise mon offre"] });
  return state;
};

describe("offre sans chiffre", () => {
  it("« Prix de gros pour entreprises » ferme la question, sans remise", () => {
    const state = fresh();
    const text = "Prix de gros pour entreprises<!--suggestion-choice-->";
    const r = closeQuestion(state, "offer", "Prix de gros pour entreprises", text);
    expect(r).toEqual({ ok: true, noDiscount: true, label: "Prix de gros pour entreprises" });
    expect((state.pendingQuestions as unknown[]).length).toBe(0);
  });
  it("« Je précise mon offre » laisse la question ouverte", () => {
    const state = fresh();
    const r = closeQuestion(state, "offer", "Je précise mon offre", "Je précise mon offre<!--suggestion-choice-->");
    expect(r.ok).toBe(false);
    expect((state.pendingQuestions as unknown[]).length).toBe(1);
  });
  it("une remise chiffrée reste lue comme une remise", () => {
    const r = closeQuestion(fresh(), "offer", "-20 %", "-20 %");
    expect(r).toEqual({ ok: true, offer: { discountPercent: 20 } });
  });
});
