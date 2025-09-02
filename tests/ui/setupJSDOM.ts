const makeStorage = () => {
  const s = new Map<string, string>();
  return {
    getItem: (k: string) => (s.has(k) ? s.get(k)! : null),
    setItem: (k: string, v: string) => s.set(k, String(v)),
    removeItem: (k: string) => s.delete(k),
    clear: () => s.clear(),
    key: (i: number) => Array.from(s.keys())[i] ?? null,
    get length() { return s.size; },
  } as Storage;
};

if (typeof window !== 'undefined' && !(window as any).localStorage) {
  (window as any).localStorage = makeStorage();
}
if (!(globalThis as any).localStorage) {
  (globalThis as any).localStorage =
    (globalThis as any).window?.localStorage ?? makeStorage();
}