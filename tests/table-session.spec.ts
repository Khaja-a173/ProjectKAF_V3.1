import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { signQr } from '../src/lib/qr/sign';
import { verifyQr } from '../src/lib/qr/verify';
import 'dotenv/config';
import './setupServer';   

// ENV required for tests
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
const QR_SECRET = process.env.QR_SECRET!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !QR_SECRET) {
  throw new Error('Missing env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE, QR_SECRET');
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

const TENANT_A = crypto.randomUUID();
const TENANT_B = crypto.randomUUID();
const TABLE_A = crypto.randomUUID();
const TABLE_B = crypto.randomUUID();

describe('Signed QR + Table Lock + Join-PIN', () => {
  beforeAll(async () => {
    // Clean up any existing test sessions
    await sb.from('table_sessions').delete().in('tenant_id', [TENANT_A, TENANT_B]);
  });

  afterAll(async () => {
    // Cleanup test data
    await sb.from('table_sessions').delete().in('tenant_id', [TENANT_A, TENANT_B]);
  });

  describe('1) QR signature & TTL', () => {
    it('should reject tampered token', async () => {
      const validToken = signQr({
        tenant_id: TENANT_A,
        table_id: TABLE_A,
        exp: Math.floor(Date.now() / 1000) + 300
      });
      
      // Tamper with token
      const tamperedToken = validToken.slice(0, -1) + 'X';
      
      const response = await fetch('http://localhost:3001/api/table-session/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tamperedToken })
      });
      
      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.error).toContain('Invalid QR signature');
    });

    it('should reject expired token', async () => {
      const expiredToken = signQr({
        tenant_id: TENANT_A,
        table_id: TABLE_A,
        exp: Math.floor(Date.now() / 1000) - 300 // 5 minutes ago
      });
      
      const response = await fetch('http://localhost:3001/api/table-session/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: expiredToken })
      });
      
      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.error).toBe('QR expired');
    });
  });

  describe('2) First device locks table', () => {
    it('should create session and return PIN for first device', async () => {
      const validToken = signQr({
        tenant_id: TENANT_A,
        table_id: TABLE_A,
        exp: Math.floor(Date.now() / 1000) + 900 // 15 minutes
      });
      
      const response = await fetch('http://localhost:3001/api/table-session/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: validToken })
      });
      
      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result.requires_pin).toBe(false);
      expect(result.pin).toMatch(/^\d{4,6}$/);
      expect(result.session_id).toBeDefined();
      
      // Verify row exists in database
      const { data: session } = await sb
        .from('table_sessions')
        .select('*')
        .eq('tenant_id', TENANT_A)
        .eq('table_id', TABLE_A)
        .eq('status', 'active')
        .single();
      
      expect(session).toBeDefined();
      expect(session.pin_hash).toBeDefined();
      expect(session.expires_at).toBeDefined();
    });
  });

  describe('3) Second device requires PIN', () => {
    it('should return 409 for second device on same table', async () => {
      const validToken = signQr({
        tenant_id: TENANT_A,
        table_id: TABLE_A,
        exp: Math.floor(Date.now() / 1000) + 900
      });
      
      const response = await fetch('http://localhost:3001/api/table-session/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: validToken })
      });
      
      expect(response.status).toBe(409);
      const result = await response.json();
      expect(result.requires_pin).toBe(true);
      expect(result.reason).toBe('table_locked');
    });
  });

  describe('4) Join with correct PIN', () => {
    it('should allow join with correct PIN', async () => {
      // First get the PIN from the session
      const { data: session } = await sb
        .from('table_sessions')
        .select('pin_hash')
        .eq('tenant_id', TENANT_A)
        .eq('table_id', TABLE_A)
        .eq('status', 'active')
        .single();
      
      // Generate a test PIN and hash it to compare
      const testPin = '1234';
      const bcrypt = await import('bcryptjs');
      const testHash = await bcrypt.hash(testPin, 10);
      
      // Update the session with our known PIN for testing
      await sb
        .from('table_sessions')
        .update({ pin_hash: testHash })
        .eq('tenant_id', TENANT_A)
        .eq('table_id', TABLE_A)
        .eq('status', 'active');
      
      const validToken = signQr({
        tenant_id: TENANT_A,
        table_id: TABLE_A,
        exp: Math.floor(Date.now() / 1000) + 900
      });
      
      const response = await fetch('http://localhost:3001/api/table-session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: validToken, pin: testPin })
      });
      
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.session_id).toBeDefined();
      expect(result.joined).toBe(true);
    });
  });

  describe('5) Join with wrong PIN', () => {
    it('should reject wrong PIN', async () => {
      const validToken = signQr({
        tenant_id: TENANT_A,
        table_id: TABLE_A,
        exp: Math.floor(Date.now() / 1000) + 900
      });
      
      const response = await fetch('http://localhost:3001/api/table-session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: validToken, pin: '9999' })
      });
      
      expect(response.status).toBe(401);
      const result = await response.json();
      expect(result.error).toBe('bad_pin');
    });
  });

  describe('6) Session expiry respected', () => {
    it('should reject expired session', async () => {
      // Create an expired session
      const expiredSession = await sb
        .from('table_sessions')
        .insert({
          tenant_id: TENANT_B,
          table_id: TABLE_B,
          pin_hash: await (await import('bcryptjs')).hash('1234', 10),
          status: 'active',
          expires_at: new Date(Date.now() - 1000).toISOString() // 1 second ago
        })
        .select('id')
        .single();
      
      const validToken = signQr({
        tenant_id: TENANT_B,
        table_id: TABLE_B,
        exp: Math.floor(Date.now() / 1000) + 900
      });
      
      const response = await fetch('http://localhost:3001/api/table-session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: validToken, pin: '1234' })
      });
      
      expect(response.status).toBe(410);
      const result = await response.json();
      expect(result.error).toBe('session_expired');
    });
  });

  describe('7) DB constraint: single active lock', () => {
    it('should enforce unique active session per table', async () => {
      const bcrypt = await import('bcryptjs');
      
      // Try to insert two active sessions for same table
      const session1 = await sb
        .from('table_sessions')
        .insert({
          tenant_id: TENANT_A,
          table_id: crypto.randomUUID(),
          pin_hash: await bcrypt.hash('1111', 10),
          status: 'active',
          expires_at: new Date(Date.now() + 900000).toISOString()
        })
        .select('id,table_id')
        .single();
      
      expect(session1.error).toBeNull();
      
      // Try to insert second active session for same table
      const session2 = await sb
        .from('table_sessions')
        .insert({
          tenant_id: TENANT_A,
          table_id: session1.data.table_id, // Same table
          pin_hash: await bcrypt.hash('2222', 10),
          status: 'active',
          expires_at: new Date(Date.now() + 900000).toISOString()
        });
      
      expect(session2.error).not.toBeNull();
      expect(session2.error?.code).toBe('23505'); // Unique constraint violation
    });
  });

  describe('8) RLS intact', () => {
    it('should enforce tenant isolation on table_sessions', async () => {
      // Create client for tenant A
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET!;
      
      const tokenA = jwt.sign(
        { role: 'anon', tenant_id: TENANT_A },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '10m' }
      );
      
      const clientA = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${tokenA}` } }
      });
      
      const tokenB = jwt.sign(
        { role: 'anon', tenant_id: TENANT_B },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '10m' }
      );
      
      const clientB = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${tokenB}` } }
      });
      
      // Tenant A cannot see tenant B sessions
      const { data: crossTenantData, error: crossTenantErr, status: crossTenantStatus } = await clientA
        .from('table_sessions')
        .select('id, tenant_id')
        .eq('tenant_id', TENANT_B);
      
      // RLS denial should return data=null and a permission error (often 401)
      expect(crossTenantData ?? []).toEqual([]);
      expect(crossTenantErr).toBeTruthy();
      // Be tolerant to provider differences but ensure it's unauthorized/forbidden
      if (typeof crossTenantStatus === 'number') {
        expect([401, 403]).toContain(crossTenantStatus);
      }
      
      // Tenant B cannot update tenant A sessions
      const { error: updateError, status: updateStatus } = await clientB
        .from('table_sessions')
        .update({ status: 'closed' })
        .eq('tenant_id', TENANT_A);
      
      expect(updateError).not.toBeNull();
      if (typeof updateStatus === 'number') {
        expect([401, 403]).toContain(updateStatus);
      }
      if (typeof updateStatus === 'number') {
        expect([401, 403]).toContain(updateStatus);
      }
    });
  });

  describe('9) UI behavior', () => {
    it('should handle QR token in URL parameters', () => {
      // Test QR payload verification
      const payload = {
        tenant_id: TENANT_A,
        table_id: TABLE_A,
        exp: Math.floor(Date.now() / 1000) + 900
      };
      
      const token = signQr(payload);
      const verified = verifyQr(token);
      
      expect(verified.tenant_id).toBe(TENANT_A);
      expect(verified.table_id).toBe(TABLE_A);
      expect(verified.exp).toBe(payload.exp);
    });
  });
});