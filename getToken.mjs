// getToken.mjs
import fs from 'fs';
import fetch from 'node-fetch';

// 🔧 UPDATE THESE TWO from your /home/project/.env
const SUPABASE_URL = 'https://ckfxakctdeasbwhhbjnk.supabase.co'; // VITE_SUPABASE_URL
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZnhha2N0ZGVhc2J3aGhiam5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTMyOTgsImV4cCI6MjA3MTI2OTI5OH0.NShDvpr_0Dc3emiUADrAW8aGngQQGtcsFIL8_5L78uQ';       // VITE_SUPABASE_ANON_KEY

const EMAIL = 'demo@example.com';
const PASSWORD = 'demopass';

async function main() {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  const body = await res.text();

  if (!res.ok) {
    console.error('❌ Auth request failed:', res.status, res.statusText, body);
    process.exit(1);
  }

  // Save for later use
  fs.writeFileSync('/tmp/token.json', body, 'utf8');

  // Show a quick summary
  const data = JSON.parse(body);
  const token = data.access_token || '';
  console.log('✅ Token fetched. Length:', token.length);
  console.log('First 40 chars:', token.slice(0, 40));
}

main().catch((e) => {
  console.error('❌ Script error:', e);
  process.exit(1);
});