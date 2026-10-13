import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead } from "@/lib/admin/functions";
import { ADMIN_KIND, timeAgo } from "./adminFormat";

/** Cloche de la barre du haut : les 30 dernières alertes internes, lues / non lues. */
export function AdminNotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const fetchNotifs = useServerFn(getAdminNotifications);
  const markOne = useServerFn(markAdminNotificationRead);
  const markAll = useServerFn(markAllAdminNotificationsRead);

  const { data } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => fetchNotifs(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const notifs = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  const openOne = async (key: string) => {
    setOpen(false);
    try {
      await markOne({ data: { key } });
      await qc.invalidateQueries({ queryKey: ["admin-notifications"] });
    } catch { /* lecture non bloquante */ }
  };

  const clearAll = async () => {
    const keys = notifs.filter((n) => !n.read).map((n) => n.key);
    if (!keys.length) return;
    await markAll({ data: { keys } });
    await qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="ad-ib" aria-label={unread ? `Alertes internes, ${unread} non lue${unread > 1 ? "s" : ""}` : "Alertes internes"}>
          <Bell className="ad-i" aria-hidden />
          {unread > 0 && <span className="ad-dot">{unread > 9 ? "9+" : unread}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="ad-pop">
        <header>
          <b>Alertes internes</b>
          <small>{unread > 0 ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}</small>
          {unread > 0 && <button type="button" onClick={clearAll}>Tout marquer lu</button>}
        </header>
        {notifs.length === 0 ? (
          <div className="ad-pe"><b>Aucune alerte</b>Tout roule côté plateforme.</div>
        ) : (
          <div className="ad-pl">
            {notifs.slice(0, 30).map((n) => {
              const k = ADMIN_KIND[n.kind] ?? ADMIN_KIND.default;
              return (
                <Link key={n.key} to={n.linkTo} onClick={() => openOne(n.key)} className={`ad-pn${n.read ? "" : " unread"}`}>
                  <span className={`ad-nic ad-tone-${k.tone}`}><k.icon aria-hidden /></span>
                  <div>
                    <b>{n.title}</b>
                    <p>{n.body}</p>
                    <time dateTime={n.createdAt}>{timeAgo(n.createdAt)}</time>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <footer><Link to="/admin/notifications" onClick={() => setOpen(false)}>Voir toutes les alertes</Link></footer>
      </PopoverContent>
    </Popover>
  );
}
