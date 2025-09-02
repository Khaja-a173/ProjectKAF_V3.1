// src/lib/idempotency.ts
export function generateIdempotencyKey(): string {
  // RFC4122 v4 when available
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  const arr = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else {
    require('crypto').randomFillSync(arr);
  }
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// UI checkout attempt tracking to prevent double-clicks
let _attemptKey: string | null = null;

export function beginCheckoutAttempt(): string {
  if (_attemptKey) return _attemptKey;
  _attemptKey = generateIdempotencyKey();
  console.log('🔑 Starting checkout attempt:', _attemptKey);
  return _attemptKey;
}

export function endCheckoutAttempt() {
  console.log('✅ Ending checkout attempt:', _attemptKey);
  _attemptKey = null;
}

export function getCurrentAttemptKey(): string | null {
  return _attemptKey;
}