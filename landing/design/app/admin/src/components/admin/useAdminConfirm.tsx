import { useCallback, useRef, useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmOptions = { title: string; description?: string; confirmLabel?: string; danger?: boolean };

/**
 * Remplace window.confirm() dans l'espace admin par une vraie fenêtre de confirmation.
 *
 *   const { confirm, confirmDialog } = useAdminConfirm();
 *   if (!(await confirm({ title: "Supprimer cette pub ?", confirmLabel: "Supprimer", danger: true }))) return;
 *   …
 *   return <>{…}{confirmDialog}</>;
 */
export function useAdminConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((resolve) => {
    resolver.current?.(false);
    resolver.current = resolve;
    setOpts(o);
  }), []);

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  };

  const confirmDialog = (
    <AlertDialog open={!!opts} onOpenChange={(o) => { if (!o) close(false); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{opts?.title}</AlertDialogTitle>
          {opts?.description ? <AlertDialogDescription>{opts.description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => close(true)}
            style={opts?.danger ? { background: "#D9383E", color: "#fff" } : { background: "#5B3FE4", color: "#fff" }}
          >
            {opts?.confirmLabel ?? "Confirmer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, confirmDialog };
}
