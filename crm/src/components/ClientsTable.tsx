import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Clock, Mail, MapPin, Minus, PanelRightOpen, Phone, Plus, User } from "lucide-react";
import type { Client } from "@/data/types";
import { useStore } from "@/lib/store";
import { cn, formatDateTime, formatRdv, formatShortDate } from "@/lib/utils";
import { StatusSelect } from "./StatusBadge";
import type { ColumnId } from "./Sidebar";

export type SortKey = "id" | "nom" | "nrp" | "createdAt";
export type Sort = { key: SortKey; dir: "asc" | "desc" };

interface Props {
  rows: Client[];
  selected: number[];
  setSelected: (ids: number[]) => void;
  hidden: ColumnId[];
  sort: Sort;
  setSort: (s: Sort) => void;
  onOpen: (id: number) => void;
}

function SortHeader({ label, k, sort, setSort, className }: { label: string; k: SortKey; sort: Sort; setSort: (s: Sort) => void; className?: string }) {
  const active = sort.key === k;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-3 py-3.5", className)}>
      <button
        onClick={() => setSort({ key: k, dir: active && sort.dir === "desc" ? "asc" : "desc" })}
        className={cn("inline-flex items-center gap-1 uppercase tracking-wider transition hover:text-slate-800", active && "text-brand-700")}
      >
        {label}
        <Icon className={cn("h-3.5 w-3.5", !active && "opacity-40")} />
      </button>
    </th>
  );
}

function ObservationCell({ client }: { client: Client }) {
  const { addObservation } = useStore();
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const obs = expanded ? client.observations : client.observations.slice(-3);
  const submit = () => {
    if (!text.trim()) return;
    addObservation(client.id, text.trim());
    setText("");
  };
  return (
    <div className="flex w-[240px] flex-col gap-1.5">
      {client.observations.length > 3 && (
        <button onClick={() => setExpanded((e) => !e)} className="self-start text-[11px] font-semibold text-slate-400 hover:text-brand-600">
          {expanded ? "Réduire" : `+ ${client.observations.length - 3} plus ancienne(s)`}
        </button>
      )}
      {obs.map((o) => (
        <div key={o.id} className="group/obs relative">
          <p className="truncate text-xs leading-5 text-slate-600">
            <span className="font-semibold text-slate-800">{formatShortDate(o.date)}</span> <span className="text-brand-700">{o.texte}</span>
          </p>
          <div className="pointer-events-none absolute bottom-full left-0 z-30 mb-1.5 hidden w-72 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-float group-hover/obs:block">
            <p className="mb-0.5 font-semibold">
              {formatDateTime(o.date)} <span className="font-normal text-slate-400">par</span> {o.auteur}
            </p>
            <p className="text-slate-200">{o.texte}</p>
          </div>
        </div>
      ))}
      <form
        className="flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ajouter une observation"
          className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
        />
        <button disabled={!text.trim()} className="h-8 rounded-lg bg-brand-600 px-2.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-40">
          OK
        </button>
      </form>
    </div>
  );
}

function NrpStepper({ client }: { client: Client }) {
  const { updateClient } = useStore();
  const btn = "grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-brand-300 hover:text-brand-600 active:scale-90 disabled:opacity-30";
  return (
    <div className="flex items-center gap-1.5">
      <button className={btn} disabled={client.nrp === 0} onClick={() => updateClient(client.id, { nrp: Math.max(0, client.nrp - 1) })}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn("w-6 text-center text-sm font-bold tabular-nums", client.nrp >= 3 ? "text-rose-600" : client.nrp > 0 ? "text-amber-600" : "text-slate-800")}>
        {client.nrp}
      </span>
      <button className={btn} onClick={() => updateClient(client.id, { nrp: client.nrp + 1 })}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ClientsTable({ rows, selected, setSelected, hidden, sort, setSort, onOpen }: Props) {
  const { setStatus } = useStore();
  const show = (c: ColumnId) => !hidden.includes(c);
  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const now = Date.now();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left">
        <thead>
          <tr className="text-[11px] font-bold text-slate-500">
            <th className="sticky left-0 z-10 w-10 rounded-tl-3xl border-b border-slate-200 bg-slate-50/90 py-3.5 pl-5 pr-2">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer rounded accent-brand-600"
                checked={allChecked}
                onChange={() => setSelected(allChecked ? selected.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...selected, ...rows.map((r) => r.id)])])}
              />
            </th>
            <SortHeader label="ID" k="id" sort={sort} setSort={setSort} className="border-b border-slate-200 bg-slate-50/90" />
            <SortHeader label="Nom" k="nom" sort={sort} setSort={setSort} className="border-b border-slate-200 bg-slate-50/90" />
            {show("tel") && <th className="border-b border-slate-200 bg-slate-50/90 px-3 py-3.5 uppercase tracking-wider">Tél</th>}
            {show("adresse") && <th className="border-b border-slate-200 bg-slate-50/90 px-3 py-3.5 uppercase tracking-wider">Adresse</th>}
            {show("equipe") && <th className="border-b border-slate-200 bg-slate-50/90 px-3 py-3.5 uppercase tracking-wider">Équipe</th>}
            {show("statut") && <th className="border-b border-slate-200 bg-slate-50/90 px-3 py-3.5 uppercase tracking-wider">Statut</th>}
            {show("nrp") && <SortHeader label="NRP" k="nrp" sort={sort} setSort={setSort} className="border-b border-slate-200 bg-slate-50/90" />}
            {show("observations") && <th className="border-b border-slate-200 bg-slate-50/90 px-3 py-3.5 uppercase tracking-wider">Observations</th>}
            <th className="rounded-tr-3xl border-b border-slate-200 bg-slate-50/90 px-3 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const isSel = selected.includes(c.id);
            const rdvPast = c.rdv && new Date(c.rdv).getTime() < now;
            const td = cn("border-b border-slate-100 px-3 py-4 align-top transition-colors", isSel ? "bg-brand-50/60" : "bg-white group-hover:bg-slate-50/80");
            return (
              <tr key={c.id} className="group">
                <td className={cn(td, "sticky left-0 z-10 pl-5 pr-2")}>
                  <span className="absolute inset-y-3 left-0 w-1 rounded-r-full" style={{ background: c.nrp >= 3 ? "#f43f5e" : "transparent" }} />
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-brand-600"
                    checked={isSel}
                    onChange={() => setSelected(isSel ? selected.filter((x) => x !== c.id) : [...selected, c.id])}
                  />
                </td>
                <td className={cn(td, "font-bold tabular-nums text-slate-900")}>{c.id}</td>
                <td className={td}>
                  <button onClick={() => onOpen(c.id)} className="max-w-[180px] text-left text-sm font-semibold uppercase leading-snug text-brand-700 hover:underline">
                    {c.civilite} {c.nom}
                    {c.prenom && <span className="block font-medium text-brand-600/80">{c.prenom}</span>}
                  </button>
                </td>
                {show("tel") && (
                  <td className={td}>
                    <div className="flex flex-col gap-1 text-xs">
                      {c.telephones.map((t) => (
                        <a key={t} href={`tel:${t.replace(/\s/g, "")}`} className="flex items-center gap-1.5 font-medium text-brand-700 hover:underline">
                          <Phone className="h-3.5 w-3.5 text-brand-400" />
                          {t}
                        </a>
                      ))}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex max-w-[200px] items-center gap-1.5 text-slate-500 hover:text-brand-700">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate uppercase">{c.email}</span>
                        </a>
                      )}
                    </div>
                  </td>
                )}
                {show("adresse") && (
                  <td className={td}>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(`${c.adresse} ${c.codePostal} ${c.ville}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group/addr flex max-w-[160px] gap-1.5 text-xs font-medium uppercase leading-relaxed text-brand-700 hover:underline"
                    >
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300 group-hover/addr:text-brand-500" />
                      <span>
                        {c.adresse}
                        <br />
                        {c.codePostal} {c.ville}
                      </span>
                    </a>
                  </td>
                )}
                {show("equipe") && (
                  <td className={td}>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-brand-700">
                        <span className="h-2 w-2 rounded-full bg-brand-600" />
                        {c.equipe}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <User className="h-3 w-3" />
                        {c.commercial}
                      </span>
                    </div>
                  </td>
                )}
                {show("statut") && (
                  <td className={td}>
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusSelect value={c.statut} onChange={(s) => setStatus([c.id], s)} />
                      <span className="text-xs text-slate-600">
                        Paiement <span className="font-semibold text-slate-800">{c.paiement}</span>
                      </span>
                      <span className="flex flex-wrap gap-1">
                        {c.produits.map((p) => (
                          <span key={p} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                            {p}
                          </span>
                        ))}
                      </span>
                    </div>
                  </td>
                )}
                {show("nrp") && (
                  <td className={td}>
                    <NrpStepper client={c} />
                  </td>
                )}
                {show("observations") && (
                  <td className={td}>
                    <ObservationCell client={c} />
                  </td>
                )}
                <td className={cn(td, "pr-5")}>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onOpen(c.id)}
                      title="Ouvrir la fiche"
                      className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 transition hover:bg-emerald-600 active:scale-95"
                    >
                      <PanelRightOpen className="h-4 w-4" />
                    </button>
                    {c.rdv && (
                      <span
                        className={cn(
                          "flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold",
                          rdvPast ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {formatRdv(c.rdv)}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
