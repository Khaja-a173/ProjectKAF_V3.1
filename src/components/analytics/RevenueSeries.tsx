import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, X } from 'lucide-react';
import { API_BASE, getErrorMessage } from '@/lib/api';

interface RevenueSeriesProps {
  window: string; // '7d' | '30d' | '90d' | etc.
  onRefresh?: () => void;
}

interface SeriesPointRaw {
  bucket?: string; // ISO date string or bucket label
  t?: string; // alternative key
  revenue_total?: string | number;
  revenue?: string | number;
  total_minor?: number;
  orders_count?: number;
  orders?: number;
}

interface SeriesData {
  window: string;
  granularity: string;
  series: Array<{
    bucket: string;
    revenue_total: string | number;
    orders_count: number;
  }>;
  total: string | number;
  orders: number;
}

interface BreakdownRowRaw {
  id?: string;
  label?: string;
  name?: string;
  qty?: number;
  count?: number;
  orders?: number;
  revenue?: string | number;
  amount_total?: string | number;
}

interface BreakdownData {
  bucket: string;
  by: string;
  rows: Array<{
    id: string;
    label: string;
    qty: number;
    revenue: string | number;
  }>;
}

// ---------------- Local HTTP helpers (scoped to this component) ----------------
async function getJSON<T>(path: string, opts: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
    signal: opts.signal,
  });
  const text = await res.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  return data as T;
}

// ---------------- Analytics endpoint wrappers (resilient to variants) ----------------
async function fetchRevenueSeries(range: string, interval: 'day' | 'week' | 'month'): Promise<SeriesData> {
  const q = new URLSearchParams({ range, interval });
  const raw: any = await getJSON<any>(`/analytics/revenue_timeseries?${q.toString()}`);

  // Accept shapes: { series, total, orders }, { data: { series, ... } }, or array
  const seriesRaw: any[] = Array.isArray(raw?.series)
    ? raw.series
    : Array.isArray(raw?.data?.series)
      ? raw.data.series
      : Array.isArray(raw?.points)
        ? raw.points
        : Array.isArray(raw)
          ? raw
          : [];

  const series = (seriesRaw as SeriesPointRaw[]).map((p) => ({
    bucket: String(p.bucket ?? p.t ?? ''),
    revenue_total: (p.revenue_total ?? p.revenue ?? p.total_minor ?? 0),
    orders_count: Number(p.orders_count ?? p.orders ?? 0),
  }));

  // Derive totals if not provided
  const totalProvided = raw?.total ?? raw?.data?.total;
  const ordersProvided = raw?.orders ?? raw?.data?.orders;

  const total = typeof totalProvided !== 'undefined'
    ? totalProvided
    : series.reduce((acc, p) => acc + Number(p.revenue_total || 0), 0);

  const orders = typeof ordersProvided !== 'undefined'
    ? Number(ordersProvided)
    : series.reduce((acc, p) => acc + Number(p.orders_count || 0), 0);

  return {
    window: range,
    granularity: interval,
    series,
    total,
    orders,
  };
}

async function fetchRevenueBreakdown(bucket: string, by: 'item' | 'category' | 'order_type', interval: 'day' | 'week' | 'month'): Promise<BreakdownData> {
  // Try querystring variant first
  const q = new URLSearchParams({ bucket, by, interval });
  let raw: any;
  try {
    raw = await getJSON<any>(`/analytics/revenue_breakdown?${q.toString()}`);
  } catch {
    // Fallback path variant: /analytics/revenue_breakdown/:bucket?by=...&interval=...
    raw = await getJSON<any>(`/analytics/revenue_breakdown/${encodeURIComponent(bucket)}?by=${encodeURIComponent(by)}&interval=${encodeURIComponent(interval)}`);
  }

  const rowsRaw: any[] = Array.isArray(raw?.rows)
    ? raw.rows
    : Array.isArray(raw?.data?.rows)
      ? raw.data.rows
      : Array.isArray(raw)
        ? raw
        : [];

  const rows = (rowsRaw as BreakdownRowRaw[]).map((r, i) => ({
    id: String(r.id ?? `${by}-${i}`),
    label: String(r.label ?? r.name ?? 'Unknown'),
    qty: Number(r.qty ?? r.count ?? r.orders ?? 0),
    revenue: (r.revenue ?? r.amount_total ?? 0),
  }));

  return { bucket, by, rows };
}

const RevenueSeries: React.FC<RevenueSeriesProps> = ({ window: timeWindow }) => {
  const [data, setData] = useState<SeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  // Drill-down state
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [breakdownTab, setBreakdownTab] = useState<'item' | 'category' | 'order_type'>('item');
  const [breakdownData, setBreakdownData] = useState<BreakdownData | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  useEffect(() => {
    loadRevenueSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeWindow, granularity]);

  useEffect(() => {
    if (selectedBucket) {
      loadBreakdown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBucket, breakdownTab, granularity]);

  const loadRevenueSeries = async () => {
    try {
      setLoading(true);
      setError(null);
      const seriesData = await fetchRevenueSeries(timeWindow, granularity);
      setData(seriesData);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to load revenue series');
    } finally {
      setLoading(false);
    }
  };

  const loadBreakdown = async () => {
    if (!selectedBucket) return;

    try {
      setBreakdownLoading(true);
      setBreakdownError(null);
      const breakdown = await fetchRevenueBreakdown(selectedBucket, breakdownTab, granularity);
      setBreakdownData(breakdown);
    } catch (err: any) {
      setBreakdownError(getErrorMessage(err) || 'Failed to load breakdown');
    } finally {
      setBreakdownLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
    }).format(Number.isFinite(value) ? value : 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (granularity) {
      case 'day':
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      case 'week':
        return `Week of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  const getValidGranularities = () => {
    // Disable illegal combinations based on selected window
    switch (timeWindow) {
      case '7d':
        return ['day'];
      case '30d':
        return ['day', 'week'];
      case '90d':
        return ['day', 'week', 'month'];
      default:
        return ['day', 'week', 'month'];
    }
  };

  const handlePointClick = (e: any) => {
    // Recharts passes a synthetic event with activeLabel on chart-level onClick
    const bucket = e?.activeLabel || e?.payload?.bucket;
    if (bucket) {
      setSelectedBucket(bucket);
      setBreakdownTab('item');
    }
  };

  const closeDrilldown = () => {
    setSelectedBucket(null);
    setBreakdownData(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
        </div>
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const hasData = data?.series && data.series.length > 0;
  const validGranularities = getValidGranularities();

  // Prepare chart data
  const chartData = data?.series.map((point) => ({
    ...point,
    revenue_total: Number(point.revenue_total),
    formatted_date: formatDate(point.bucket),
  })) || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
        </div>

        {/* Granularity selector */}
        <select
          value={granularity}
          onChange={(e) => setGranularity(e.target.value as 'day' | 'week' | 'month')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {validGranularities.map((g) => (
            <option key={g} value={g}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {!hasData ? (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No revenue in this window</p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.total)}</p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{data.orders}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} onClick={handlePointClick}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="formatted_date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === 'revenue_total' ? formatCurrency(value) : value,
                    name === 'revenue_total' ? 'Revenue' : 'Orders',
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenue_total"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Click on any point to see detailed breakdown
          </p>
        </>
      )}

      {/* Drill-down modal */}
      {selectedBucket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Breakdown - {formatDate(selectedBucket)}
              </h3>
              <button
                onClick={closeDrilldown}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              {(['item', 'category', 'order_type'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBreakdownTab(tab)}
                  className={`px-4 py-2 text-sm font-medium ${
                    breakdownTab === tab
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'order_type' ? 'Order Type' : tab.charAt(0).toUpperCase() + tab.slice(1)}s
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {breakdownLoading ? (
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : breakdownError ? (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{breakdownError}</p>
                </div>
              ) : breakdownData?.rows && breakdownData.rows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {breakdownTab === 'order_type' ? 'Type' : 'Name'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {breakdownTab === 'order_type' ? 'Orders' : 'Quantity'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {breakdownData.rows.map((row, index) => (
                        <tr key={row.id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.label}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.qty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(row.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No data available for this period</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueSeries;