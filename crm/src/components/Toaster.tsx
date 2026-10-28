import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";

export function Toaster() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="flex animate-fade-in items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-float">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {t.texte}
        </div>
      ))}
    </div>
  );
}
