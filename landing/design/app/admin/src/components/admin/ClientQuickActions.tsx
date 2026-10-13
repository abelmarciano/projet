import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  listPlansAdmin,
  adminSetWorkspacePlan,
  adminAdjustCredits,
  adminNotifyWorkspace,
} from "@/lib/admin/functions";
import { fmtInt } from "./adminFormat";

type Tab = "plan" | "credits" | "notify";

/** Actions directes sur un client, dans un panneau latéral : changer de plan, ajuster les crédits, notifier les membres. */
export function ClientQuickActions({ workspaceId, workspaceName, isSuper, currentPlan, membersCount }: {
  workspaceId: string;
  workspaceName?: string;
  isSuper: boolean;
  currentPlan?: string | null;
  membersCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(isSuper ? "plan" : "notify");
  const [busy, setBusy] = useState(false);
  const [planCode, setPlanCode] = useState("");
  const [planReason, setPlanReason] = useState("");
  const [amount, setAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const qc = useQueryClient();

  const fetchPlans = useServerFn(listPlansAdmin);
  const setPlan = useServerFn(adminSetWorkspacePlan);
  const adjust = useServerFn(adminAdjustCredits);
  const notify = useServerFn(adminNotifyWorkspace);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => fetchPlans(),
    enabled: open && isSuper,
    staleTime: 300_000,
  });

  const refresh = () => Promise.all([
    qc.invalidateQueries({ queryKey: ["admin-ws", workspaceId] }),
    qc.invalidateQueries({ queryKey: ["admin-ws-timeline", workspaceId] }),
  ]);

  const run = async (fn: () => Promise<unknown>, ok: string, reset: () => void) => {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      reset();
      await refresh();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    } finally {
      setBusy(false);
    }
  };

  const cur = (currentPlan ?? "").toLowerCase();
  const amountN = Number(amount);

  const submit = () => {
    if (tab === "plan") {
      if (!planCode) return;
      void run(() => setPlan({ data: { workspaceId, planCode, reason: planReason.trim() || null } }), "Plan mis à jour", () => { setPlanCode(""); setPlanReason(""); });
    } else if (tab === "credits") {
      if (!amount || !Number.isFinite(amountN) || amountN === 0) return;
      void run(() => adjust({ data: { workspaceId, amount: amountN, reason: creditReason.trim() || null } }), "Crédits ajustés", () => { setAmount(""); setCreditReason(""); });
    } else {
      if (!title.trim()) return;
      void run(() => notify({ data: { workspaceId, title: title.trim(), body: body.trim() || null, linkTo: null } }), "Notification envoyée", () => { setTitle(""); setBody(""); });
    }
  };

  const canSubmit = tab === "plan" ? !!planCode && planCode !== cur
    : tab === "credits" ? !!amount && Number.isFinite(amountN) && amountN !== 0
    : !!title.trim();
  const cta = tab === "plan" ? "Appliquer le plan" : tab === "credits" ? (amountN < 0 ? "Retirer les crédits" : "Ajouter les crédits") : "Envoyer aux membres";

  return (
    <>
      <button type="button" className="ad-btn pri" onClick={() => setOpen(true)}>
        <Zap className="ad-i" aria-hidden /> Actions
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="ad-sheet">
          <div className="ad-sh-h">
            <SheetTitle asChild><h2>Actions sur {workspaceName ?? "ce client"}</h2></SheetTitle>
            <SheetDescription asChild><p>Chaque action est enregistrée dans le journal d'audit.</p></SheetDescription>
          </div>
          <div className="ad-sh-tabs" role="group" aria-label="Type d'action">
            {isSuper && <button type="button" aria-pressed={tab === "plan"} onClick={() => setTab("plan")}>Plan</button>}
            {isSuper && <button type="button" aria-pressed={tab === "credits"} onClick={() => setTab("credits")}>Crédits</button>}
            <button type="button" aria-pressed={tab === "notify"} onClick={() => setTab("notify")}>Notification</button>
          </div>

          <div className="ad-sh-b">
            {tab === "plan" && (
              <>
                {currentPlan ? <span className="ad-cur">Plan actuel : <b>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</b></span> : null}
                {plansLoading ? (
                  <div style={{ display: "grid", placeItems: "center", padding: 24 }}><Loader2 className="h-5 w-5 animate-spin" aria-label="Chargement" /></div>
                ) : (
                  <div className="ad-optl">
                    {(plans ?? []).map((p) => (
                      <button key={p.code} type="button" className="ad-opt" aria-pressed={planCode === p.code} onClick={() => setPlanCode(p.code)}>
                        <span>
                          <b>{p.name}{p.code.toLowerCase() === cur && <span className="ad-now">actuel</span>}</b>
                          <small>{fmtInt(p.monthlyCredits)} crédits / mois</small>
                        </span>
                        {/* Les prix sont saisis en euros dans la grille tarifaire (champ historique price_usd_cents). */}
                        <span className="ad-pr">{fmtInt(Math.round(p.priceUsdCents / 100))} €<small>/ mois</small></span>
                      </button>
                    ))}
                  </div>
                )}
                <div>
                  <label className="ad-l" htmlFor="qa-plan-reason">Motif <span>(facultatif)</span></label>
                  <Input id="qa-plan-reason" placeholder="Ex. geste commercial" value={planReason} onChange={(e) => setPlanReason(e.target.value)} />
                </div>
              </>
            )}

            {tab === "credits" && (
              <>
                <div>
                  <label className="ad-l" htmlFor="qa-amount">Nombre de crédits</label>
                  <Input id="qa-amount" type="number" inputMode="numeric" placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <span className="ad-hint">Mets un nombre négatif pour retirer des crédits.</span>
                </div>
                <div>
                  <label className="ad-l" htmlFor="qa-credit-reason">Motif <span>(facultatif)</span></label>
                  <Input id="qa-credit-reason" placeholder="Ex. génération ratée remboursée" value={creditReason} onChange={(e) => setCreditReason(e.target.value)} />
                </div>
              </>
            )}

            {tab === "notify" && (
              <>
                <div>
                  <label className="ad-l" htmlFor="qa-title">Titre</label>
                  <Input id="qa-title" placeholder="Ex. Ta pub est prête" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="ad-l" htmlFor="qa-body">Message <span>(facultatif)</span></label>
                  <Textarea id="qa-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
                  <span className="ad-hint">
                    Envoyée dans la cloche {membersCount ? `des ${membersCount} membre${membersCount > 1 ? "s" : ""}` : "des membres"} de ce workspace.
                  </span>
                </div>
              </>
            )}
            {!isSuper && <div className="ad-locked">Le changement de plan et l'ajustement des crédits sont réservés aux super-admins.</div>}
          </div>

          <div className="ad-sh-f">
            <button type="button" className="ad-btn" onClick={() => setOpen(false)}>Fermer</button>
            <button type="button" className="ad-btn pri" disabled={busy || !canSubmit} onClick={submit}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{cta}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
