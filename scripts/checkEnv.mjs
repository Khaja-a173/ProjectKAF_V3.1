// ESM-safe env checker for Node 20+
// Loads .env itself; no need for `-r dotenv/config` in npm scripts.

import { config as loadEnv } from 'dotenv';

const argPath = process.argv
  .find((a) => a.startsWith('dotenv_config_path='))
  ?.split('=')[1] ?? '.env';

loadEnv({ path: argPath });

// --- Required vars for ProjectKAF (adjust only if spec changes) ---
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
  'JWT_SECRET',
  'QR_SECRET',
  'SUPABASE_SERVICE_ROLE',
];

// Validate presence (non-empty)
const missing = requiredEnvVars.filter((k) => {
  const v = process.env[k];
  return v === undefined || v === null || String(v).trim() === '';
});

if (missing.length) {
  console.error('❌ Missing required environment variables:');
  for (const k of missing) console.error('  - ' + k);
  process.exit(1);
}

console.log('✅ ENV OK');