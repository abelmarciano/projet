import { describe, expect, it } from "vitest";
import { benchmarkFor, groupCampaigns, objectiveKind, productTokens, verdictFor, type CampaignInput } from "./campaign-groups";

const C = (id: string, name: string, objective: string, spend: number, results: number, extra: Partial<CampaignInput> = {}): CampaignInput =>
  ({ id, name, objective, spend, results, accountId: "act_1", ...extra });
const ids = (groups: ReturnType<typeof groupCampaigns>, id: string) => groups.find((g) => g.campaignIds.includes(id))!.campaignIds.slice().sort();

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
    expect(ids(groups, "1")).toEqual(["1", "2", "3"]);
    expect(groups.find((g) => g.campaignIds.includes("1"))!.name).toBe("Carport");
    expect(ids(groups, "4")).toEqual(["4", "5"]);
    expect(ids(groups, "6")).toEqual(["6"]);
  });

  it("ignore les mots de méthode et les dates collées", () => {
    expect(productTokens("Carport relance visiteurs 2026 broad V3").map((t) => t.key)).toEqual(["carport"]);
    expect(productTokens("PPV-26OCT-GLOBAL").map((t) => t.key)).toEqual(["ppv"]);
    expect(productTokens("PPV-1JUIN-GLOBAL").map((t) => t.key)).toEqual(["ppv"]);
    expect(productTokens("TEST-PV-22JUIN").map((t) => t.key)).toEqual(["pv"]);
  });

  it("les groupes créés à la main passent avant", () => {
    const g = groupCampaigns(camps, [{ id: "m1", name: "Énergie", campaignIds: ["4", "6"] }]);
    expect(g[0]).toMatchObject({ source: "manuel", name: "Énergie", campaignIds: ["4", "6"] });
    expect(ids(g, "5")).toEqual(["5"]);
  });

  it("les noms des pubs aident seulement quand le nom de la campagne ne dit pas le produit", () => {
    const g = groupCampaigns([
      C("a", "Carport hiver", "OUTCOME_LEADS", 10, 1),
      C("b", "Campagne leads novembre", "OUTCOME_LEADS", 10, 1, { adNames: ["Carport UGC 1", "Carport UGC 2", "Carport avis"] }),
    ]);
    expect(g).toHaveLength(1);
  });
});

describe("cas réel : ne plus tout mettre dans le même panier", () => {
  // Cas inspiré de l'app (noms de comptes anonymisés) : un seul groupe « PPV » mélangeait 3 comptes et 3 produits.
  const real = [
    C("p1", "PPV-26OCT-GLOBAL", "OUTCOME_LEADS", 6000, 276, { accountId: "compte_A", adNames: ["Carport solaire UGC", "Carport avis", "Carport chantier"] }),
    C("p2", "PPV-1JUIN-GLOBAL", "OUTCOME_LEADS", 5200, 252, { accountId: "compte_A", adNames: ["Carport solaire UGC", "Carport avis"] }),
    C("p3", "TEST-PV-22JUIN", "OUTCOME_LEADS", 1800, 100, { accountId: "compte_A" }),
    C("c1", "CARPORT", "OUTCOME_LEADS", 2500, 150, { accountId: "compte_B" }),
    C("c2", "Growthity - Carport", "OUTCOME_LEADS", 1950, 70, { accountId: "compte_B" }),
    C("h1", "PAC Nova V1 Form Marque blanche", "OUTCOME_LEADS", 8, 0, { accountId: "compte_C" }),
  ];
  const g = groupCampaigns(real);

  it("sépare par compte publicitaire et par produit", () => {
    expect(ids(g, "p1")).toEqual(["p1", "p2"]);
    expect(ids(g, "p3")).toEqual(["p3"]);
    expect(ids(g, "c1")).toEqual(["c1", "c2"]);
    expect(ids(g, "h1")).toEqual(["h1"]);
    expect(g).toHaveLength(4);
  });

  it("le nom des pubs ne relie jamais une campagne qui a déjà un nom de produit", () => {
    expect(g.find((x) => x.campaignIds.includes("p1"))!.name).toBe("PPV");
    expect(g.find((x) => x.campaignIds.includes("c1"))!.name).toBe("Carport");
  });

  it("le même produit sur deux comptes donne deux groupes", () => {
    const two = groupCampaigns([
      C("x", "Carport · Hiver", "OUTCOME_LEADS", 10, 1, { accountId: "A" }),
      C("y", "Carport · Hiver", "OUTCOME_LEADS", 10, 1, { accountId: "B" }),
    ]);
    expect(two).toHaveLength(2);
  });

  it("un mot présent dans presque toutes les campagnes d'un compte (préfixe de marque) n'est pas un produit", () => {
    const pre = groupCampaigns([
      C("e1", "Ecolity Carport", "OUTCOME_LEADS", 10, 1),
      C("e2", "Ecolity PAC", "OUTCOME_LEADS", 10, 1),
      C("e3", "Ecolity Isolation", "OUTCOME_LEADS", 10, 1),
      C("e4", "Ecolity Carport relance", "OUTCOME_LEADS", 10, 1),
    ]);
    expect(pre).toHaveLength(3);
    expect(ids(pre, "e1")).toEqual(["e1", "e4"]);
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

  it("une campagne qui dépense beaucoup sans aucun lead est « plus chère » (À couper possible)", () => {
    const dry = C("d", "Carport sec", "OUTCOME_LEADS", 30, 0);
    const all = [...camps, dry];
    const b = benchmarkFor(dry, groupCampaigns(all), all)!;
    expect(dry.spend >= b.value * 3).toBe(true);
    expect(verdictFor(dry, b)).toBe("plus_chere");
  });

  it("une campagne de ventes qui a dépensé 100 € sans vente est « plus chère »", () => {
    const s2 = C("s2", "Sérum Éclat relance", "OUTCOME_SALES", 120, 0, { revenue: 0 });
    const s3 = C("s3", "Sérum Éclat avis", "OUTCOME_SALES", 200, 12, { revenue: 640 });
    const all = [...camps, s2, s3];
    expect(verdictFor(s2, benchmarkFor(s2, groupCampaigns(all), all))).toBe("plus_chere");
  });
});
