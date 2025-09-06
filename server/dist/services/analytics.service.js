export class AnalyticsService {
    app;
    constructor(app) {
        this.app = app;
    }
    async kpiSummary(tenantId, window = '7d') {
        const { data, error } = await this.app.supabase
            .rpc('kpi_summary', { p_tenant_id: tenantId, p_window: window })
            .single();
        if (error)
            throw this.app.httpErrors.internalServerError(error.message);
        return data;
    }
    async revenueSeries(tenantId, window = '7d', granularity = 'day') {
        const { data, error } = await this.app.supabase
            .rpc('revenue_series', { p_tenant_id: tenantId, p_window: window, p_granularity: granularity });
        if (error)
            throw this.app.httpErrors.internalServerError(error.message);
        return data ?? [];
    }
    async topItems(tenantId, window = '7d', limit = 10) {
        const { data, error } = await this.app.supabase
            .rpc('top_items', { p_tenant_id: tenantId, p_window: window, p_limit: limit });
        if (error)
            throw this.app.httpErrors.internalServerError(error.message);
        return data ?? [];
    }
}
