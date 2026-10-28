import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, ListChecks, Menu, Printer, SearchX, Trash2, UserPlus, X } from "lucide-react";
import { Sidebar, type ColumnId } from "@/components/Sidebar";
import { ClientsTable, type Sort } from "@/components/ClientsTable";
import { ClientForm, emptyDraft, type ClientDraft } from "@/components/ClientForm";
import { StatusDot } from "@/components/StatusBadge";
import { Button, Card, MenuItem, Modal, Popover } from "@/components/ui";
import { STATUSES, STATUS_MAP } from "@/data/constants";
import { emptyFilters, type Client, type Filters, type StatusId } from "@/data/types";
import { applyFilters } from "@/lib/filter";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

function exportCsv(rows: Client[]) {
  const head = ["ID", "Civilité", "Nom", "Prénom", "Téléphones", "Email", "Adresse", "CP", "Ville", "Équipe", "Commercial", "Statut", "Paiement", "Produits", "NRP", "RDV", "Observations"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((c) =>
    [c.id, c.civilite, c.nom, c.prenom, c.telephones.join(" / "), c.email, c.adresse, c.codePostal, c.ville, c.equipe, c.commercial, STATUS_MAP[c.statut].label, c.paiement, c.produits.join(", "), c.nrp, c.rdv ?? "", c.observations.map((o) => o.texte).join(" | ")]
      .map(esc)
      .join(";"),
  );
  const blob = new Blob(["﻿" + [head.map(esc).join(";"), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function loadHidden(): ColumnId[] {
  try {
    return JSON.parse(localStorage.getItem("crm.hiddenColumns") || "[]");
  } catch {
    return [];
  }
}

export function ClientsPage({ onOpen }: { onOpen: (id: number) => void }) {
  const { clients, addClient, deleteClients, setStatus } = useStore();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<Sort>({ key: "id", dir: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [hidden, setHidden] = useState<ColumnId[]>(loadHidden);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<ClientDraft>(emptyDraft);

  useEffect(() => {
    try {
      localStorage.setItem("crm.hiddenColumns", JSON.stringify(hidden));
    } catch {
      /* stockage indisponible */
    }
  }, [hidden]);

  const counts = useMemo(() => {
    const base = applyFilters(clients, filters, { ignoreStatuts: true });
    const acc = Object.fromEntries(STATUSES.map((s) => [s.id, 0])) as Record<StatusId, number>;
    base.forEach((c) => acc[c.statut]++);
    return acc;
  }, [clients, filters]);

  const filtered = useMemo(() => {
    const rows = applyFilters(clients, filters);
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = sort.key === "nom" ? a.nom : a[sort.key];
      const vb = sort.key === "nom" ? b.nom : b[sort.key];
      return (va > vb ? 1 : va < vb ? -1 : 0) * dir;
    });
  }, [clients, filters, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => setPage(1), [filters, sort]);
  useEffect(() => setSelected((sel) => sel.filter((id) => clients.some((c) => c.id === id))), [clients]);
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0;

  const today = new Date().toISOString().slice(0, 10);
  const kpis = [
    { label: "Dossiers", value: filtered.length, tone: "from-brand-500 to-indigo-500" },
    { label: "RDV aujourd'hui", value: clients.filter((c) => c.rdv?.slice(0, 10) === today).length, tone: "from-amber-400 to-orange-500" },
    { label: "En att complément", value: counts.att_complement, tone: "from-fuchsia-500 to-purple-600" },
    { label: "Payés", value: counts.paye, tone: "from-emerald-400 to-green-600" },
  ];

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
      <Sidebar filters={filters} setFilters={setFilters} counts={counts} hiddenColumns={hidden} setHiddenColumns={setHidden} />

      <section className="min-w-0 flex-1">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">Dossiers clients</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {filtered.length} dossier{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
              {filtered.length !== clients.length && <span className="text-slate-400"> sur {clients.length}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover
              align="right"
              trigger={({ toggle }) => (
                <Button variant="success" onClick={toggle}>
                  <Menu className="h-4 w-4" /> Menu
                </Button>
              )}
            >
              {(close) => (
                <>
                  <MenuItem icon={<Download />} onClick={() => (exportCsv(selected.length ? clients.filter((c) => selected.includes(c.id)) : filtered), close())}>
                    Exporter en CSV {selected.length ? `(${selected.length})` : ""}
                  </MenuItem>
                  <MenuItem icon={<ListChecks />} onClick={() => (setSelected(filtered.map((c) => c.id)), close())}>
                    Tout sélectionner ({filtered.length})
                  </MenuItem>
                  <MenuItem icon={<Printer />} onClick={() => (window.print(), close())}>
                    Imprimer
                  </MenuItem>
                </>
              )}
            </Popover>
            <Button onClick={() => (setDraft(emptyDraft), setCreating(true))} className="shadow-lg shadow-brand-600/25">
              <UserPlus className="h-4 w-4" /> Nouveau client
            </Button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="relative overflow-hidden px-4 py-3.5">
              <div className={cn("absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-15", k.tone)} />
              <p className="text-xs font-semibold text-slate-500">{k.label}</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">{k.value}</p>
            </Card>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="mb-3 flex animate-fade-in flex-wrap items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-float">
            <span className="font-semibold">{selected.length} sélectionné{selected.length > 1 ? "s" : ""}</span>
            <span className="mx-1 h-4 w-px bg-white/20" />
            <Popover
              trigger={({ toggle }) => (
                <button onClick={toggle} className="rounded-lg px-2.5 py-1 font-medium hover:bg-white/10">
                  Changer le statut
                </button>
              )}
              className="w-64"
            >
              {(close) => (
                <div className="max-h-80 overflow-y-auto">
                  {STATUSES.map((s) => (
                    <MenuItem key={s.id} icon={<StatusDot id={s.id} />} onClick={() => (setStatus(selected, s.id), close())}>
                      {s.label}
                    </MenuItem>
                  ))}
                </div>
              )}
            </Popover>
            <button onClick={() => exportCsv(clients.filter((c) => selected.includes(c.id)))} className="rounded-lg px-2.5 py-1 font-medium hover:bg-white/10">
              Exporter
            </button>
            <button
              onClick={() => confirm(`Supprimer ${selected.length} dossier(s) ?`) && (deleteClients(selected), setSelected([]))}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium text-rose-300 hover:bg-white/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> Supprimer
            </button>
            <button onClick={() => setSelected([])} className="ml-auto rounded-lg p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <SearchX className="h-6 w-6" />
              </div>
              <p className="font-semibold text-slate-700">Aucun dossier ne correspond</p>
              <Button variant="secondary" size="sm" onClick={() => setFilters(emptyFilters)}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <ClientsTable rows={current} selected={selected} setSelected={setSelected} hidden={hidden} sort={sort} setSort={setSort} onOpen={onOpen} />
          )}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            <span>
              Page {page}/{pages} — Lignes {start} à {Math.min(page * PAGE_SIZE, filtered.length)}
            </span>
            <div className="flex gap-1">
              <Button variant="secondary" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8" disabled={page === pages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Nouveau client"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button form="new-client">
              <UserPlus className="h-4 w-4" /> Créer le dossier
            </Button>
          </>
        }
      >
        <form
          id="new-client"
          onSubmit={(e) => {
            e.preventDefault();
            const c = addClient({ ...draft, telephones: draft.telephones.filter((t) => t.trim()) });
            setCreating(false);
            onOpen(c.id);
          }}
        >
          <ClientForm value={draft} onChange={setDraft} />
        </form>
      </Modal>
    </div>
  );
}
