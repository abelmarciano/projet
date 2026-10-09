import { useState } from "react";
import { Link, useRouter, useHydrated } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown, Check, Plus, Settings, CreditCard, HelpCircle, LogOut, Loader2,
  Building2,
} from "lucide-react";

function brandInitials(name?: string | null) {
  if (!name) return "M";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useMyWorkspaces, useCurrentWorkspace, useSwitchWorkspace } from "@/hooks/useWorkspaces";
import { createWorkspace } from "@/lib/workspaces.functions";
import { useBrands, useCurrentBrand, useSetActiveBrand } from "@/hooks/useBrands";
import { createBrand } from "@/lib/brands.functions";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function initialsOf(name?: string | null) {
  return (name ?? "W").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function WorkspaceBrandCard({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: workspaces } = useMyWorkspaces();
  const hydrated = useHydrated();
  const { data: currentWsRaw } = useCurrentWorkspace();
  const currentWs = hydrated ? currentWsRaw : undefined;
  const switchWs = useSwitchWorkspace();
  const createWsFn = useServerFn(createWorkspace);

  const { data: brands } = useBrands();
  const { data: currentBrandRaw } = useCurrentBrand();
  const currentBrand = hydrated ? currentBrandRaw : undefined;
  const setActiveBrand = useSetActiveBrand();
  const createBrandFn = useServerFn(createBrand);

  const [wsDialog, setWsDialog] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsCreating, setWsCreating] = useState(false);

  const [brDialog, setBrDialog] = useState(false);
  const [brName, setBrName] = useState("");
  const [brSite, setBrSite] = useState("");
  const [brCreating, setBrCreating] = useState(false);

  const wsInitials = initialsOf(currentWs?.name);

  const doCreateWs = async () => {
    if (!wsName.trim()) return;
    setWsCreating(true);
    try {
      await createWsFn({ data: { name: wsName.trim() } });
      qc.clear(); await router.invalidate();
      toast.success("Workspace créé"); setWsDialog(false); setWsName("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setWsCreating(false); }
  };
  const doCreateBrand = async () => {
    if (!brName.trim()) return;
    setBrCreating(true);
    try {
      await createBrandFn({ data: { name: brName.trim(), website: brSite.trim() || null } });
      qc.clear();
      toast.success("Marque créée"); setBrDialog(false); setBrName(""); setBrSite("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
    finally { setBrCreating(false); }
  };
  const signOut = async () => { await supabase.auth.signOut(); router.navigate({ to: "/auth" }); };

  // Même déclencheur ouvert ou replié (le CSS gx- gère le replié) : il ouvre le menu combiné complet
  // (workspaces, marques, Nouvelle marque, Gérer les marques, Paramètres, Facturation, Centre d'aide, Déconnexion).
  // Carte de la maquette : marque active en gras, puis « Workspace · N marques ».
  // Le menu combiné (workspaces, marques, paramètres, déconnexion) reste identique.
  const brandCount = brands?.length ?? 0;
  const title = currentBrand?.name ?? currentWs?.name ?? "Workspace";
  const logo = currentBrand?.logo_url ?? (currentBrand ? null : currentWs?.logo_url);
  const trigger = (
    <DropdownMenuTrigger asChild>
      <button type="button" className="gx-wsbtn" aria-label={`Workspace ${currentWs?.name ?? ""} · marque ${currentBrand?.name ?? "aucune"}`}>
        <span className="gx-bm">
          {logo ? <img src={logo} alt="" /> : currentBrand ? brandInitials(currentBrand.name).slice(0, 1) : wsInitials}
        </span>
        <span className="gx-wst">
          <b>{title}</b>
          <small>{currentWs?.name ?? "Workspace"} · {brandCount} marque{brandCount > 1 ? "s" : ""}</small>
        </span>
        <ChevronDown className="gx-i" aria-hidden />
      </button>
    </DropdownMenuTrigger>
  );

  return (
    <>
      <DropdownMenu>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent side="right">{currentWs?.name ?? "Workspace"} · {currentBrand?.name ?? "Marque"}</TooltipContent>
          </Tooltip>
        ) : trigger}
        <CombinedMenuContent
          workspaces={workspaces} currentWsId={currentWs?.id} onSwitchWs={switchWs}
          onCreateWs={() => setWsDialog(true)} onSignOut={signOut}
          brands={brands} currentBrandId={currentBrand?.id}
          onSwitchBrand={setActiveBrand} onCreateBrand={() => setBrDialog(true)}
        />
      </DropdownMenu>
      <CreateDialogs
        wsDialog={wsDialog} setWsDialog={setWsDialog} wsName={wsName} setWsName={setWsName}
        wsCreating={wsCreating} doCreateWs={doCreateWs}
        brDialog={brDialog} setBrDialog={setBrDialog} brName={brName} setBrName={setBrName}
        brSite={brSite} setBrSite={setBrSite} brCreating={brCreating} doCreateBrand={doCreateBrand}
      />
    </>
  );
}

function CombinedMenuContent(p: {
  workspaces?: WsRow[]; currentWsId?: string; onSwitchWs: (id: string) => void;
  onCreateWs: () => void; onSignOut: () => void;
  brands?: BrandRow[]; currentBrandId?: string;
  onSwitchBrand: (id: string) => void; onCreateBrand: () => void;
}) {
  return (
    <DropdownMenuContent align="start" side="right" className="w-64">
      <DropdownMenuLabel className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
        Workspaces
      </DropdownMenuLabel>
      {(p.workspaces ?? []).map((w) => (
        <DropdownMenuItem key={w.id} onClick={() => w.id !== p.currentWsId && p.onSwitchWs(w.id)}
          className="flex items-center gap-2">
          <div className="bg-accent flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded">
            {w.logo_url
              ? <img src={w.logo_url} alt="" className="h-full w-full object-cover" />
              : <Building2 className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          <span className="flex-1 truncate">{w.name}</span>
          {w.id === p.currentWsId && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); p.onCreateWs(); }}>
        <Plus className="mr-2 h-4 w-4" />Créer un workspace
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
        Marques
      </DropdownMenuLabel>
      {(p.brands ?? []).map((b) => (
        <DropdownMenuItem key={b.id} onClick={() => b.id !== p.currentBrandId && p.onSwitchBrand(b.id)}
          className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
            {b.logo_url
              ? <img src={b.logo_url} alt="" className="h-full w-full object-cover" />
              : <span className="text-[9px] font-semibold text-muted-foreground">{brandInitials(b.name)}</span>}
          </div>
          <span className="flex-1 truncate">{b.name}</span>
          {b.id === p.currentBrandId && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); p.onCreateBrand(); }}>
        <Plus className="mr-2 h-4 w-4" />Nouvelle marque
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/parametres/marques"><Settings className="mr-2 h-4 w-4" />Gérer les marques</Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/parametres/profil"><Settings className="mr-2 h-4 w-4" />Paramètres</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/parametres/facturation"><CreditCard className="mr-2 h-4 w-4" />Facturation</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/aide"><HelpCircle className="mr-2 h-4 w-4" />Centre d'aide</Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={p.onSignOut} className="text-destructive focus:text-destructive">
        <LogOut className="mr-2 h-4 w-4" />Déconnexion
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

type WsRow = { id: string; name: string; logo_url?: string | null; plan?: string | null };
type BrandRow = { id: string; name: string; logo_url?: string | null };

function CreateDialogs(p: {
  wsDialog: boolean; setWsDialog: (v: boolean) => void; wsName: string; setWsName: (v: string) => void;
  wsCreating: boolean; doCreateWs: () => void;
  brDialog: boolean; setBrDialog: (v: boolean) => void; brName: string; setBrName: (v: string) => void;
  brSite: string; setBrSite: (v: string) => void; brCreating: boolean; doCreateBrand: () => void;
}) {
  return (
    <>
      <Dialog open={p.wsDialog} onOpenChange={p.setWsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un workspace</DialogTitle>
            <DialogDescription>Regroupez vos campagnes, produits et membres d'équipe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="wsname">Nom</Label>
            <Input id="wsname" autoFocus value={p.wsName} onChange={(e) => p.setWsName(e.target.value)}
              placeholder="Mon agence" onKeyDown={(e) => e.key === "Enter" && p.doCreateWs()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => p.setWsDialog(false)}>Annuler</Button>
            <Button onClick={p.doCreateWs} disabled={p.wsCreating || !p.wsName.trim()}>
              {p.wsCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={p.brDialog} onOpenChange={p.setBrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle marque</DialogTitle>
            <DialogDescription>Une marque représente une entreprise/client dans ce workspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bname">Nom de la marque</Label>
              <Input id="bname" autoFocus value={p.brName} onChange={(e) => p.setBrName(e.target.value)} placeholder="Ma Marque" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bsite">Site web (optionnel)</Label>
              <Input id="bsite" value={p.brSite} onChange={(e) => p.setBrSite(e.target.value)} placeholder="exemple.fr" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => p.setBrDialog(false)}>Annuler</Button>
            <Button onClick={p.doCreateBrand} disabled={p.brCreating || !p.brName.trim()}
              className="bg-grad text-white hover:opacity-90">
              {p.brCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
