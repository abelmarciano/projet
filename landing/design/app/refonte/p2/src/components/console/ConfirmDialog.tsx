import type { MouseEvent, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "@/components/icons";

/**
 * Confirmation unique de la console (AlertDialog habillé .gx-adlg).
 * Le bouton d'action est violet (gx-pri) ou rouge (gx-danger) si `danger`.
 * La fenêtre se ferme quand `onConfirm` a fini ; si elle échoue, elle reste ouverte.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Annuler",
  danger,
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  async function handleConfirm(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (busy) return;
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // L'appelant affiche déjà l'erreur ; la fenêtre reste ouverte pour réessayer.
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!busy) onOpenChange(o); }}>
      <AlertDialogContent className="console-app-portal gx-confirm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={danger ? "gx-danger" : undefined}
            disabled={busy}
            aria-busy={busy || undefined}
            onClick={handleConfirm}
          >
            {busy && <Loader2 className="gx-i gx-spin-i-self" aria-hidden />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
