import { useMemo, useState } from "react";
import { Check, ArrowRight } from "@/components/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { STATUS_LABELS_FR, type SelectionStatus } from "@/lib/chat/selection";

export type PickerItem = {
  id: string;
  name: string;
  status?: SelectionStatus | string;
  subtitle?: string;
};

export type PickerSelection = {
  mode?: "single" | "multiple";
  max?: number | null;
  preselectedIds?: string[];
  resolved?: boolean;
  shortfall?: number;
  defaultStatusApplied?: string[] | null;
};

/** Pastille de statut console (gx-st) : vert actif, gris en pause, orange en attente, rouge en erreur. */
const TONE: Record<string, string> = {
  active: "gx-on",
  paused: "gx-off",
  archived: "gx-off",
  draft: "gx-off",
  ready: "gx-rev",
  pending: "gx-rev",
  error: "gx-bad",
};

/**
 * Sélecteur générique du chat : choix unique (clic = envoi) ou multiple
 * (cases à cocher, tout sélectionner, compteur, validation), avec
 * interrupteur pour révéler les éléments masqués par le filtre par défaut.
 */
export function SelectionPicker({
  title,
  items,
  hiddenItems = [],
  selection,
  noun,
  onConfirm,
}: {
  title: string;
  items: PickerItem[];
  hiddenItems?: PickerItem[];
  selection?: PickerSelection;
  /** Nom au pluriel pour le compteur, ex. « campagnes ». */
  noun: string;
  onConfirm: (picked: PickerItem[]) => void;
}) {
  const multiple = selection?.mode === "multiple";
  const max = multiple ? (selection?.max ?? null) : 1;
  const [showHidden, setShowHidden] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(selection?.preselectedIds ?? []));
  const [submitted, setSubmitted] = useState(false);
  const list = useMemo(() => (showHidden ? [...items, ...hiddenItems] : items), [items, hiddenItems, showHidden]);

  if (list.length === 0 && hiddenItems.length === 0) {
    // Liste vide ou recherche en cours : on n'affiche rien, la réponse du chat explique.
    return null;
  }

  const toggle = (id: string) => {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (max !== null && next.size >= max) return prev;
        next.add(id);
      }
      return next;
    });
  };
  const limitTarget = max === null ? list.length : Math.min(max, list.length);
  const allSelected = selected.size > 0 && selected.size >= limitTarget;
  const toggleAll = () => {
    if (submitted) return;
    setSelected(allSelected ? new Set() : new Set(list.slice(0, limitTarget).map((i) => i.id)));
  };
  const confirm = (ids: Set<string>) => {
    const picked = list.filter((i) => ids.has(i.id));
    if (!picked.length) return;
    setSubmitted(true);
    onConfirm(picked);
  };
  const counterTotal = max ?? list.length;

  return (
    <div className="gx-kard gx-spk">
      <div className="gx-spk-h">
        <b>{title}</b>
        {hiddenItems.length > 0 && (
          <label className="gx-spk-sw">
            <Switch checked={showHidden} onCheckedChange={setShowHidden} disabled={submitted} />
            Inclure les autres ({hiddenItems.length})
          </label>
        )}
      </div>
      {multiple && (
        <div className="gx-spk-bar">
          <button type="button" className="gx-btn gx-sm gx-ghost gx-spk-all" onClick={toggleAll} disabled={submitted}>
            {allSelected ? "Tout désélectionner" : max !== null && max < list.length ? `Sélectionner ${max}` : "Tout sélectionner"}
          </button>
          <span className="gx-num">
            {selected.size}/{counterTotal} {noun} sélectionnée{selected.size > 1 ? "s" : ""}
          </span>
        </div>
      )}
      <div className="gx-spk-l">
        {list.map((it) => {
          const isSel = selected.has(it.id);
          const full = multiple && max !== null && selected.size >= max && !isSel;
          const status = it.status ? String(it.status) : null;
          return (
            <button
              key={it.id}
              type="button"
              disabled={submitted || full}
              aria-pressed={multiple ? isSel : undefined}
              onClick={() => (multiple ? toggle(it.id) : confirm(new Set([it.id])))}
              className={`gx-spk-r${isSel ? " gx-on" : ""}${(submitted && !isSel) || full ? " gx-faded" : ""}`}
            >
              {multiple && <Checkbox checked={isSel} className="pointer-events-none" aria-hidden />}
              <span className="gx-spk-t">
                <b>{it.name}</b>
                <small>
                  {status && (
                    <span className={`gx-st ${TONE[status] ?? "gx-off"}`}>
                      {STATUS_LABELS_FR[status as SelectionStatus] ?? status}
                    </span>
                  )}
                  {it.subtitle && <span className="gx-spk-sub">{it.subtitle}</span>}
                </small>
              </span>
              {!multiple && (isSel ? <Check className="gx-i gx-spk-ok" /> : <ArrowRight className="gx-i gx-spk-go" />)}
            </button>
          );
        })}
      </div>
      {multiple && (
        <div className="gx-kf gx-spk-f">
          <button type="button" className="gx-btn gx-sm gx-pri" onClick={() => confirm(selected)} disabled={submitted || selected.size === 0}>
            <Check className="gx-i" /> {submitted ? "Validé" : `Valider (${selected.size})`}
          </button>
        </div>
      )}
    </div>
  );
}
