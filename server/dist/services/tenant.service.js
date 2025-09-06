/** Create a URL-safe slug from a name */
function createSlug(input) {
    return input
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "") // strip diacritics
        .replace(/[^a-z0-9]+/g, "-") // non-alnum → hyphen
        .replace(/^-+|-+$/g, "") // trim hyphens
        .replace(/-{2,}/g, "-") // collapse
        .slice(0, 60);
}
/** Generate a 4-char uppercase code (avoids confusing chars) */
function generateCode4() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 4; i++)
        s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}
export class TenantService {
    app;
    constructor(app) {
        this.app = app;
    }
    /**
     * Create tenant with:
     * - slug: required, unique
     * - code: 4-char, unique
     * - subscription_plan: maps from API field "plan"
     */
    async createTenant(name, plan) {
        // Build a base slug from the name
        const baseSlug = createSlug(name);
        // Ensure slug uniqueness (append -2, -3, ...)
        const slug = await this.ensureUniqueSlug(baseSlug);
        // Ensure a unique 4-char code
        const code = await this.ensureUniqueCode();
        // Insert into tenants table
        const payload = {
            name,
            slug,
            code,
            subscription_plan: plan ?? "basic"
        };
        const { data, error } = await this.app.supabase
            .from("tenants")
            .insert(payload)
            .select("id, name, code, slug")
            .single();
        if (error) {
            this.throwHttp500(`Failed to create tenant: ${error.message}`);
        }
        return data;
    }
    async getTenantByCode(code) {
        const { data, error } = await this.app.supabase
            .from("tenants")
            .select("id, name, code, slug")
            .eq("code", code)
            .maybeSingle();
        // No rows case: return null, don't throw
        if (error && error.code !== "PGRST116") {
            this.throwHttp500(`Failed to fetch tenant: ${error.message}`);
        }
        return data ?? null;
    }
    // ---- helpers ----
    async ensureUniqueSlug(base) {
        let candidate = base;
        let n = 1;
        while (true) {
            const { data, error } = await this.app.supabase
                .from("tenants")
                .select("id")
                .eq("slug", candidate)
                .maybeSingle();
            if (error)
                this.throwHttp500(`Failed to validate slug: ${error.message}`);
            if (!data)
                return candidate; // unique
            n += 1;
            candidate = `${base}-${n}`;
        }
    }
    async ensureUniqueCode() {
        for (let i = 0; i < 50; i++) {
            const code = generateCode4();
            const { data, error } = await this.app.supabase
                .from("tenants")
                .select("id")
                .eq("code", code)
                .maybeSingle();
            if (error)
                this.throwHttp500(`Failed to validate code: ${error.message}`);
            if (!data)
                return code; // unique
        }
        this.throwHttp500("Failed to generate unique tenant code after multiple attempts");
        return "UNREACHABLE";
    }
    throwHttp500(message) {
        // Use @fastify/sensible if present; otherwise fall back to generic Error
        const anyApp = this.app;
        if (anyApp.httpErrors?.internalServerError) {
            throw anyApp.httpErrors.internalServerError(message);
        }
        throw new Error(message);
    }
}
