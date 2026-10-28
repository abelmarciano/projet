import { Check, ChevronsUpDown } from "lucide-react";
import { STATUSES, STATUS_MAP } from "@/data/constants";
import type { StatusId } from "@/data/types";
import { cn } from "@/lib/utils";
import { Popover } from "./ui";

export function StatusDot({ id, className }: { id: StatusId; className?: string }) {
  return <span className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", className)} style={{ background: STATUS_MAP[id].color }} />;
}

export function StatusBadge({ id, className }: { id: StatusId; className?: string }) {
  const s = STATUS_MAP[id];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold", className)}
      style={{ background: s.color, color: s.text }}
    >
      {s.label}
    </span>
  );
}

export function StatusSelect({ value, onChange }: { value: StatusId; onChange: (s: StatusId) => void }) {
  const s = STATUS_MAP[value];
  return (
    <Popover
      className="w-64"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="group inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm transition hover:brightness-110 hover:shadow"
          style={{ background: s.color, color: s.text }}
        >
          <span className="truncate">{s.label}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </button>
      )}
    >
      {(close) => (
        <div className="max-h-80 overflow-y-auto">
          {STATUSES.map((st) => (
            <button
              key={st.id}
              onClick={() => {
                if (st.id !== value) onChange(st.id);
                close();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              <StatusDot id={st.id} />
              <span className="flex-1">{st.label}</span>
              {st.id === value && <Check className="h-4 w-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
