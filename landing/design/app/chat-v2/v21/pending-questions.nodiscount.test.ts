import { describe, expect, it } from "vitest";
import { checkBriefConsistency } from "./pending-questions";

const now = new Date("2026-10-14T10:00:00Z");
const codes = (texts: string[], offer?: Record<string, unknown>) =>
  checkBriefConsistency({ texts, offer, userTexts: ["Pas de remise"], now }).map((i) => i.code);

describe("offre sans remise", () => {
  it("« sans remise » ne bloque plus quand le client a dit « Pas de remise »", () => {
    expect(codes(["Bracelet en argent, prix normal, sans remise ni promo"], { noDiscount: true })).not.toContain("discount_without_offer");
  });
  it("un vrai « -20 % » reste bloqué malgré « Pas de remise »", () => {
    expect(codes(["Bracelet à -20 % ce week-end"], { noDiscount: true })).toContain("discount_without_offer");
  });
  it("sans réponse sur l'offre, « remise » reste signalé comme avant", () => {
    expect(codes(["Grosse remise sur le bracelet"])).toContain("discount_without_offer");
  });
});
