import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { getMetaTopAds } from "@/lib/meta-insights.functions";
import { MetaConnectButton } from "@/components/MetaConnectDialog";
import { displayAdName, frSetName } from "@/lib/meta-labels";
import { GxSelectTrigger as SelectTrigger } from "@/components/ui/gx-controls";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { frMoney, frNumber, frPercent } from "@/lib/format";

/*
 * Onglet « Meilleures pubs » : grille .gx-topg / .gx-topc de la maquette Performance.
 */

type SortKey = "spend" | "ctr" | "clicks" | "impressions" | "results";
const SORTS: { key: SortKey; label: string; format: (v: number) => string }[] = [
  { key: "spend", label: "Dépense", format: frMoney },
  { key: "ctr", label: "Taux de clic", format: (v) => frPercent(v, 1) },
  { key: "clicks", label: "Clics", format: frNumber },
  { key: "impressions", label: "Affichages", format: frNumber },
  { key: "results", label: "Résultats", format: frNumber },
];

export function TopAdsView({ range }: { range: { since: string; until: string } }) {
  const fetchTop = useServerFn(getMetaTopAds);
  const [sort, setSort] = useState<SortKey>("results");

  // Un seul appel : il renvoie aussi l'état de connexion Meta, ce qui évite
  // de dépendre d'une requête de crédentials qui peut rester en attente.
  const q = useQuery({
    queryKey: ["meta-top-ads", range.since, range.until],
    queryFn: () => fetchTop({ data: range }),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const metaConnected = q.data?.connected === true;
  const active = SORTS.find((s) => s.key === sort) ?? SORTS[0];
  const ads = useMemo(
    () => [...(q.data?.ads ?? [])].sort((a, b) => (b[sort] || 0) - (a[sort] || 0)).slice(0, 24),
    [q.data, sort],
  );

  return (
    <div className="gx-pane gx-on">
      {metaConnected && ads.length > 1 && (
        <div className="gx-bar-f">
          <span className="gx-sp" />
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger aria-label="Classer les pubs par"><span>Classées par</span><SelectValue /></SelectTrigger>
            <SelectContent className="console-app-portal">
              {SORTS.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {q.isPending ? (
        <p className="gx-hint">Chargement de tes meilleures pubs…</p>
      ) : q.isError ? (
        <div className="gx-empty">
          <b>Impossible de récupérer tes meilleures pubs</b>
          <span>Meta n'a pas répondu correctement pour cette période. Réessaie dans un instant.</span>
          <button type="button" className="gx-btn gx-sm" onClick={() => void q.refetch()}>Réessayer</button>
        </div>
      ) : !metaConnected ? (
        <div className="gx-empty">
          <b>Connecte ton compte Meta pour voir tes meilleures pubs</b>
          <span>Ton classement se remplit automatiquement dès que Meta est connecté et que tes pubs accumulent des affichages.</span>
          <MetaConnectButton />
        </div>
      ) : ads.length === 0 ? (
        <div className="gx-empty">
          <b>Pas encore assez de données pour désigner tes meilleures pubs</b>
          <span>Élargis la période en haut à droite, ou publie une pub : dès qu'elle accumule des affichages, elle apparaît ici classée.</span>
          <div className="gx-row">
            <Link to="/create" className="gx-btn gx-sm gx-pri">Créer une pub</Link>
            <Link to="/creations" className="gx-btn gx-sm">Voir mes créations</Link>
          </div>
        </div>
      ) : (
        <div className="gx-topg">
          {ads.map((a, i) => {
            const title = displayAdName(a.name, { index: i, adsetName: a.adset_name, campaignName: a.campaign_name });
            const parts = [
              sort !== "ctr" && sort !== "results" ? `${active.label} ${active.format(a[sort])}` : null,
              `Taux de clic ${frPercent(a.ctr, 1)}`,
              `${frNumber(a.results)} résultat${a.results > 1 ? "s" : ""}`,
            ].filter(Boolean);
            const details = [
              `Campagne : ${frSetName(a.campaign_name)}`,
              `Dépense : ${frMoney(a.spend)}`,
              `Affichages : ${frNumber(a.impressions)}`,
              `Clics : ${frNumber(a.clicks)}`,
              a.is_video ? "Vidéo" : "Image",
            ].join(" · ");
            return (
              <article key={a.id} className="gx-topc" title={details}>
                <span className="gx-rk">#{i + 1}</span>
                <AdThumb url={a.thumbnail_url} alt={title} label={a.campaign_name} />
                <div>
                  <b>{title}</b>
                  <small>{parts.join(" · ")}</small>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Initiales d'une campagne, utilisées en repli quand Meta ne renvoie pas de miniature. */
function initialsOf(label: string) {
  return (label || "?")
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

function AdThumb({ url, alt, label }: { url: string | null; alt: string; label: string }) {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return <img src={url} alt={alt} loading="lazy" onError={() => setBroken(true)} />;
  }
  return <span className="gx-ph0b" aria-label="Aperçu indisponible">{initialsOf(label)}</span>;
}
