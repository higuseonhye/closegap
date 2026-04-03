const MAX_SLUG = 64;

export function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, MAX_SLUG) || "campaign";
}

export function shortId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function makeUniqueSlug(title: string, existing: Set<string>): string {
  const base = slugify(title);
  let candidate = base;
  let n = 0;
  while (existing.has(candidate)) {
    n += 1;
    candidate = `${base}-${shortId()}`;
    if (n > 50) break;
  }
  return candidate;
}
