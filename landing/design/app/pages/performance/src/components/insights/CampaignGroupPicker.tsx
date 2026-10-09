import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { FolderPlus, Pencil, Save, Trash2 } from "lucide-react";
import { GxButton as Button, GxInput as Input, GxSelectTrigger as SelectTrigger } from "@/components/ui/gx-controls";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  createCampaignGroup, deleteCampaignGroup, listCampaignGroups, renameCampaignGroup, setCampaignGroupItems,
  type CampaignGroup,
} from "@/lib/campaign-groups.functions";

export type GroupItem = { campaignId: string; accountId?: string | null; name?: string | null };

/**
 * Sélecteur de groupes de campagnes (partagés avec l'équipe du workspace).
 * `value` vaut "all" ou l'id d'un groupe. Habillage gx (maquette Performance).
 */
export function CampaignGroupPicker({
  value, onChange, selection, allCampaigns = [], onGroupsLoaded,
}: {
  value: string;
  onChange: (groupId: string, campaignIds: string[] | null) => void;
  /** Campagnes actuellement cochées, utilisées pour créer / mettre à jour un groupe. */
  selection: GroupItem[];
  /** Toutes les campagnes du compte : permet d'en AJOUTER à un groupe existant. */
  allCampaigns?: GroupItem[];
  onGroupsLoaded?: (groups: CampaignGroup[]) => void;
}) {
  const qc = useQueryClient();
  const fetchGroups = useServerFn(listCampaignGroups);
  const createFn = useServerFn(createCampaignGroup);
  const renameFn = useServerFn(renameCampaignGroup);
  const setItemsFn = useServerFn(setCampaignGroupItems);
  const deleteFn = useServerFn(deleteCampaignGroup);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"create" | "rename">("create");
  const [editOpen, setEditOpen] = useState(false);
  const [editIds, setEditIds] = useState<Set<string>>(new Set());

  const groupsQuery = useQuery({
    queryKey: ["campaign-groups"],
    queryFn: async () => {
      const g = await fetchGroups({});
      onGroupsLoaded?.(g);
      return g;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const groups = groupsQuery.data ?? [];
  const activeGroup = groups.find((g) => g.id === value) ?? null;
  const invalidate = () => qc.invalidateQueries({ queryKey: ["campaign-groups"] });

  const createMut = useMutation({
    mutationFn: (n: string) => createFn({ data: { name: n, items: selection } }),
    onSuccess: async (res: any) => {
      await invalidate();
      setOpen(false);
      setName("");
      onChange(res.id, selection.map((s) => s.campaignId));
      toast.success("Groupe créé");
    },
    onError: (e: any) => toast.error(e?.message ?? "Impossible de créer le groupe"),
  });

  const renameMut = useMutation({
    mutationFn: (n: string) => renameFn({ data: { id: value, name: n } }),
    onSuccess: async () => { await invalidate(); setOpen(false); toast.success("Groupe renommé"); },
    onError: (e: any) => toast.error(e?.message ?? "Impossible de renommer le groupe"),
  });

  // Composition du groupe : on part de TOUTES les campagnes disponibles, pas
  // seulement de celles déjà filtrées par le groupe — sinon un groupe ne peut
  // que rétrécir et on ne peut jamais lui ajouter une campagne.
  const pickerCampaigns: GroupItem[] = (() => {
    const seen = new Map<string, GroupItem>();
    for (const c of [...allCampaigns, ...selection]) if (!seen.has(c.campaignId)) seen.set(c.campaignId, c);
    for (const id of activeGroup?.campaignIds ?? []) if (!seen.has(id)) seen.set(id, { campaignId: id, name: id });
    return [...seen.values()];
  })();

  const openEdit = () => {
    setEditIds(new Set(activeGroup?.campaignIds ?? selection.map((s) => s.campaignId)));
    setEditOpen(true);
  };

  const updateMut = useMutation({
    mutationFn: () =>
      setItemsFn({ data: { id: value, items: pickerCampaigns.filter((c) => editIds.has(c.campaignId)) } }),
    onSuccess: async () => {
      await invalidate();
      setEditOpen(false);
      onChange(value, [...editIds]);
      toast.success("Groupe mis à jour");
    },
    onError: (e: any) => toast.error(e?.message ?? "Impossible de mettre à jour le groupe"),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteFn({ data: { id: value } }),
    onSuccess: async () => { await invalidate(); onChange("all", null); toast.success("Groupe supprimé"); },
    onError: (e: any) => toast.error(e?.message ?? "Impossible de supprimer le groupe"),
  });

  return (
    <div className="gx-row">
      <Select
        value={value}
        onValueChange={(v) => {
          if (v === "all") return onChange("all", null);
          const g = groups.find((x) => x.id === v);
          onChange(v, g ? g.campaignIds : []);
        }}
      >
        <SelectTrigger className={value !== "all" ? "gx-set" : undefined} aria-label="Groupe de campagnes"><SelectValue placeholder="Groupe" /></SelectTrigger>
        <SelectContent className="console-app-portal">
          <SelectItem value="all">Toutes les campagnes</SelectItem>
          {groups.map((g) => (
            <SelectItem key={g.id} value={g.id}>{g.name} ({g.campaignIds.length})</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeGroup ? (
        <>
          <Button
            variant="outline" size="icon" title="Modifier les campagnes du groupe" aria-label="Modifier les campagnes du groupe"
            disabled={updateMut.isPending} onClick={openEdit}
          >
            <Save className="gx-i" />
          </Button>
          <Button
            variant="outline" size="icon" title="Renommer le groupe" aria-label="Renommer le groupe"
            onClick={() => { setMode("rename"); setName(activeGroup.name); setOpen(true); }}
          >
            <Pencil className="gx-i" />
          </Button>
          <Button
            variant="outline" size="icon" title="Supprimer le groupe" aria-label="Supprimer le groupe"
            disabled={deleteMut.isPending} onClick={() => deleteMut.mutate()}
          >
            <Trash2 className="gx-i" />
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          disabled={selection.length === 0}
          title="Créer un groupe avec les campagnes cochées"
          onClick={() => { setMode("create"); setName(""); setOpen(true); }}
        >
          <FolderPlus className="gx-i" /> Nouveau groupe
        </Button>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="console-app-portal sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Campagnes du groupe</DialogTitle>
            <DialogDescription>
              Coche les campagnes à inclure. Tu peux en ajouter ou en retirer à tout moment.
            </DialogDescription>
          </DialogHeader>
          <div className="gx-angles max-h-[50vh] overflow-y-auto pr-1">
            {pickerCampaigns.length === 0 ? (
              <p className="gx-hint">Aucune campagne disponible.</p>
            ) : pickerCampaigns.map((c) => (
              <label key={c.campaignId} className="gx-ang">
                <input
                  type="checkbox"
                  checked={editIds.has(c.campaignId)}
                  onChange={() => setEditIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(c.campaignId)) next.delete(c.campaignId); else next.add(c.campaignId);
                    return next;
                  })}
                />
                <span className="truncate">{c.name ?? c.campaignId}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button disabled={updateMut.isPending} onClick={() => updateMut.mutate()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="console-app-portal sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Nouveau groupe de campagnes" : "Renommer le groupe"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? `Le groupe contiendra les ${selection.length} campagne(s) cochées. Il sera visible par toute ton équipe.`
                : "Le nouveau nom sera visible par toute ton équipe."}
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus placeholder="Ex. Marque · Acquisition" value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) (mode === "create" ? createMut : renameMut).mutate(name.trim()); }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button
              disabled={!name.trim() || createMut.isPending || renameMut.isPending}
              onClick={() => (mode === "create" ? createMut : renameMut).mutate(name.trim())}
            >
              {mode === "create" ? "Créer le groupe" : "Renommer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
