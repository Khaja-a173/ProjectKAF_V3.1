import { createHmac, timingSafeEqual } from 'crypto';
import { z } from 'zod';

const base64urlToBuf = (s: string) => {
  const pad = (str: string) => str + '==='.slice((str.length + 3) % 4);
  const b64 = pad(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Buffer.from(b64, 'base64');
};

const QrSchema = z.object({
  tenant_id: z.string().uuid(),
  table_id: z.string().uuid(),
  exp: z.number().int().positive(),
  n: z.string().optional()
});
export type QrPayload = z.infer<typeof QrSchema>;

function getSecret() {
  const s = import.meta?.env?.QR_SECRET ?? process.env.QR_SECRET;
  if (!s) throw new Error('QR_SECRET missing');
  return Buffer.isBuffer(s) ? s : Buffer.from(s);
}

export function verifyQr(token: string): QrPayload {
  const [b64p, b64s] = token.split('.');
  if (!b64p || !b64s) throw new Error('Invalid QR format');
  const secret = getSecret();
  const expected = createHmac('sha256', secret).update(b64p).digest();
  const given = base64urlToBuf(b64s);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw new Error('Invalid QR signature');
  }
  const payload = JSON.parse(base64urlToBuf(b64p).toString('utf8'));
  const parsed = QrSchema.parse(payload);
  const now = Math.floor(Date.now() / 1000);
  if (parsed.exp <= now) throw new Error('QR expired');
  return parsed;
}