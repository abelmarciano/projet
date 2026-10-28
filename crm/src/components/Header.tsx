import { Bell, CalendarDays, LogOut, RotateCcw, Settings, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, formatDateTime } from "@/lib/utils";
import { CURRENT_USER } from "@/data/constants";
import { MenuItem, Popover } from "./ui";

export type Page = "clients" | "planning";

export function Header({ page, onPage, onOpenClient }: { page: Page; onPage: (p: Page) => void; onOpenClient: (id: number) => void }) {
  const { notifications, markNotificationsRead, resetDemo } = useStore();
  const unread = notifications.filter((n) => !n.lu).length;

  const tabs = [
    { id: "clients" as const, label: "Clients", icon: Users },
    { id: "planning" as const, label: "Planning", icon: CalendarDays },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-sm font-extrabold text-white shadow-lg shadow-brand-600/30">
            N
          </div>
          <span className="hidden text-lg font-extrabold tracking-tight text-slate-900 sm:block">
            Norea<span className="text-brand-600">CRM</span>
          </span>
        </div>

        <nav className="flex rounded-2xl bg-slate-100/80 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onPage(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition sm:px-4",
                page === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
              )}
            >
              <t.icon className="h-4 w-4" />
              <span className="hidden min-[400px]:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Popover
            align="right"
            className="w-80"
            trigger={({ toggle }) => (
              <button
                onClick={() => {
                  toggle();
                }}
                className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {unread}
                  </span>
                )}
              </button>
            )}
          >
            {(close) => (
              <div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-bold text-slate-900">Notifications</span>
                  <button onClick={markNotificationsRead} className="text-xs font-semibold text-brand-600 hover:underline">
                    Tout marquer comme lu
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-400">Aucune notification</p>}
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (n.clientId) onOpenClient(n.clientId);
                        close();
                      }}
                      className="flex w-full gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50"
                    >
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.lu ? "bg-slate-200" : "bg-brand-500")} />
                      <span>
                        <span className="block text-sm text-slate-700">{n.texte}</span>
                        <span className="text-xs text-slate-400">{formatDateTime(n.date)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Popover>

          <Popover
            align="right"
            trigger={({ toggle }) => (
              <button onClick={toggle} className="hidden rounded-xl p-2.5 text-slate-500 sm:block transition hover:bg-slate-100 hover:text-slate-800">
                <Settings className="h-5 w-5" />
              </button>
            )}
          >
            {(close) => (
              <MenuItem
                icon={<RotateCcw />}
                onClick={() => {
                  resetDemo();
                  close();
                }}
              >
                Réinitialiser les données de démo
              </MenuItem>
            )}
          </Popover>

          <Popover
            align="right"
            trigger={({ toggle }) => (
              <button
                onClick={toggle}
                className="ml-1 grid h-9 w-9 place-items-center sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-sky-100 to-brand-100 text-sm font-bold text-brand-700 ring-2 ring-white transition hover:ring-brand-200"
              >
                {CURRENT_USER[0]}
              </button>
            )}
          >
            {() => (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-slate-900">{CURRENT_USER}</p>
                  <p className="text-xs text-slate-500">Conseillère · SLB CONSEILS</p>
                </div>
                <MenuItem icon={<LogOut />} danger>
                  Se déconnecter
                </MenuItem>
              </>
            )}
          </Popover>
        </div>
      </div>
    </header>
  );
}
