// server/src/plugins/supabase.ts
import fp from "fastify-plugin";
import { createClient } from "@supabase/supabase-js";
/**
 * Fastify plugin: attaches a typed Supabase client to `app.supabase`.
 * - Uses service role for server-side operations.
 * - No session persistence on server.
 */
export default fp(async (app) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) {
        app.log.error({ hasUrl: Boolean(url), hasKey: Boolean(key) }, "Supabase env missing (SUPABASE_URL or SUPABASE_SERVICE_ROLE)");
        throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE");
    }
    const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false }
    });
    app.decorate("supabase", supabase);
    app.log.info("Supabase client initialized");
});
