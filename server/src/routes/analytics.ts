import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// -----------------------------
// Time window utilities
// -----------------------------
function getTimeWindow(window: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start: Date;

  switch (window) {
    case '7d':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'mtd': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case 'qtd': {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    }
    case 'ytd':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return { start, end };
}

function getDateLabel(date: Date, granularity: string): string {
  switch (granularity) {
    case 'day':
      return date.toISOString().split('T')[0];
    case 'week': {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().split('T')[0];
    }
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    default:
      return date.toISOString().split('T')[0];
  }
}

const WindowEnum = z.enum(['7d', '30d', '90d', 'mtd', 'qtd', 'ytd']);
const GranularityEnum = z.enum(['day', 'week', 'month']);

export default async function analyticsRoutes(app: FastifyInstance) {
  const resolveTenantId = (req: any): string | null => {
    const h = req?.headers?.['x-tenant-id'];
    const fromHeader = (typeof h === 'string' && h.length > 0) ? h : null;
    const fromAuth = req?.auth?.primaryTenantId || null;
    return fromHeader || fromAuth;
  };
  // Backward-compat: some UIs call /analytics without a subpath. Redirect to summary.
  app.get('/analytics', { preHandler: [app.requireAuth] }, async (_req, reply) => {
    return reply.redirect('/analytics/summary');
  });
  // -----------------------------
  // GET /analytics/summary
  // -----------------------------
  app.get('/analytics/summary', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) {
      return reply.code(403).send({ error: 'no tenant context' });
    }
    const db = (req as any).supabaseUser || (app as any).supabase;

    const query = z.object({
      window: WindowEnum.default('7d')
    }).parse(req.query);

    const { start, end } = getTimeWindow(query.window);

    try {
      // Prefer RPC if available
      const { data: rpcData, error: rpcError } = await db
        .rpc('kpi_summary', {
          p_tenant_id: tenantId,
          p_window: query.window
        })
        .single();

      if (!rpcError && rpcData) {
        const r: any = rpcData as any;
        return reply.send({
          window: query.window,
          orders: Number(r?.orders ?? 0),
          revenue: String(r?.revenue ?? '0.00'),
          dine_in: Number(r?.dine_in ?? 0),
          takeaway: Number(r?.takeaway ?? 0)
        });
      }

      // Fallback to manual queries
      const { data: orders, error: ordersError } = await db
        .from('orders')
        .select('order_type, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      if (ordersError) throw app.httpErrors.internalServerError(ordersError.message);

      const { data: payments, error: paymentsError } = await db
        .from('payments')
        .select('amount, status, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      if (paymentsError) throw app.httpErrors.internalServerError(paymentsError.message);

      const totalOrders = orders?.length || 0;
      const dineIn = orders?.filter((o: any) => o.order_type === 'dine_in').length || 0;
      const takeaway = orders?.filter((o: any) => o.order_type === 'takeaway').length || 0;

      const revenue = (payments || []).reduce((sum: number, p: any) => {
        const amount = parseFloat(p.amount?.toString() || '0');
        if (p.status === 'completed') return sum + amount;
        if (p.status === 'refunded') return sum - Math.abs(amount);
        return sum;
      }, 0);

      return reply.send({
        window: query.window,
        orders: totalOrders,
        revenue: revenue.toFixed(2),
        dine_in: dineIn,
        takeaway
      });
    } catch (err: any) {
      app.log.error(err, 'Analytics summary failed');
      throw app.httpErrors.internalServerError(err.message);
    }
  });

  // -----------------------------
  // GET /analytics/revenue (simple series derived from payments)
  // -----------------------------
  app.get('/analytics/revenue', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) {
      return reply.code(403).send({ error: 'no tenant context' });
    }
    const db = (req as any).supabaseUser || (app as any).supabase;

    const query = z.object({
      window: WindowEnum.default('30d'),
      granularity: GranularityEnum.default('day')
    }).parse(req.query);

    const { start, end } = getTimeWindow(query.window);

    try {
      const { data: payments, error } = await db
        .from('payments')
        .select('amount, status, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at');
      if (error) throw app.httpErrors.internalServerError(error.message);

      const buckets = new Map<string, number>();
      (payments || []).forEach((payment: any) => {
        const date = new Date(payment.created_at);
        const label = getDateLabel(date, query.granularity);
        const amount = parseFloat(payment.amount?.toString() || '0');
        let revenue = 0;
        if (payment.status === 'completed') revenue = amount;
        else if (payment.status === 'refunded') revenue = -Math.abs(amount);
        buckets.set(label, (buckets.get(label) || 0) + revenue);
      });

      const series = Array.from(buckets.entries())
        .map(([label, revenue]) => ({ label, revenue: revenue.toFixed(2) }))
        .sort((a, b) => a.label.localeCompare(b.label));

      const total = Array.from(buckets.values()).reduce((sum: number, val: number) => sum + val, 0);

      return reply.send({
        window: query.window,
        granularity: query.granularity,
        series,
        total: total.toFixed(2)
      });
    } catch (err: any) {
      app.log.error(err, 'Analytics revenue failed');
      throw app.httpErrors.internalServerError(err.message);
    }
  });

  // -----------------------------
  // GET /analytics/top-items
  // -----------------------------
  app.get('/analytics/top-items', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) {
      return reply.code(403).send({ error: 'no tenant context' });
    }
    const db = (req as any).supabaseUser || (app as any).supabase;

    const query = z.object({
      window: WindowEnum.default('30d'),
      limit: z.coerce.number().int().min(1).max(50).default(10)
    }).parse(req.query);

    const { start, end } = getTimeWindow(query.window);

    try {
      // Join order_items with menu_items and orders for tenant filtering
      const { data: items, error } = await db
        .from('order_items')
        .select(`
          menu_item_id,
          quantity,
          unit_price,
          orders!inner(tenant_id, created_at),
          menu_items!inner(name, category_id),
          menu_categories(name)
        `)
        .eq('orders.tenant_id', tenantId)
        .gte('orders.created_at', start.toISOString())
        .lte('orders.created_at', end.toISOString());
      if (error) throw app.httpErrors.internalServerError(error.message);

      const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
      (items || []).forEach((item: any) => {
        const menuItemId = item.menu_item_id;
        const name = item.menu_items?.name || 'Unknown Item';
        const qty = parseInt(item.quantity?.toString() || '0');
        const unitPrice = parseFloat(item.unit_price?.toString() || '0');
        const rev = qty * unitPrice;

        const existing = itemMap.get(menuItemId);
        if (existing) {
          existing.qty += qty;
          existing.revenue += rev;
        } else {
          itemMap.set(menuItemId, { name, qty, revenue: rev });
        }
      });

      const topItems = Array.from(itemMap.entries())
        .map(([menu_item_id, data]) => ({
          menu_item_id,
          name: data.name,
          qty: data.qty,
          revenue: data.revenue.toFixed(2)
        }))
        .sort((a, b) => b.qty - a.qty || parseFloat(b.revenue) - parseFloat(a.revenue))
        .slice(0, query.limit);

      return reply.send({
        window: query.window,
        items: topItems
      });
    } catch (err: any) {
      app.log.error(err, 'Analytics top-items failed');
      throw app.httpErrors.internalServerError(err.message);
    }
  });

  // -----------------------------
  // Part‑2 endpoints (Supabase RPC first, safe fallbacks)
  // -----------------------------

  // GET /analytics/payment-funnel
  app.get('/analytics/payment-funnel', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const window = (req.query as any)?.window || '7d';
    const valid = ['7d', '30d', '90d', 'mtd', 'qtd', 'ytd'];
    if (!valid.includes(window)) return reply.code(400).send({ error: 'invalid_window' });

    try {
      const { data, error } = await db.rpc('payment_conversion_funnel', {
        p_tenant_id: tenantId,
        p_window: window
      });
      if (error) {
        app.log.error({ error }, 'payment_funnel rpc failed');
        return reply.send({ window, rows: [] });
      }
      return reply.send({ window, rows: data || [] });
    } catch (err: any) {
      app.log.error(err, 'payment_funnel failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });

  // GET /analytics/peak-hours
  app.get('/analytics/peak-hours', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const window = (req.query as any)?.window || '7d';
    const valid = ['7d', '30d', '90d', 'mtd', 'qtd', 'ytd'];
    if (!valid.includes(window)) return reply.code(400).send({ error: 'invalid_window' });

    try {
      const { data, error } = await db.rpc('peak_hours_heatmap', {
        p_tenant_id: tenantId,
        p_window: window
      });
      if (error) {
        app.log.error({ error }, 'peak_hours rpc failed');
        return reply.send({ window, rows: [] });
      }
      return reply.send({ window, rows: data || [] });
    } catch (err: any) {
      app.log.error(err, 'peak_hours failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });

  // GET /analytics/revenue-series (DB‑driven buckets)
  app.get('/analytics/revenue-series', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const window = ((req.query as any)?.window || '30d').toLowerCase();
    const granularity = ((req.query as any)?.granularity || 'day').toLowerCase();
    const validW = ['7d', '30d', '90d', 'mtd', 'qtd', 'ytd'];
    const validG = ['day', 'week', 'month'];
    if (!validW.includes(window)) return reply.code(400).send({ error: 'invalid_window' });
    if (!validG.includes(granularity)) return reply.code(400).send({ error: 'invalid_granularity' });

    try {
      const { data, error } = await db.rpc('revenue_timeseries', {
        p_tenant_id: tenantId,
        p_window: window,
        p_granularity: granularity
      });
      if (error) {
        app.log.error({ error }, 'revenue_timeseries rpc failed');
        return reply.send({ window, granularity, series: [], total: '0.00', orders: 0 });
      }

      const rows = (data || []) as Array<{ bucket: string; revenue_total: string | number; orders_count: string | number }>;
      const total = rows.reduce((sum: number, r: any) => sum + parseFloat(String(r.revenue_total || '0')), 0);
      const orders = rows.reduce((sum: number, r: any) => sum + parseInt(String(r.orders_count || '0')), 0);

      return reply.send({
        window,
        granularity,
        series: rows,
        total: total.toFixed(2),
        orders
      });
    } catch (err: any) {
      app.log.error(err, 'revenue-series failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });

  // GET /analytics/revenue-breakdown
  app.get('/analytics/revenue-breakdown', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const qs = (req.query as any) || {};
    const bucket = qs.bucket as string | undefined;
    const by = (qs.by as string | undefined)?.toLowerCase();
    const granularity = (qs.granularity as string | undefined) || (qs.interval as string | undefined) || 'day';

    if (!bucket || !by) return reply.code(400).send({ error: 'missing_params' });
    if (!['item', 'category', 'order_type'].includes(by)) {
      return reply.code(400).send({ error: 'invalid_by' });
    }
    if (!['day', 'week', 'month'].includes(granularity)) {
      return reply.code(400).send({ error: 'invalid_granularity' });
    }

    // Compute time window from bucket + granularity
    const bucketDate = new Date(bucket);
    let startTime: Date = new Date(bucketDate);
    let endTime: Date = new Date(bucketDate);
    switch (granularity) {
      case 'day':
        startTime = new Date(bucketDate);
        endTime = new Date(bucketDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(bucketDate);
        endTime = new Date(bucketDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = new Date(bucketDate);
        endTime = new Date(bucketDate.getFullYear(), bucketDate.getMonth() + 1, 1);
        break;
    }

    try {
      if (by === 'order_type') {
        const { data: orders, error } = await db
          .from('orders')
          .select('order_type, total_amount, created_at')
          .eq('tenant_id', tenantId)
          .gte('created_at', startTime.toISOString())
          .lt('created_at', endTime.toISOString());
        if (error) throw app.httpErrors.internalServerError(error.message);

        const map = new Map<string, { qty: number; revenue: number }>();
        (orders || []).forEach((o: any) => {
          const key = o.order_type || 'unknown';
          const amount = parseFloat(o.total_amount?.toString() || '0');
          const entry = map.get(key) || { qty: 0, revenue: 0 };
          entry.qty += 1;
          entry.revenue += amount;
          map.set(key, entry);
        });

        const rows = Array.from(map.entries()).map(([label, v]: [string, { qty: number; revenue: number }]) => ({
          id: label,
          label,
          qty: v.qty,
          revenue: v.revenue.toFixed(2)
        }));
        return reply.send({ bucket, by, rows });
      }

      // For item/category: fetch order_items joined data and aggregate client-side
      const { data: items, error } = await db
        .from('order_items')
        .select(`
          menu_item_id,
          quantity,
          unit_price,
          menu_items!inner(id, name, category_id),
          menu_categories!left(id, name),
          orders!inner(tenant_id, created_at)
        `)
        .eq('orders.tenant_id', tenantId)
        .gte('orders.created_at', startTime.toISOString())
        .lt('orders.created_at', endTime.toISOString());
      if (error) throw app.httpErrors.internalServerError(error.message);

      type Agg = { label: string; qty: number; revenue: number };
      const map = new Map<string, Agg>();

      (items || []).forEach((row: any) => {
        const qty = parseInt(row.quantity?.toString() || '0');
        const unit = parseFloat(row.unit_price?.toString() || '0');
        const rev = qty * unit;

        let key: string, label: string;
        if (by === 'item') {
          key = String(row.menu_item_id);
          label = row.menu_items?.name || 'Unknown Item';
        } else {
          key = String(row.menu_items?.category_id ?? 'unknown');
          label = row.menu_categories?.name || 'Uncategorized';
        }

        const existing = map.get(key);
        if (existing) {
          existing.qty += qty;
          existing.revenue += rev;
        } else {
          map.set(key, { label, qty, revenue: rev });
        }
      });

      const rows = Array.from(map.entries()).map(([id, v]: [string, { label: string; qty: number; revenue: number }]) => ({
        id,
        label: v.label,
        qty: v.qty,
        revenue: v.revenue.toFixed(2)
      })).sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));

      return reply.send({ bucket, by, rows });
    } catch (err: any) {
      app.log.error(err, 'revenue-breakdown failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });

  // GET /analytics/fulfillment-timeline
  app.get('/analytics/fulfillment-timeline', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const window = (req.query as any)?.window || '7d';
    const windowMap: Record<string, string> = {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      'mtd': '1 month',
      'qtd': '3 months',
      'ytd': '1 year'
    };
    const intervalText = windowMap[window];
    if (!intervalText) return reply.code(400).send({ error: 'invalid_window' });

    try {
      const { data, error } = await db.rpc('order_fulfillment_timeline', {
        p_tenant_id: tenantId,
        p_interval: intervalText
      });
      if (error) {
        app.log.error({ error }, 'fulfillment_timeline rpc failed');
        return reply.send({ window, rows: [] });
      }
      return reply.send({ window, rows: data || [] });
    } catch (err: any) {
      app.log.error(err, 'fulfillment-timeline failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });
  // -----------------------------
  // Aliases for snake_case endpoints expected by frontend
  // -----------------------------

  // GET /analytics/payment_conversion_funnel  (alias for /analytics/payment-funnel)
  app.get('/analytics/payment_conversion_funnel', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const range = (req.query as any)?.range || '7d';
    const valid = ['7d', '30d', '90d', 'mtd', 'qtd', 'ytd'];
    if (!valid.includes(range)) return reply.code(400).send({ error: 'invalid_range' });

    try {
      const { data, error } = await db.rpc('payment_conversion_funnel', {
        p_tenant_id: tenantId,
        p_window: range
      });
      if (error) {
        app.log.error({ error }, 'payment_conversion_funnel rpc failed');
        return reply.send({ range, rows: [] });
      }
      return reply.send({ range, rows: data || [] });
    } catch (err: any) {
      app.log.error(err, 'payment_conversion_funnel failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });

  // GET /analytics/peak_hours_heatmap  (alias for /analytics/peak-hours)
  app.get('/analytics/peak_hours_heatmap', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const range = (req.query as any)?.range || '7d';
    const valid = ['7d', '30d', '90d', 'mtd', 'qtd', 'ytd'];
    if (!valid.includes(range)) return reply.code(400).send({ error: 'invalid_range' });

    try {
      const { data, error } = await db.rpc('peak_hours_heatmap', {
        p_tenant_id: tenantId,
        p_window: range
      });
      if (error) {
        app.log.error({ error }, 'peak_hours_heatmap rpc failed');
        return reply.send({ range, rows: [] });
      }
      return reply.send({ range, rows: data || [] });
    } catch (err: any) {
      app.log.error(err, 'peak_hours_heatmap failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });

  // GET /analytics/revenue_timeseries  (alias for /analytics/revenue-series)
  app.get('/analytics/revenue_timeseries', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const range = ((req.query as any)?.range || '30d').toLowerCase();
    const interval = ((req.query as any)?.interval || 'day').toLowerCase();
    const validW = ['7d', '30d', '90d', 'mtd', 'qtd', 'ytd'];
    const validG = ['day', 'week', 'month'];
    if (!validW.includes(range)) return reply.code(400).send({ error: 'invalid_range' });
    if (!validG.includes(interval)) return reply.code(400).send({ error: 'invalid_interval' });

    try {
      const { data, error } = await db.rpc('revenue_timeseries', {
        p_tenant_id: tenantId,
        p_window: range,
        p_granularity: interval
      });
      if (error) {
        app.log.error({ error }, 'revenue_timeseries rpc failed');
        return reply.send({ range, interval, series: [], total: '0.00', orders: 0 });
      }

      const rows = (data || []) as Array<{ bucket: string; revenue_total: string | number; orders_count: string | number }>;
      const total = rows.reduce((sum, r) => sum + parseFloat(String(r.revenue_total || '0')), 0);
      const orders = rows.reduce((sum, r) => sum + parseInt(String(r.orders_count || '0')), 0);

      return reply.send({
        range,
        interval,
        series: rows,
        total: total.toFixed(2),
        orders
      });
    } catch (err: any) {
      app.log.error(err, 'revenue_timeseries failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });

  // GET /analytics/order_fulfillment_timeline  (alias for /analytics/fulfillment-timeline)
  app.get('/analytics/order_fulfillment_timeline', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const range = (req.query as any)?.range || '7d';
    const windowMap: Record<string, string> = {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      'mtd': '1 month',
      'qtd': '3 months',
      'ytd': '1 year'
    };
    const intervalText = windowMap[range];
    if (!intervalText) return reply.code(400).send({ error: 'invalid_range' });

    try {
      const { data, error } = await db.rpc('order_fulfillment_timeline', {
        p_tenant_id: tenantId,
        p_interval: intervalText
      });
      if (error) {
        app.log.error({ error }, 'order_fulfillment_timeline rpc failed');
        return reply.send({ range, rows: [] });
      }
      return reply.send({ range, rows: data || [] });
    } catch (err: any) {
      app.log.error(err, 'order_fulfillment_timeline failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });

  // GET /analytics/revenue_breakdown  (alias for /analytics/revenue-breakdown, accepts `interval`)
  app.get('/analytics/revenue_breakdown', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = resolveTenantId(req);
    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });
    const db = (req as any).supabaseUser || (app as any).supabase;

    const qs = (req.query as any) || {};
    const bucket = qs.bucket as string | undefined;
    const by = (qs.by as string | undefined)?.toLowerCase();
    const interval = (qs.interval as string | undefined) || 'day';

    if (!bucket || !by) return reply.code(400).send({ error: 'missing_params' });
    if (!['item', 'category', 'order_type'].includes(by)) {
      return reply.code(400).send({ error: 'invalid_by' });
    }
    if (!['day', 'week', 'month'].includes(interval)) {
      return reply.code(400).send({ error: 'invalid_interval' });
    }

    // Compute time window from bucket + interval
    const bucketDate = new Date(bucket);
    let startTime: Date = new Date(bucketDate);
    let endTime: Date = new Date(bucketDate);
    switch (interval) {
      case 'day':
        startTime = new Date(bucketDate);
        endTime = new Date(bucketDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(bucketDate);
        endTime = new Date(bucketDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = new Date(bucketDate);
        endTime = new Date(bucketDate.getFullYear(), bucketDate.getMonth() + 1, 1);
        break;
    }

    try {
      if (by === 'order_type') {
        const { data: orders, error } = await db
          .from('orders')
          .select('order_type, total_amount, created_at')
          .eq('tenant_id', tenantId)
          .gte('created_at', startTime.toISOString())
          .lt('created_at', endTime.toISOString());
        if (error) throw app.httpErrors.internalServerError(error.message);

        const map = new Map<string, { qty: number; revenue: number }>();
        (orders || []).forEach((o: any) => {
          const key = o.order_type || 'unknown';
          const amount = parseFloat(o.total_amount?.toString() || '0');
          const entry = map.get(key) || { qty: 0, revenue: 0 };
          entry.qty += 1;
          entry.revenue += amount;
          map.set(key, entry);
        });

        const rows = Array.from(map.entries()).map(([label, v]: [string, { qty: number; revenue: number }]) => ({
          id: label,
          label,
          qty: v.qty,
          revenue: v.revenue.toFixed(2)
        }));
        return reply.send({ bucket, by, rows });
      }

      const { data: items, error } = await db
        .from('order_items')
        .select(`
          menu_item_id,
          quantity,
          unit_price,
          menu_items!inner(id, name, category_id),
          menu_categories!left(id, name),
          orders!inner(tenant_id, created_at)
        `)
        .eq('orders.tenant_id', tenantId)
        .gte('orders.created_at', startTime.toISOString())
        .lt('orders.created_at', endTime.toISOString());
      if (error) throw app.httpErrors.internalServerError(error.message);

      type Agg = { label: string; qty: number; revenue: number };
      const map = new Map<string, Agg>();

      (items || []).forEach((row: any) => {
        const qty = parseInt(row.quantity?.toString() || '0');
        const unit = parseFloat(row.unit_price?.toString() || '0');
        const rev = qty * unit;

        let key: string, label: string;
        if (by === 'item') {
          key = String(row.menu_item_id);
          label = row.menu_items?.name || 'Unknown Item';
        } else {
          key = String(row.menu_items?.category_id ?? 'unknown');
          label = row.menu_categories?.name || 'Uncategorized';
        }

        const existing = map.get(key);
        if (existing) {
          existing.qty += qty;
          existing.revenue += rev;
        } else {
          map.set(key, { label, qty, revenue: rev });
        }
      });

      const rows = Array.from(map.entries()).map(([id, v]: [string, { label: string; qty: number; revenue: number }]) => ({
        id,
        label: v.label,
        qty: v.qty,
        revenue: v.revenue.toFixed(2)
      })).sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));

      return reply.send({ bucket, by, rows });
    } catch (err: any) {
      app.log.error(err, 'revenue_breakdown (alias) failed');
      return reply.code(500).send({ error: 'db_error' });
    }
  });
}
