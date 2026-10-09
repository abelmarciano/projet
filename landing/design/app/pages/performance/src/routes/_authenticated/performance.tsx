import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { frShortDate, rangeFor, type RangeKey } from "@/components/insights/shared";
import { PerformanceView } from "@/components/insights/PerformanceView";
import { TopAdsView } from "@/components/insights/TopAdsView";
import { AiAnalysisView } from "@/components/insights/AiAnalysisView";
import { DateField } from "@/components/ui/date-field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/*
 * Performance : copie de la maquette validée (landing/design/app/views/performance.html),
 * classes gx- de src/styles/gx-console.css, branchée sur les vrais chiffres Meta.
 */

export const Route = createFileRoute("/_authenticated/performance")({
  head: () => ({
    meta: [
      { title: "Performance de tes publicités - growthity.ai" },
      { name: "description", content: "Suis jour par jour ce que tes publicités coûtent et rapportent, tes meilleures créations et l'analyse de l'IA." },
      { property: "og:title", content: "Performance de tes publicités - growthity.ai" },
      { property: "og:description", content: "Dépense, coût par résultat, meilleures pubs et conseils concrets, au même endroit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PerformancePage,
});

type Tab = "evolution" | "creations" | "analyse";

const TABS: { key: Tab; label: string }[] = [
  { key: "evolution", label: "Évolution" },
  { key: "creations", label: "Meilleures pubs" },
  { key: "analyse", label: "Quoi faire ?" },
];

/** Libellés courts du segment de la maquette (RANGE_LABELS reste inchangé pour les autres écrans). */
const PERIODS: { key: RangeKey; label: string; phrase: string }[] = [
  { key: "today", label: "Aujourd'hui", phrase: "d'aujourd'hui" },
  { key: "7d", label: "7 jours", phrase: "des 7 derniers jours" },
  { key: "30d", label: "30 jours", phrase: "des 30 derniers jours" },
  { key: "all", label: "Depuis le début", phrase: "depuis le début" },
];

function PerformancePage() {
  const [tab, setTab] = useState<Tab>("evolution");
  const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
  const [custom, setCustom] = useState({ since: "", until: "" });
  const range = useMemo(() => rangeFor(rangeKey, custom), [rangeKey, custom]);

  // Période personnalisée : discrète, ouverte depuis l'icône calendrier.
  const [customOpen, setCustomOpen] = useState(false);
  const [draft, setDraft] = useState({ since: "", until: "" });
  const draftOk = !!draft.since && !!draft.until && draft.since <= draft.until;
  const applyCustom = () => {
    if (!draftOk) return;
    setCustom(draft);
    setRangeKey("custom");
    setCustomOpen(false);
  };

  const periodPhrase = rangeKey === "custom"
    ? `du ${frShortDate(range.since)} au ${frShortDate(range.until)}`
    : PERIODS.find((p) => p.key === rangeKey)?.phrase ?? "de la période choisie";

  return (
    <div className="gx-page gx-perf">
      <div className="gx-ph">
        <div>
          <h1>Performance</h1>
          <p>Ce que tes publicités coûtent, ce qu'elles rapportent, et quoi faire ensuite.</p>
        </div>
        <div className="gx-pa">
          <div className="gx-seg" role="tablist" aria-label="Période">
            {PERIODS.map((p) => (
              <button key={p.key} type="button" role="tab" aria-selected={rangeKey === p.key} onClick={() => setRangeKey(p.key)}>
                {p.label}
              </button>
            ))}
          </div>
          <Popover open={customOpen} onOpenChange={(o) => { setCustomOpen(o); if (o) setDraft(custom); }}>
            <PopoverTrigger asChild>
              {rangeKey === "custom" ? (
                <button type="button" className="gx-sel gx-set" aria-label="Modifier la période personnalisée">
                  <CalendarIcon />
                  <span>{frShortDate(range.since)} → {frShortDate(range.until)}</span>
                </button>
              ) : (
                <button type="button" className="gx-ib" aria-label="Période personnalisée" title="Période personnalisée…">
                  <CalendarIcon />
                </button>
              )}
            </PopoverTrigger>
            <PopoverContent align="end" className="console-app-portal gx-pop">
              <b>Période personnalisée</b>
              <span className="gx-lbl">Du</span>
              <DateField className="gx-in" value={draft.since} placeholder="Date de début" onChange={(v) => setDraft((d) => ({ ...d, since: v }))} />
              <span className="gx-lbl">Au</span>
              <DateField className="gx-in" value={draft.until} placeholder="Date de fin" onChange={(v) => setDraft((d) => ({ ...d, until: v }))} />
              {draft.since && draft.until && draft.since > draft.until && (
                <p className="gx-hint">La date de début doit précéder la date de fin.</p>
              )}
              <div className="gx-row">
                {rangeKey === "custom" && (
                  <button type="button" className="gx-btn gx-sm" onClick={() => { setRangeKey("7d"); setCustomOpen(false); }}>Revenir à 7 jours</button>
                )}
                <span className="gx-sp" />
                <button type="button" className="gx-btn gx-sm gx-pri" disabled={!draftOk} onClick={applyCustom}>Appliquer</button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="gx-tabs">
        <div className="gx-seg" role="tablist" aria-label="Vue">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "evolution" && <PerformanceView range={range} rangeKey={rangeKey} />}
      {tab === "creations" && <TopAdsView range={range} />}
      {tab === "analyse" && <AiAnalysisView range={range} periodLabel={periodPhrase} />}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="gx-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
