// tests/ui/cart-store.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { CartStore, ModeRequiredError } from '../../src/state/cartStore';

describe('CartStore scoping', () => {
  let store: CartStore;
  beforeEach(() => {
    localStorage.clear();
    store = new CartStore();
  });

  it('prevents add when mode not selected', () => {
    store.setContext('t1', 's1');
    expect(() => store.add({ id: 'm1', name: 'Burger', price: 10 }, 1)).toThrow(ModeRequiredError);
  });

  it('computes key and persists per scope', () => {
    store.setContext('t1', 's1');
    store.setMode('takeaway');
    store.add({ id: 'm1', name: 'Burger', price: 10 }, 2);
    expect(store.items[0].qty).toBe(2);
    const snapshot1 = localStorage.getItem('cart:t1:s1:takeaway');
    expect(snapshot1).toBeTruthy();

    // new session -> separate cart
    const s2 = new CartStore();
    s2.setContext('t1', 's2');
    s2.setMode('takeaway');
    expect(s2.items.length).toBe(0);
    s2.add({ id: 'm1', name: 'Burger', price: 10 }, 1);
    expect(localStorage.getItem('cart:t1:s2:takeaway')).toBeTruthy();
    expect(localStorage.getItem('cart:t1:s1:takeaway')).toEqual(snapshot1);
  });

  it('separates table vs takeaway within same session', () => {
    store.setContext('t1', 's1');
    store.setMode('table');
    store.add({ id: 'm1', name: 'Burger', price: 10 }, 1);
    expect(localStorage.getItem('cart:t1:s1:table')).toBeTruthy();

    store.setMode('takeaway');
    expect(store.items.length).toBe(0); // new scope, empty by default unless pre-exists
    store.add({ id: 'm2', name: 'Fries', price: 5 }, 1);
    expect(localStorage.getItem('cart:t1:s1:takeaway')).toBeTruthy();
  });
});