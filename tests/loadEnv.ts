// tests/loadEnv.ts
import 'dotenv/config';

if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}
if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}

// If you DON’T want to hit Supabase during tests, leave SUPABASE_SERVICE_ROLE unset.
// The orders route below will use an in-memory fallback when SERVICE_ROLE is missing
// or NODE_ENV === 'test'.