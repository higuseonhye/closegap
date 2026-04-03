/** Format ISO instant for `<input type="datetime-local" />` in local time. */
export function toInputDatetime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parse datetime-local value to ISO string. */
export function fromInputDatetime(localValue: string): string {
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

/** Short range for UI feedback (preset buttons, etc.). */
export function formatWindowCaption(isoStart: string, isoEnd: string): string {
  const s = new Date(isoStart);
  const e = new Date(isoEnd);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const o: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  return `${s.toLocaleString(undefined, o)} → ${e.toLocaleString(undefined, o)}`;
}
