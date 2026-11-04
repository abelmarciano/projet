"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const campaign_groups_1 = require("./campaign-groups.js");
const C = (id, name, objective, spend, results, extra = {}) => ({ id, name, objective, spend, results, accountId: "act_1", ...extra });
(0, vitest_1.describe)("objectifs Meta", () => {
    (0, vitest_1.it)("reconnaît les anciens et les nouveaux noms", () => {
        (0, vitest_1.expect)((0, campaign_groups_1.objectiveKind)("OUTCOME_LEADS")).toBe("leads");
        (0, vitest_1.expect)((0, campaign_groups_1.objectiveKind)("LEAD_GENERATION")).toBe("leads");
        (0, vitest_1.expect)((0, campaign_groups_1.objectiveKind)("OUTCOME_SALES")).toBe("sales");
        (0, vitest_1.expect)((0, campaign_groups_1.objectiveKind)("CONVERSIONS")).toBe("sales");
        (0, vitest_1.expect)((0, campaign_groups_1.objectiveKind)("OUTCOME_TRAFFIC")).toBe("traffic");
        (0, vitest_1.expect)((0, campaign_groups_1.objectiveKind)("LINK_CLICKS")).toBe("traffic");
        (0, vitest_1.expect)((0, campaign_groups_1.objectiveKind)("OUTCOME_AWARENESS")).toBe("awareness");
        (0, vitest_1.expect)((0, campaign_groups_1.objectiveKind)("OUTCOME_ENGAGEMENT")).toBe("engagement");
    });
});
(0, vitest_1.describe)("regroupement par produit", () => {
    const camps = [
        C("1", "Carport · Hiver", "OUTCOME_LEADS", 168.4, 26),
        C("2", "Carport relance visiteurs 2026", "OUTCOME_LEADS", 54, 6),
        C("3", "Carports - Test V2 broad", "OUTCOME_LEADS", 30, 3),
        C("4", "Pompe à chaleur · Aides 2026", "OUTCOME_LEADS", 121.1, 13),
        C("5", "Pompe à chaleur témoignages", "OUTCOME_LEADS", 88, 8),
        C("6", "Isolation · Prime énergie", "OUTCOME_LEADS", 63.3, 3),
    ];
    const groups = (0, campaign_groups_1.groupCampaigns)(camps);
    (0, vitest_1.it)("met ensemble les campagnes du même produit, malgré la saison, le pluriel ou « test »", () => {
        const carport = groups.find((g) => g.campaignIds.includes("1"));
        (0, vitest_1.expect)(carport.campaignIds.sort()).toEqual(["1", "2", "3"]);
        (0, vitest_1.expect)(carport.name).toBe("Carport");
        (0, vitest_1.expect)(groups.find((g) => g.campaignIds.includes("4")).campaignIds.sort()).toEqual(["4", "5"]);
        (0, vitest_1.expect)(groups.find((g) => g.campaignIds.includes("6")).campaignIds).toEqual(["6"]);
    });
    (0, vitest_1.it)("ignore les mots de méthode (relance, broad, test, saisons, années)", () => {
        (0, vitest_1.expect)((0, campaign_groups_1.productTokens)("Carport relance visiteurs 2026 broad V3").map((t) => t.key)).toEqual(["carport"]);
    });
    (0, vitest_1.it)("les groupes créés à la main passent avant", () => {
        const g = (0, campaign_groups_1.groupCampaigns)(camps, [{ id: "m1", name: "Énergie", campaignIds: ["4", "6"] }]);
        (0, vitest_1.expect)(g[0]).toMatchObject({ source: "manuel", name: "Énergie", campaignIds: ["4", "6"] });
        (0, vitest_1.expect)(g.find((x) => x.campaignIds.includes("5")).campaignIds).toEqual(["5"]);
    });
    (0, vitest_1.it)("les noms des pubs aident quand la campagne a un nom vague", () => {
        const g = (0, campaign_groups_1.groupCampaigns)([
            C("a", "Carport hiver", "OUTCOME_LEADS", 10, 1),
            C("b", "Campagne leads novembre", "OUTCOME_LEADS", 10, 1, { adNames: ["Carport UGC 1", "Carport UGC 2", "Carport avis"] }),
        ]);
        (0, vitest_1.expect)(g).toHaveLength(1);
    });
});
(0, vitest_1.describe)("comparaison au bon groupe", () => {
    const camps = [
        C("1", "Carport · Hiver", "OUTCOME_LEADS", 168.4, 26),
        C("2", "Carport relance", "OUTCOME_LEADS", 54, 6),
        C("4", "Pompe à chaleur · Aides", "OUTCOME_LEADS", 121.1, 13),
        C("6", "Isolation · Prime", "OUTCOME_LEADS", 63.3, 3),
        C("9", "Sérum Éclat · Ventes", "OUTCOME_SALES", 278, 19, { revenue: 980 }),
    ];
    const groups = (0, campaign_groups_1.groupCampaigns)(camps);
    (0, vitest_1.it)("compare une campagne Carport aux autres Carport, pas à tout le compte", () => {
        const b = (0, campaign_groups_1.benchmarkFor)(camps[0], groups, camps);
        (0, vitest_1.expect)(b.basis).toBe("produit");
        (0, vitest_1.expect)(b.value).toBeCloseTo((168.4 + 54) / 32, 2);
        (0, vitest_1.expect)((0, campaign_groups_1.verdictFor)(camps[0], b)).toBe("meilleure"); // 6,48 € contre 6,95 € pour Carport
        (0, vitest_1.expect)((0, campaign_groups_1.verdictFor)(camps[1], (0, campaign_groups_1.benchmarkFor)(camps[1], groups, camps))).toBe("plus_chere");
    });
    (0, vitest_1.it)("un produit seul se compare au même objectif sur le même compte, jamais aux ventes", () => {
        const b = (0, campaign_groups_1.benchmarkFor)(camps[3], groups, camps);
        (0, vitest_1.expect)(b.basis).toBe("compte");
        (0, vitest_1.expect)(b.value).toBeCloseTo((168.4 + 54 + 121.1 + 63.3) / (26 + 6 + 13 + 3), 2);
        (0, vitest_1.expect)((0, campaign_groups_1.verdictFor)(camps[3], b)).toBe("plus_chere");
    });
    (0, vitest_1.it)("ne juge pas une campagne qui n'a pas encore assez de données", () => {
        const tiny = C("t", "Carport essai", "OUTCOME_LEADS", 4, 0);
        const all = [...camps, tiny];
        (0, vitest_1.expect)((0, campaign_groups_1.verdictFor)(tiny, (0, campaign_groups_1.benchmarkFor)(tiny, (0, campaign_groups_1.groupCampaigns)(all), all))).toBe("trop_tot");
    });
});
