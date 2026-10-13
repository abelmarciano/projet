import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead } from "@/lib/admin/functions";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { CheckCheck, Loader2 } from "lucide-react";
import { ADMIN_KIND, timeAgo } from "@/components/admin/adminFormat";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "Alertes internes - Admin" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const fetchNotifs = useServerFn(getAdminNotifications);
  const markOne = useServerFn(markAdminNotificationRead);
  const markAll = useServerFn(markAllAdminNotificationsRead);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => fetchNotifs(),
    refetchInterval: 60_000,
  });

  const clearAll = async () => {
    const keys = (data?.notifications ?? []).filter((n) => !n.read).map((n) => n.key);
    if (!keys.length) return;
    await markAll({ data: { keys } });
    await qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  return (
    <>
      <AdminTopBar
        title="Alertes internes"
        subtitle={data ? `${data.unreadCount} non lue${data.unreadCount > 1 ? "s" : ""} sur ${data.notifications.length} · mises à jour chaque minute` : undefined}
        actions={
          data && data.unreadCount > 0 ? (
            <button type="button" className="ad-btn" onClick={clearAll}><CheckCheck className="ad-i" aria-hidden />Tout marquer lu</button>
          ) : null
        }
      />
      <div className="ad-page">
        <section className="ad-card">
          {isLoading || !data ? (
            <div className="ad-loading"><Loader2 className="ad-i ad-spin" aria-label="Chargement" /></div>
          ) : data.notifications.length === 0 ? (
            <div className="ad-empty"><b>Aucune alerte</b>Tout roule côté plateforme.</div>
          ) : (
            data.notifications.map((n) => {
              const k = ADMIN_KIND[n.kind] ?? { ...ADMIN_KIND.default, label: n.kind };
              return (
                <Link
                  key={n.key}
                  to={n.linkTo}
                  onClick={async () => {
                    try {
                      await markOne({ data: { key: n.key } });
                      await qc.invalidateQueries({ queryKey: ["admin-notifications"] });
                    } catch { /* lecture non bloquante */ }
                  }}
                  className={`ad-nf${n.read ? "" : " unread"}`}
                >
                  <span className={`ad-nic ad-tone-${k.tone}`}><k.icon className="ad-i" aria-hidden /></span>
                  <div className="ad-grow">
                    <b>{n.title}</b>{k.label !== n.title && <span className="ad-pill out">{k.label}</span>}
                    <p>{n.body}</p>
                  </div>
                  <time dateTime={n.createdAt}>{timeAgo(n.createdAt)}</time>
                  {!n.read && <i className="ad-ud" aria-label="Non lue" />}
                </Link>
              );
            })
          )}
        </section>
      </div>
    </>
  );
}
