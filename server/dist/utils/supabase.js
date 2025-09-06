import { createClient } from '@supabase/supabase-js';
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
export const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
