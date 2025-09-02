// src/state/cartStore.ts
export type Mode = 'table' | 'takeaway';
export type CartItem = { id: string; name: string; price: number; qty: number };
type Items = Record<string, CartItem>;

export class ModeRequiredError extends Error {
  constructor() { super('MODE_NOT_SELECTED'); this.name = 'ModeRequiredError'; }
}
export class ContextRequiredError extends Error {
  constructor() { super('CONTEXT_NOT_SET'); this.name = 'ContextRequiredError'; }
}

type Listener = () => void;

function computeKey(tenantId: string, sessionId: string, mode: Mode) {
  return `${tenantId}:${sessionId}:${mode}`;
}

function safeParse<T>(s: string | null): T | null {
  try { return s ? (JSON.parse(s) as T) : null; } catch { return null; }
}

export class CartStore {
  private _tenantId: string | null = null;
  private _sessionId: string | null = null;
  private _mode: Mode | null = null;
  private _key: string | null = null;
  private _items: Items = {};
  private listeners: Set<Listener> = new Set();

  subscribe(fn: Listener) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private emit() { for (const fn of this.listeners) fn(); }

  get tenantId() { return this._tenantId; }
  get sessionId() { return this._sessionId; }
  get mode() { return this._mode; }
  get key() { return this._key; }
  get items(): CartItem[] { return Object.values(this._items); }
  get total(): number { return this.items.reduce((s, i) => s + i.price * i.qty, 0); }
  isReady(): boolean { return !!(this._tenantId && this._sessionId && this._mode); }

  setContext(tenantId: string, sessionId?: string) {
    if (!tenantId) throw new ContextRequiredError();
    // For takeaway, allow ephemeral session id if missing (generated once).
    if (!sessionId) sessionId = `take-${cryptoRandom(8)}`;
    const changed = tenantId !== this._tenantId || sessionId !== this._sessionId;
    this._tenantId = tenantId;
    this._sessionId = sessionId;
    if (changed) {
      // Context change invalidates key; will rehydrate once mode is set.
      this._key = null;
      this._items = {};
      this.emit();
    }
  }

  setMode(mode: Mode) {
    if (!this._tenantId || !this._sessionId) throw new ContextRequiredError();
    if (this._mode === mode && this._key) return; // no-op
    this._mode = mode;
    this._key = computeKey(this._tenantId, this._sessionId, this._mode);
    this.hydrateFromStorage(); // load cart for this scope if exists
    this.emit();
  }

  clear() {
    this._items = {};
    this.persistToStorage();
    this.emit();
  }

  add(item: Omit<CartItem, 'qty'>, qty = 1) {
    if (!this._tenantId || !this._sessionId) throw new ContextRequiredError();
    if (!this._mode || !this._key) throw new ModeRequiredError();
    const prev = this._items[item.id];
    const nextQty = (prev?.qty ?? 0) + qty;
    this._items[item.id] = { ...item, qty: nextQty };
    this.persistToStorage();
    this.emit();
  }

  remove(itemId: string, qty = 1) {
    if (!this._tenantId || !this._sessionId) throw new ContextRequiredError();
    if (!this._mode || !this._key) throw new ModeRequiredError();
    const prev = this._items[itemId];
    if (!prev) return;
    const nextQty = prev.qty - qty;
    if (nextQty <= 0) delete this._items[itemId];
    else this._items[itemId] = { ...prev, qty: nextQty };
    this.persistToStorage();
    this.emit();
  }

  private persistToStorage() {
    if (!this._key) return;
    try { localStorage.setItem(`cart:${this._key}`, JSON.stringify(this._items)); } catch {}
  }

  private hydrateFromStorage() {
    if (!this._key) return;
    const raw = localStorage.getItem(`cart:${this._key}`);
    this._items = safeParse<Items>(raw) ?? {};
  }
}

function cryptoRandom(bytes: number): string {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const arr = new Uint8Array(bytes);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Node fallback for tests
  const { randomBytes } = require('crypto');
  return randomBytes(bytes).toString('hex');
}

// Singleton helper (optional)
export const cartStore = new CartStore();