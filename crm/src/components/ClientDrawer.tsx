import { useEffect, useState } from "react";
import { Clock, Mail, MapPin, MessageSquarePlus, Phone, Save, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDateTime, formatRdv, initials } from "@/lib/utils";
import { STATUS_MAP } from "@/data/constants";
import { ClientForm, type ClientDraft } from "./ClientForm";
import { StatusSelect } from "./StatusBadge";
import { Button } from "./ui";

export function ClientDrawer({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { clients, updateClient, deleteClients, addObservation, deleteObservation, setStatus, toast } = useStore();
  const client = clients.find((c) => c.id === id);
  const [tab, setTab] = useState<"suivi" | "infos">("suivi");
  const [draft, setDraft] = useState<ClientDraft | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (client) {
      const { id: _id, createdAt: _c, observations: _o, nrp: _n, ...rest } = client;
      setDraft(rest);
    }
    // on ne réinitialise le brouillon qu'au changement de fiche
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (id === null) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [id, onClose]);

  if (!client || !draft) return null;
  const s = STATUS_MAP[client.statut];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} className="flex h-full w-full max-w-xl animate-slide-in flex-col bg-white shadow-float">
        <div className="relative overflow-hidden border-b border-slate-100 px-6 pb-5 pt-6">
          <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: s.color }} />
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-extrabold text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${s.color}, #1d41d8)` }}>
              {initials(`${client.nom} ${client.prenom}`)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-400">DOSSIER #{client.id} · créé le {new Date(client.createdAt).toLocaleDateString("fr-FR")}</p>
              <h2 className="truncate text-xl font-extrabold text-slate-900">
                {client.civilite} {client.nom} {client.prenom}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusSelect value={client.statut} onChange={(st) => setStatus([client.id], st)} />
                {client.rdv && (
                  <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                    <Clock className="h-3 w-3" /> RDV {formatRdv(client.rdv)}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {client.telephones[0] && (
              <a href={`tel:${client.telephones[0].replace(/\s/g, "")}`} className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                <Phone className="h-3.5 w-3.5" /> Appeler
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(`${client.adresse} ${client.codePostal} ${client.ville}`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              <MapPin className="h-3.5 w-3.5" /> Itinéraire
            </a>
            <span className="ml-auto flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">NRP {client.nrp}</span>
          </div>
          <div className="mt-5 flex gap-1 rounded-xl bg-slate-100 p-1">
            {(["suivi", "infos"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                {t === "suivi" ? `Suivi (${client.observations.length})` : "Informations"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "suivi" ? (
            <div>
              <form
                className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 focus-within:border-brand-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  addObservation(client.id, note.trim());
                  setNote("");
                }}
              >
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Ajouter une observation…"
                  className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <div className="flex justify-end">
                  <Button size="sm" disabled={!note.trim()}>
                    <MessageSquarePlus className="h-3.5 w-3.5" /> Ajouter
                  </Button>
                </div>
              </form>
              {client.observations.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Aucune observation pour ce dossier.</p>}
              <ol className="relative ml-2 border-l-2 border-slate-100">
                {[...client.observations].reverse().map((o) => (
                  <li key={o.id} className="group relative mb-5 pl-6">
                    <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500 ring-2 ring-brand-100" />
                    <p className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-600">{o.auteur}</span> · {formatDateTime(o.date)}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-800">{o.texte}</p>
                    <button
                      onClick={() => deleteObservation(client.id, o.id)}
                      className="absolute right-0 top-0 rounded-lg p-1 text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <form
              id="client-edit"
              onSubmit={(e) => {
                e.preventDefault();
                updateClient(client.id, { ...draft, telephones: draft.telephones.filter((t) => t.trim()) });
                toast("Fiche enregistrée");
              }}
            >
              <ClientForm value={draft} onChange={setDraft} />
            </form>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 px-6 py-4">
          <Button
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50"
            onClick={() => {
              if (confirm(`Supprimer le dossier #${client.id} ?`)) {
                deleteClients([client.id]);
                onClose();
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </Button>
          {tab === "infos" && (
            <Button form="client-edit" className="ml-auto">
              <Save className="h-4 w-4" /> Enregistrer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
