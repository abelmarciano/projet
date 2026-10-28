import { useMemo, useState } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button, Card, Input, Label, Modal, Select } from "@/components/ui";
import { COMMERCIAUX, STATUS_MAP } from "@/data/constants";
import { useStore } from "@/lib/store";
import { cn, formatRdv, toDateInput } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 8h → 19h
const ROW = 56; // px par heure

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function PlanningPage({ onOpen }: { onOpen: (id: number) => void }) {
  const { clients, updateClient, toast } = useStore();
  const [week, setWeek] = useState(() => startOfWeek(new Date()));
  const [commercial, setCommercial] = useState("");
  const [planning, setPlanning] = useState<{ clientId: string; date: string } | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(week);
    d.setDate(d.getDate() + i);
    return d;
  });
  const end = new Date(week);
  end.setDate(end.getDate() + 7);

  const withRdv = useMemo(() => clients.filter((c) => c.rdv && (!commercial || c.commercial === commercial)), [clients, commercial]);
  const weekRdv = withRdv.filter((c) => {
    const t = new Date(c.rdv!).getTime();
    return t >= week.getTime() && t < end.getTime();
  });
  const upcoming = withRdv
    .filter((c) => new Date(c.rdv!).getTime() >= Date.now())
    .sort((a, b) => a.rdv!.localeCompare(b.rdv!))
    .slice(0, 8);

  const todayKey = new Date().toDateString();
  const shift = (n: number) => {
    const d = new Date(week);
    d.setDate(d.getDate() + n * 7);
    setWeek(d);
  };
  const monthLabel = week.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 xl:flex-row">
      <section className="min-w-0 flex-1">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">Planning</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              <span className="capitalize">{monthLabel}</span> · {weekRdv.length} rendez-vous cette semaine
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-52">
            <Select value={commercial} onChange={(e) => setCommercial(e.target.value)}>
              <option value="">Tous les commerciaux</option>
              {COMMERCIAUX.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            </div>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white">
              <button onClick={() => shift(-1)} className="grid h-10 w-10 place-items-center text-slate-500 hover:text-slate-900">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setWeek(startOfWeek(new Date()))} className="px-2 text-sm font-semibold text-slate-700 hover:text-brand-700">
                Aujourd'hui
              </button>
              <button onClick={() => shift(1)} className="grid h-10 w-10 place-items-center text-slate-500 hover:text-slate-900">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setPlanning({ clientId: "", date: "" })}>
              <CalendarPlus className="h-4 w-4" /> Planifier un RDV
            </Button>
          </div>
        </div>

        <Card className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-slate-100">
              <div />
              {days.map((d) => {
                const isToday = d.toDateString() === todayKey;
                return (
                  <div key={d.toISOString()} className="border-l border-slate-100 px-3 py-3 text-center">
                    <p className="text-xs font-semibold uppercase text-slate-400">{d.toLocaleDateString("fr-FR", { weekday: "short" })}</p>
                    <p className={cn("mx-auto mt-0.5 grid h-8 w-8 place-items-center rounded-full text-sm font-bold", isToday ? "bg-brand-600 text-white" : "text-slate-800")}>
                      {d.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="relative grid grid-cols-[56px_repeat(7,1fr)]">
              <div>
                {HOURS.map((h) => (
                  <div key={h} style={{ height: ROW }} className="pr-2 pt-1 text-right text-[11px] font-medium text-slate-400">
                    {h}h
                  </div>
                ))}
              </div>
              {days.map((d) => {
                const items = weekRdv.filter((c) => new Date(c.rdv!).toDateString() === d.toDateString());
                return (
                  <div key={d.toISOString()} className="relative border-l border-slate-100">
                    {HOURS.map((h) => (
                      <button
                        key={h}
                        style={{ height: ROW }}
                        onClick={() => {
                          const x = new Date(d);
                          x.setHours(h, 0, 0, 0);
                          setPlanning({ clientId: "", date: x.toISOString() });
                        }}
                        className="block w-full border-b border-dashed border-slate-100 transition hover:bg-brand-50/50"
                      />
                    ))}
                    {items.map((c) => {
                      const t = new Date(c.rdv!);
                      const top = (t.getHours() + t.getMinutes() / 60 - HOURS[0]) * ROW;
                      const s = STATUS_MAP[c.statut];
                      return (
                        <button
                          key={c.id}
                          onClick={() => onOpen(c.id)}
                          style={{ top: Math.max(0, top) + 2, height: ROW - 4, borderLeftColor: s.color, background: s.soft }}
                          className="absolute inset-x-1 overflow-hidden rounded-lg border-l-4 px-2 py-1 text-left shadow-sm transition hover:z-10 hover:shadow-float"
                        >
                          <p className="truncate text-[11px] font-bold text-slate-900">
                            {t.getHours()}h{t.getMinutes() ? String(t.getMinutes()).padStart(2, "0") : ""} · {c.nom}
                          </p>
                          <p className="truncate text-[11px] text-slate-600">{c.ville}</p>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </section>

      <aside className="w-full xl:w-[320px] xl:shrink-0">
        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold text-slate-900">
            <Clock className="h-4 w-4 text-brand-600" /> Prochains rendez-vous
          </h3>
          {upcoming.length === 0 && <p className="px-1 py-6 text-center text-sm text-slate-400">Aucun RDV à venir</p>}
          <ul className="flex flex-col gap-1">
            {upcoming.map((c) => (
              <li key={c.id}>
                <button onClick={() => onOpen(c.id)} className="flex w-full gap-3 rounded-xl p-2.5 text-left transition hover:bg-slate-50">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-center text-[11px] font-bold leading-tight text-amber-700 ring-1 ring-amber-200">
                    {formatRdv(c.rdv!).split(" ").map((p) => (
                      <span key={p} className="block">
                        {p}
                      </span>
                    ))}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {c.civilite} {c.nom}
                    </span>
                    <span className="flex items-center gap-1 truncate text-xs text-slate-500">
                      <MapPin className="h-3 w-3" /> {c.codePostal} {c.ville}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{c.commercial}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </aside>

      <Modal
        open={planning !== null}
        onClose={() => setPlanning(null)}
        title="Planifier un rendez-vous"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPlanning(null)}>
              Annuler
            </Button>
            <Button form="plan-rdv">Enregistrer</Button>
          </>
        }
      >
        {planning && (
          <form
            id="plan-rdv"
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!planning.clientId || !planning.date) return;
              updateClient(Number(planning.clientId), { rdv: planning.date });
              toast("Rendez-vous planifié");
              setPlanning(null);
            }}
          >
            <div>
              <Label>Client</Label>
              <Select required value={planning.clientId} onChange={(e) => setPlanning({ ...planning, clientId: e.target.value })}>
                <option value="">Choisir un dossier…</option>
                {[...clients]
                  .sort((a, b) => a.nom.localeCompare(b.nom))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} {c.prenom} — #{c.id} ({c.ville})
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <Label>Date et heure</Label>
              <Input
                required
                type="datetime-local"
                value={toDateInput(planning.date)}
                onChange={(e) => setPlanning({ ...planning, date: e.target.value ? new Date(e.target.value).toISOString() : "" })}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
