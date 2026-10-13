import { Link, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getAdminNotifications } from "@/lib/admin/functions";
import { ADMIN_NAV, isNavActive, useAdminNav } from "./AdminNav";

/** Menu latéral de l'espace admin : clair, regroupé, en tiroir sur mobile (classes ad-, src/styles/gx-admin.css). */
export function AdminSidebar({ email, isSuper }: { email: string | null; isSuper: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpen } = useAdminNav();
  const fetchNotifs = useServerFn(getAdminNotifications);
  const { data: notifs } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => fetchNotifs(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const unread = notifs?.unreadCount ?? 0;

  return (
    <>
      <aside className="ad-side" aria-label="Navigation admin" id="ad-side">
        <Link to="/admin" className="ad-brand" aria-label="Growthity · admin">
          <Logo variant="full" className="h-6 w-auto" />
        </Link>
        <div className="ad-who">
          <span className="ad-sh"><ShieldCheck className="ad-i" aria-hidden /></span>
          <span style={{ minWidth: 0 }}>
            <b>Mode admin{isSuper ? " · Super-admin" : ""}</b>
            <small title={email ?? undefined}>{email ?? "-"}</small>
          </span>
        </div>

        <nav aria-label="Rubriques admin">
          {ADMIN_NAV.map((group) => {
            const items = group.items.filter((i) => !i.superOnly || isSuper);
            if (!items.length) return null;
            return (
              <div key={group.label}>
                <div className="ad-ng">{group.label}</div>
                {items.map((item) => {
                  const active = isNavActive(pathname, item);
                  return (
                    <Link key={item.to} to={item.to} className="ad-nv" aria-current={active ? "page" : undefined}>
                      <item.icon className="ad-i" aria-hidden />
                      <span>{item.label}</span>
                      {item.badge === "alerts" && unread > 0 ? (
                        <em aria-label={`${unread} alerte${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}`}>{unread > 9 ? "9+" : unread}</em>
                      ) : null}
                      {item.superOnly ? <i className="ad-lock" title="Visible des super-admins seulement" style={{ fontStyle: "normal" }}>Super</i> : null}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="ad-grow" />
        <div className="ad-back">
          <Link to="/create" className="ad-nv"><ArrowLeft className="ad-i" aria-hidden /><span>Retour à l'app</span></Link>
        </div>
      </aside>
      <button type="button" className="ad-scrim" aria-label="Fermer le menu" onClick={() => setOpen(false)} />
    </>
  );
}
