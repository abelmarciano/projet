import { describe, expect, it } from "vitest";
import { benchmarkFor, groupCampaigns, objectiveKind, productTokens, verdictFor, type CampaignInput } from "./campaign-groups";

const C = (id: string, name: string, objective: string, spend: number, results: number, extra: Partial<CampaignInput> = {}): CampaignInput =>
  ({ id, name, objective, spend, results, accountId: "act_1", ...extra });

describe("objectifs Meta", () => {
  it("reconnaît les anciens et les nouveaux noms", () => {
    expect(objectiveKind("OUTCOME_LEADS")).toBe("leads");
    expect(objectiveKind("LEAD_GENERATION")).toBe("leads");
    expect(objectiveKind("OUTCOME_SALES")).toBe("sales");
    expect(objectiveKind("CONVERSIONS")).toBe("sales");
    expect(objectiveKind("OUTCOME_TRAFFIC")).toBe("traffic");
    expect(objectiveKind("LINK_CLICKS")).toBe("traffic");
    expect(objectiveKind("OUTCOME_AWARENESS")).toBe("awareness");
    expect(objectiveKind("OUTCOME_ENGAGEMENT")).toBe("engagement");
  });
});

describe("regroupement par produit", () => {
  const camps = [
    C("1", "Carport · Hiver", "OUTCOME_LEADS", 168.4, 26),
    C("2", "Carport relance visiteurs 2026", "OUTCOME_LEADS", 54, 6),
    C("3", "Carports - Test V2 broad", "OUTCOME_LEADS", 30, 3),
    C("4", "Pompe à chaleur · Aides 2026", "OUTCOME_LEADS", 121.1, 13),
    C("5", "Pompe à chaleur témoignages", "OUTCOME_LEADS", 88, 8),
    C("6", "Isolation · Prime énergie", "OUTCOME_LEADS", 63.3, 3),
  ];
  const groups = groupCampaigns(camps);

  it("met ensemble les campagnes du même produit, malgré la saison, le pluriel ou « test »", () => {
    const carport = groups.find((g) => g.campaignIds.includes("1"))!;
    expect(carport.campaignIds.sort()).toEqual(["1", "2", "3"]);
    expect(carport.name).toBe("Carport");
    expect(groups.find((g) => g.campaignIds.includes("4"))!.campaignIds.sort()).toEqual(["4", "5"]);
    expect(groups.find((g) => g.campaignIds.includes("6"))!.campaignIds).toEqual(["6"]);
  });

  it("ignore les mots de méthode (relance, broad, test, saisons, années)", () => {
    expect(productTokens("Carport relance visiteurs 2026 broad V3").map((t) => t.key)).toEqual(["carport"]);
  });

  it("les groupes créés à la main passent avant", () => {
    const g = groupCampaigns(camps, [{ id: "m1", name: "Énergie", campaignIds: ["4", "6"] }]);
    expect(g[0]).toMatchObject({ source: "manuel", name: "Énergie", campaignIds: ["4", "6"] });
    expect(g.find((x) => x.campaignIds.includes("5"))!.campaignIds).toEqual(["5"]);
  });

  it("les noms des pubs aident quand la campagne a un nom vague", () => {
    const g = groupCampaigns([
      C("a", "Carport hiver", "OUTCOME_LEADS", 10, 1),
      C("b", "Campagne leads novembre", "OUTCOME_LEADS", 10, 1, { adNames: ["Carport UGC 1", "Carport UGC 2", "Carport avis"] }),
    ]);
    expect(g).toHaveLength(1);
  });
});

describe("comparaison au bon groupe", () => {
  const camps = [
    C("1", "Carport · Hiver", "OUTCOME_LEADS", 168.4, 26),
    C("2", "Carport relance", "OUTCOME_LEADS", 54, 6),
    C("4", "Pompe à chaleur · Aides", "OUTCOME_LEADS", 121.1, 13),
    C("6", "Isolation · Prime", "OUTCOME_LEADS", 63.3, 3),
    C("9", "Sérum Éclat · Ventes", "OUTCOME_SALES", 278, 19, { revenue: 980 }),
  ];
  const groups = groupCampaigns(camps);

  it("compare une campagne Carport aux autres Carport, pas à tout le compte", () => {
    const b = benchmarkFor(camps[0], groups, camps)!;
    expect(b.basis).toBe("produit");
    expect(b.value).toBeCloseTo((168.4 + 54) / 32, 2);
    expect(verdictFor(camps[0], b)).toBe("meilleure"); // 6,48 € contre 6,95 € pour Carport
    expect(verdictFor(camps[1], benchmarkFor(camps[1], groups, camps))).toBe("plus_chere");
  });

  it("un produit seul se compare au même objectif sur le même compte, jamais aux ventes", () => {
    const b = benchmarkFor(camps[3], groups, camps)!;
    expect(b.basis).toBe("compte");
    expect(b.value).toBeCloseTo((168.4 + 54 + 121.1 + 63.3) / (26 + 6 + 13 + 3), 2);
    expect(verdictFor(camps[3], b)).toBe("plus_chere");
  });

  it("ne juge pas une campagne qui n'a pas encore assez de données", () => {
    const tiny = C("t", "Carport essai", "OUTCOME_LEADS", 4, 0);
    const all = [...camps, tiny];
    expect(verdictFor(tiny, benchmarkFor(tiny, groupCampaigns(all), all))).toBe("trop_tot");
  });
});
