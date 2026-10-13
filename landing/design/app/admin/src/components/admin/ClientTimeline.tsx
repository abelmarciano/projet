import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { getClientTimeline } from "@/lib/admin/functions";
import { fmtDateTime } from "./adminFormat";

/* Couleur du point = type d'événement. Libellé toujours écrit à côté (jamais la couleur seule). */
const KIND: Record<string, { label: string; color: string }> = {
  ad: { label: "Création", color: "var(--ad-c-ok)" },
  conversation: { label: "Conversation", color: "var(--gx-accent)" },
  note: { label: "Note", color: "var(--ad-c-neutral)" },
  plan: { label: "Plan", color: "var(--ad-info-ink)" },
  notification: { label: "Notification", color: "var(--ad-c-warn)" },
  admin: { label: "Action admin", color: "var(--ad-c-neutral)" },
};

/** Fil chronologique unifié d'un client. */
export function ClientTimeline({ workspaceId }: { workspaceId: string }) {
  const fetchTimeline = useServerFn(getClientTimeline);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-ws-timeline", workspaceId],
    queryFn: () => fetchTimeline({ data: { workspaceId, limit: 150 } }),
    staleTime: 30_000,
  });

  if (isLoading || !data) return <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>;
  if (data.events.length === 0) return <div className="ad-empty"><b>Aucune activité</b>Rien ne s'est encore passé pour ce client.</div>;

  return (
    <>
      <ol className="ad-tl">
        {data.events.map((e) => {
          const k = KIND[e.kind] ?? KIND.admin;
          const inner = (
            <>
              <b>{e.title}</b><span className="ad-pill out">{k.label}</span>
              {e.detail && <p>{e.detail}</p>}
              <small>{fmtDateTime(e.at)}</small>
            </>
          );
          return (
            <li key={e.id} className="ad-tle" style={{ ["--ad-k" as string]: k.color }}>
              {e.linkTo ? <Link to={e.linkTo}>{inner}</Link> : <div>{inner}</div>}
            </li>
          );
        })}
      </ol>
      {data.total > data.events.length && (
        <p className="ad-muted" style={{ margin: "4px 0 0", fontSize: 12.5 }}>{data.events.length} événements affichés sur {data.total}.</p>
      )}
    </>
  );
}
