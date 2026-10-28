import { useState } from "react";
import {
  Bookmark, BookmarkPlus, CalendarClock, CalendarPlus, ChevronsDown, ChevronsUp, Globe, ListFilter, Search, Settings2,
  SlidersHorizontal, Trash2, X,
} from "lucide-react";
import { COMMERCIAUX, EQUIPES, PAIEMENTS, PRODUITS, STATUSES } from "@/data/constants";
import { emptyFilters, type Filters, type StatusId } from "@/data/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { activeFilterCount } from "@/lib/filter";
import { Button, Card, Input, MenuItem, Popover, Select } from "./ui";

export type ColumnId = "tel" | "adresse" | "equipe" | "statut" | "nrp" | "observations";
export const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: "tel", label: "Téléphone" },
  { id: "adresse", label: "Adresse" },
  { id: "equipe", label: "Équipe" },
  { id: "statut", label: "Statut" },
  { id: "nrp", label: "NRP" },
  { id: "observations", label: "Observations" },
];

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  counts: Record<StatusId, number>;
  hiddenColumns: ColumnId[];
  setHiddenColumns: (c: ColumnId[]) => void;
}

function DateRange({ icon: Icon, from, to, onChange, title }: { icon: typeof CalendarPlus; from: string; to: string; onChange: (from: string, to: string) => void; title: string }) {
  return (
    <div title={title} className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 transition focus-within:border-brand-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10">
      <span className="grid h-full w-10 shrink-0 place-items-center border-r border-slate-200 text-slate-400">
        <Icon className="h-4 w-4" />
      </span>
      <input
        type="date"
        value={from}
        onChange={(e) => onChange(e.target.value, to)}
        className={cn("h-full min-w-0 flex-1 bg-transparent px-2 text-xs outline-none", !from && "text-slate-400")}
      />
      <span className="h-5 w-px bg-slate-200" />
      <input
        type="date"
        value={to}
        onChange={(e) => onChange(from, e.target.value)}
        className={cn("h-full min-w-0 flex-1 bg-transparent px-2 text-xs outline-none", !to && "text-slate-400")}
      />
    </div>
  );
}

export function Sidebar({ filters, setFilters, counts, hiddenColumns, setHiddenColumns }: Props) {
  const { presets, savePreset, deletePreset } = useStore();
  const [advanced, setAdvanced] = useState(false);
  const [statusOpen, setStatusOpen] = useState(() => window.innerWidth >= 1024);
  const [presetName, setPresetName] = useState("");
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const n = activeFilterCount(filters);

  const toggleStatus = (id: StatusId) =>
    set({ statuts: filters.statuts.includes(id) ? filters.statuts.filter((s) => s !== id) : [...filters.statuts, id] });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-[300px] lg:shrink-0">
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Button size="icon" className="h-9 w-9" title="Rechercher" onClick={() => document.getElementById("crm-search")?.focus()}>
            <Search className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="dark" className="h-9 w-9" title="Effacer tous les filtres" onClick={() => setFilters(emptyFilters)}>
            <X className="h-4 w-4" />
          </Button>
          <Button variant="danger" className={cn("h-9 px-3 text-xs", advanced && "ring-2 ring-rose-200")} onClick={() => setAdvanced((a) => !a)}>
            <ListFilter className="h-4 w-4" />
            {advanced ? "− filtres" : "+ filtres"}
          </Button>
          <Popover
            align="right"
            trigger={({ toggle }) => (
              <Button size="icon" variant="secondary" className="h-9 w-9 text-rose-500" title="Colonnes" onClick={toggle}>
                <Settings2 className="h-4 w-4" />
              </Button>
            )}
          >
            {() => (
              <div className="p-1">
                <p className="px-2 pb-1.5 pt-1 text-xs font-bold uppercase tracking-wide text-slate-400">Colonnes visibles</p>
                {COLUMNS.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand-600"
                      checked={!hiddenColumns.includes(c.id)}
                      onChange={() => setHiddenColumns(hiddenColumns.includes(c.id) ? hiddenColumns.filter((x) => x !== c.id) : [...hiddenColumns, c.id])}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </Popover>
          {n > 0 && <span className="ml-auto rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{n}</span>}
        </div>

        <Popover
          className="w-72"
          trigger={({ toggle }) => (
            <Button className="mb-4 h-9 px-3.5 text-sm" onClick={toggle}>
              <SlidersHorizontal className="h-4 w-4" />
              Présélections
            </Button>
          )}
        >
          {(close) => (
            <div>
              <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Mes présélections</p>
              {presets.length === 0 && <p className="px-3 py-2 text-sm text-slate-400">Aucune présélection</p>}
              {presets.map((p) => (
                <div key={p.id} className="group flex items-center rounded-xl hover:bg-slate-100">
                  <MenuItem
                    icon={<Bookmark />}
                    onClick={() => {
                      setFilters(p.filters);
                      close();
                    }}
                  >
                    {p.name}
                  </MenuItem>
                  <button onClick={() => deletePreset(p.id)} className="mr-2 rounded-lg p-1 text-slate-300 opacity-0 hover:text-rose-500 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <form
                className="mt-1 flex gap-2 border-t border-slate-100 p-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!presetName.trim()) return;
                  savePreset({ name: presetName.trim(), filters });
                  setPresetName("");
                }}
              >
                <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Nom des filtres actuels…" className="h-9" />
                <Button size="icon" className="h-9 w-9 shrink-0" title="Enregistrer">
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </Popover>

        <div className="flex flex-col gap-2.5">
          <Input id="crm-search" value={filters.search} onChange={(e) => set({ search: e.target.value })} placeholder="Rechercher (nom, tél, email, ID…)" />
          <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 focus-within:border-brand-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10">
            <input
              value={filters.departements}
              onChange={(e) => set({ departements: e.target.value })}
              placeholder="Ex: 75,78,94"
              className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-sm outline-none placeholder:text-slate-400"
            />
            <button
              onClick={() => set({ excludeDepartements: !filters.excludeDepartements })}
              title={filters.excludeDepartements ? "Mode : exclure ces départements" : "Mode : uniquement ces départements"}
              className={cn(
                "grid h-full w-11 place-items-center border-l border-slate-200 transition",
                filters.excludeDepartements ? "bg-rose-50 text-rose-500" : "text-slate-400 hover:text-brand-600",
              )}
            >
              <Globe className="h-4 w-4" />
            </button>
          </div>
          <DateRange icon={CalendarPlus} title="Date de création" from={filters.createdFrom} to={filters.createdTo} onChange={(a, b) => set({ createdFrom: a, createdTo: b })} />
          <DateRange icon={CalendarClock} title="Date de RDV" from={filters.rdvFrom} to={filters.rdvTo} onChange={(a, b) => set({ rdvFrom: a, rdvTo: b })} />
          <div className="flex gap-2">
            <Select
              value={filters.statuts.length === 1 ? filters.statuts[0] : ""}
              onChange={(e) => set({ statuts: e.target.value ? [e.target.value as StatusId] : [] })}
            >
              <option value="">{filters.statuts.length > 1 ? `${filters.statuts.length} statuts` : "Statut"}</option>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Button size="icon" variant="secondary" className="shrink-0" title="Afficher/masquer les statuts" onClick={() => setStatusOpen((o) => !o)}>
              {statusOpen ? <ChevronsUp className="h-4 w-4" /> : <ChevronsDown className="h-4 w-4" />}
            </Button>
          </div>
          <Select value={filters.paiement} onChange={(e) => set({ paiement: e.target.value })}>
            <option value="">Type de paiement</option>
            {PAIEMENTS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>

          {advanced && (
            <div className="mt-1 flex animate-fade-in flex-col gap-2.5 border-t border-dashed border-slate-200 pt-3">
              <Select value={filters.equipe} onChange={(e) => set({ equipe: e.target.value })}>
                <option value="">Équipe</option>
                {EQUIPES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
              <Select value={filters.commercial} onChange={(e) => set({ commercial: e.target.value })}>
                <option value="">Commercial</option>
                {COMMERCIAUX.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
              <Select value={filters.produit} onChange={(e) => set({ produit: e.target.value })}>
                <option value="">Produit</option>
                {PRODUITS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
              <Input type="number" min={0} value={filters.nrpMin} onChange={(e) => set({ nrpMin: e.target.value })} placeholder="NRP minimum" />
            </div>
          )}
        </div>
      </Card>

      {statusOpen && (
        <Card className="animate-fade-in p-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-brand-600" />
              Statuts
            </h3>
            {filters.statuts.length > 0 ? (
              <button onClick={() => set({ statuts: [] })} className="text-xs font-semibold text-brand-600 hover:underline">
                Effacer
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-400">{total} au total</span>
            )}
          </div>
          <ul className="flex flex-col gap-0.5">
            {STATUSES.map((s) => {
              const active = filters.statuts.includes(s.id);
              const c = counts[s.id] ?? 0;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => toggleStatus(s.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition",
                      active ? "bg-brand-50 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className="grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border-2 bg-white transition"
                      style={active ? { background: s.color, borderColor: s.color } : { borderColor: s.color + "99" }}
                    >
                      {active && <svg viewBox="0 0 12 12" className="h-3 w-3 text-white"><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </span>
                    <span className="flex-1 truncate">{s.label}</span>
                    <span
                      className={cn("min-w-[26px] rounded-full px-2 py-0.5 text-center text-xs font-bold", c === 0 && "bg-slate-100 text-slate-400")}
                      style={c > 0 ? { background: s.color, color: s.text } : undefined}
                    >
                      {c}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </aside>
  );
}
