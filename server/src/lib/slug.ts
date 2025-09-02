// server/src/lib/slug.ts
export function createSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')                 // strip diacritics
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')       // non-alnum → hyphen
    .replace(/^-+|-+$/g, '')           // trim hyphens
    .replace(/-{2,}/g, '-')            // collapse
    .slice(0, 60);                     // keep slugs short
}