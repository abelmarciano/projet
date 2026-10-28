import { COMMERCIAUX, EQUIPES, PAIEMENTS, PRODUITS, STATUSES } from "@/data/constants";
import type { Client, StatusId } from "@/data/types";
import { cn, toDateInput } from "@/lib/utils";
import { Input, Label, Select } from "./ui";

export type ClientDraft = Omit<Client, "id" | "createdAt" | "observations" | "nrp">;

export const emptyDraft: ClientDraft = {
  civilite: "M.",
  nom: "",
  prenom: "",
  telephones: [""],
  email: "",
  adresse: "",
  codePostal: "",
  ville: "",
  equipe: EQUIPES[0],
  commercial: COMMERCIAUX[0],
  statut: "aucun",
  paiement: PAIEMENTS[0],
  produits: [],
  rdv: undefined,
};

export function ClientForm({ value, onChange }: { value: ClientDraft; onChange: (v: ClientDraft) => void }) {
  const set = (patch: Partial<ClientDraft>) => onChange({ ...value, ...patch });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <div className="sm:col-span-2">
        <Label>Civilité</Label>
        <Select value={value.civilite} onChange={(e) => set({ civilite: e.target.value as ClientDraft["civilite"] })}>
          <option>M.</option>
          <option>Mme</option>
          <option>M. et Mme</option>
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Label>Nom *</Label>
        <Input required value={value.nom} onChange={(e) => set({ nom: e.target.value.toUpperCase() })} placeholder="DUPONT" />
      </div>
      <div className="sm:col-span-2">
        <Label>Prénom</Label>
        <Input value={value.prenom} onChange={(e) => set({ prenom: e.target.value.toUpperCase() })} placeholder="MARTIN" />
      </div>
      <div className="sm:col-span-3">
        <Label>Téléphone(s)</Label>
        <div className="flex flex-col gap-2">
          {value.telephones.map((t, i) => (
            <Input
              key={i}
              value={t}
              type="tel"
              onChange={(e) => set({ telephones: value.telephones.map((x, j) => (j === i ? e.target.value : x)) })}
              placeholder="06 12 34 56 78"
            />
          ))}
          {value.telephones.length < 3 && (
            <button type="button" onClick={() => set({ telephones: [...value.telephones, ""] })} className="self-start text-xs font-semibold text-brand-600 hover:underline">
              + Ajouter un numéro
            </button>
          )}
        </div>
      </div>
      <div className="sm:col-span-3">
        <Label>Email</Label>
        <Input type="email" value={value.email} onChange={(e) => set({ email: e.target.value })} placeholder="martin.dupont@gmail.com" />
      </div>
      <div className="sm:col-span-6">
        <Label>Adresse</Label>
        <Input value={value.adresse} onChange={(e) => set({ adresse: e.target.value.toUpperCase() })} placeholder="12 RUE DES TILLEULS" />
      </div>
      <div className="sm:col-span-2">
        <Label>Code postal</Label>
        <Input value={value.codePostal} inputMode="numeric" maxLength={5} onChange={(e) => set({ codePostal: e.target.value })} placeholder="85000" />
      </div>
      <div className="sm:col-span-4">
        <Label>Ville</Label>
        <Input value={value.ville} onChange={(e) => set({ ville: e.target.value.toUpperCase() })} placeholder="LA ROCHE-SUR-YON" />
      </div>
      <div className="sm:col-span-3">
        <Label>Équipe</Label>
        <Select value={value.equipe} onChange={(e) => set({ equipe: e.target.value })}>
          {EQUIPES.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-3">
        <Label>Commercial</Label>
        <Select value={value.commercial} onChange={(e) => set({ commercial: e.target.value })}>
          {COMMERCIAUX.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-3">
        <Label>Statut</Label>
        <Select value={value.statut} onChange={(e) => set({ statut: e.target.value as StatusId })}>
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-3">
        <Label>Type de paiement</Label>
        <Select value={value.paiement} onChange={(e) => set({ paiement: e.target.value })}>
          {PAIEMENTS.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-6">
        <Label>Produits</Label>
        <div className="flex flex-wrap gap-2">
          {PRODUITS.map((p) => {
            const on = value.produits.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => set({ produits: on ? value.produits.filter((x) => x !== p) : [...value.produits, p] })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-brand-300",
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>
      <div className="sm:col-span-6">
        <Label>Rendez-vous</Label>
        <Input type="datetime-local" value={toDateInput(value.rdv)} onChange={(e) => set({ rdv: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
      </div>
    </div>
  );
}
