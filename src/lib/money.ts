const locales: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  KRW: "ko-KR",
  JPY: "ja-JP",
};

export function formatMoney(cents: number, currency: string): string {
  const code = currency || "USD";
  const locale = locales[code] ?? "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${code}`;
  }
}
