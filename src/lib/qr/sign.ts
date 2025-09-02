// top of src/lib/qr/sign.ts
if (typeof window !== 'undefined') {
  throw new Error('signQr must only run on the server (QR_SECRET).');
}
// top of src/lib/qr/sign.ts
if (typeof window !== 'undefined') {
  throw new Error('signQr must only run on the server (QR_SECRET).');
}
import { createHmac, randomBytes } from 'crypto';

const base64url = (buf: Buffer) =>
  buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const b64uFromJSON = (obj: any) => base64url(Buffer.from(JSON.stringify(obj)));

function getSecret() {
  const s = import.meta?.env?.QR_SECRET ?? process.env.QR_SECRET;
  if (!s) throw new Error('QR_SECRET missing');
  return Buffer.isBuffer(s) ? s : Buffer.from(s);
}

export type QrPayload = {
  tenant_id: string;
  table_id: string;
  exp: number; // unix seconds (TTL)
  n?: string; // nonce (optional)
};

export function signQr(payload: QrPayload): string {
  const secret = getSecret();
  const p = { ...payload, n: payload.n ?? base64url(randomBytes(8)) };
  const b64p = b64uFromJSON(p);
  const sig = createHmac('sha256', secret).update(b64p).digest();
  return `${b64p}.${base64url(sig)}`;
}