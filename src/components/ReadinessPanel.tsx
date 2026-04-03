import type { ReadinessItem } from "@/lib/types";

function dotClass(level: ReadinessItem["level"]): string {
  switch (level) {
    case "green":
      return "bg-accent";
    case "amber":
      return "bg-amber-400";
    default:
      return "bg-red-400";
  }
}

export function ReadinessPanel({ items }: { items: ReadinessItem[] }) {
  return (
    <div className="rounded-lg border border-border bg-black/20 p-4 space-y-3">
      <h2 className="text-sm font-medium text-ink">Readiness</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 text-sm">
            <span
              className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dotClass(item.level)}`}
              aria-hidden={true}
            />
            <div>
              <div className="text-ink">{item.label}</div>
              <div className="text-muted text-xs">{item.detail}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
