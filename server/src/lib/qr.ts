// server/src/lib/qr.ts
import * as crypto from "crypto";
import QRCode from "qrcode";

export type QrPayload = {
  tenant_code: string;
  table_code: string;
  iat: number;   // issued at (epoch seconds)
  exp: number;   // expiry (epoch seconds)
  nonce: string; // random hex to prevent replay
};

/**
 * Sign a QR payload with HMAC-SHA256.
 * - Requires process.env.QR_SECRET
 * - TTL defaults to 600s (10 minutes)
 */
export function signQrPayload(
  payload: Omit<QrPayload, "iat" | "exp" | "nonce">,
  ttlSec = 600
) {
  const secret = process.env.QR_SECRET;
  if (!secret) {
    throw new Error(
      "QR_SECRET is not set. Please define QR_SECRET in your environment for QR signing."
    );
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSec;

  // Construct in a stable key order for deterministic signatures
  const data: QrPayload = {
    tenant_code: payload.tenant_code,
    table_code: payload.table_code,
    iat,
    exp,
    nonce: crypto.randomBytes(8).toString("hex")
  };

  const json = JSON.stringify(data);
  const sig = crypto
    .createHmac("sha256", secret)
    .update(json)
    .digest("base64url");

  return { data, sig };
}

/**
 * Generate a PNG Data URL for the signed QR deep link.
 * Encodes the payload (base64url) and signature in a custom scheme:
 * kaf://t?d=<base64url(json)> & s=<base64url(hmac)>
 */
export async function generateQrPngUrl(signed: { data: QrPayload; sig: string }) {
  const json = JSON.stringify(signed.data);
  const encoded = Buffer.from(json).toString("base64url");

  const params = new URLSearchParams({ d: encoded, s: signed.sig });
  const uri = `kaf://t?${params.toString()}`;

  return await QRCode.toDataURL(uri, { margin: 1, width: 512 });
}