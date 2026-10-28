import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { emptyFilters, type Client, type Observation, type Preset, type StatusId } from "@/data/types";
import { buildSeed } from "@/data/seed";
import { CURRENT_USER, STATUS_MAP } from "@/data/constants";
import { uid } from "./utils";

export interface Notification {
  id: string;
  date: string;
  texte: string;
  clientId?: number;
  lu: boolean;
}

interface Toast {
  id: string;
  texte: string;
}

interface Store {
  clients: Client[];
  presets: Preset[];
  notifications: Notification[];
  toasts: Toast[];
  addClient: (c: Omit<Client, "id" | "createdAt" | "observations" | "nrp">) => Client;
  updateClient: (id: number, patch: Partial<Client>) => void;
  deleteClients: (ids: number[]) => void;
  setStatus: (ids: number[], statut: StatusId) => void;
  addObservation: (id: number, texte: string) => void;
  deleteObservation: (id: number, obsId: string) => void;
  savePreset: (p: Omit<Preset, "id">) => void;
  deletePreset: (id: string) => void;
  markNotificationsRead: () => void;
  toast: (texte: string) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);

function load<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* stockage indisponible */
  }
  return fallback();
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() => load("crm.clients", buildSeed));
  const [presets, setPresets] = useState<Preset[]>(() =>
    load("crm.presets", () => [
      { id: "p1", name: "Compléments à relancer", filters: { ...emptyFilters, statuts: ["att_complement"] } },
      { id: "p2", name: "Financement en cours", filters: { ...emptyFilters, statuts: ["envoye_financement", "renvoyer_banque"] } },
    ]),
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    load("crm.notifications", () => [
      { id: uid(), date: new Date().toISOString(), texte: "Bienvenue sur NoreaCRM 👋", lu: false },
    ]),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => persist("crm.clients", clients), [clients]);
  useEffect(() => persist("crm.presets", presets), [presets]);
  useEffect(() => persist("crm.notifications", notifications), [notifications]);

  const toast = useCallback((texte: string) => {
    const id = uid();
    setToasts((t) => [...t, { id, texte }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const notify = useCallback((texte: string, clientId?: number) => {
    setNotifications((n) => [{ id: uid(), date: new Date().toISOString(), texte, clientId, lu: false }, ...n].slice(0, 30));
  }, []);

  const store = useMemo<Store>(
    () => ({
      clients,
      presets,
      notifications,
      toasts,
      toast,
      addClient: (c) => {
        const id = Math.max(0, ...clients.map((x) => x.id)) + 1;
        const client: Client = { ...c, id, createdAt: new Date().toISOString(), observations: [], nrp: 0 };
        setClients((cs) => [client, ...cs]);
        notify(`Nouveau dossier #${id} — ${c.civilite} ${c.nom}`, id);
        toast("Client créé");
        return client;
      },
      updateClient: (id, patch) => setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      deleteClients: (ids) => {
        setClients((cs) => cs.filter((c) => !ids.includes(c.id)));
        toast(ids.length > 1 ? `${ids.length} dossiers supprimés` : "Dossier supprimé");
      },
      setStatus: (ids, statut) => {
        setClients((cs) => cs.map((c) => (ids.includes(c.id) ? { ...c, statut } : c)));
        ids.forEach((id) => notify(`Dossier #${id} → ${STATUS_MAP[statut].label}`, id));
        toast(`Statut mis à jour : ${STATUS_MAP[statut].label}`);
      },
      addObservation: (id, texte) => {
        const obs: Observation = { id: uid(), date: new Date().toISOString(), auteur: CURRENT_USER, texte };
        setClients((cs) => cs.map((c) => (c.id === id ? { ...c, observations: [...c.observations, obs] } : c)));
      },
      deleteObservation: (id, obsId) =>
        setClients((cs) =>
          cs.map((c) => (c.id === id ? { ...c, observations: c.observations.filter((o) => o.id !== obsId) } : c)),
        ),
      savePreset: (p) => {
        setPresets((ps) => [...ps, { ...p, id: uid() }]);
        toast("Présélection enregistrée");
      },
      deletePreset: (id) => setPresets((ps) => ps.filter((p) => p.id !== id)),
      markNotificationsRead: () => setNotifications((n) => n.map((x) => ({ ...x, lu: true }))),
      resetDemo: () => {
        setClients(buildSeed());
        toast("Données de démo restaurées");
      },
    }),
    [clients, presets, notifications, toasts, toast, notify],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore doit être utilisé dans <StoreProvider>");
  return s;
}
