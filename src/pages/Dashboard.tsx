import { Link } from "react-router-dom";
import { useAccessControl } from "../contexts/AccessControlContext";
import { useState, useEffect } from "react";
import { apiFetch, getErrorMessage } from "@/lib/api";
import KpiCards from "../components/analytics/KpiCards";
import RevenueChart from "../components/analytics/RevenueChart";
import TopItems from "../components/analytics/TopItems";
import { Protected } from "../lib/authGuard";
import {
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  ChefHat,
  Settings,
  Bell,
  Search,
  Menu as MenuIcon,
  Grid3X3,
  UserCog,
  LogOut,
} from "lucide-react";

// Quick Links config (uses existing lucide-react imports only)
const QUICK_LINKS: Array<{ to: string; label: string; icon: any; desc?: string }> = [
  { to: '/dashboard', label: 'Overview', icon: TrendingUp, desc: 'KPIs & trends' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, desc: 'Revenue & funnel' },
  { to: '/orders', label: 'Orders', icon: ShoppingCart, desc: 'All orders' },
  { to: '/menu-management', label: 'Menu', icon: MenuIcon, desc: 'Items & categories' },
  { to: '/table-management', label: 'Tables', icon: Grid3X3, desc: 'Seating & sessions' },
  { to: '/kds', label: 'KDS', icon: ChefHat, desc: 'Kitchen display' },
  { to: '/payments', label: 'Payments', icon: DollarSign, desc: 'Providers & intents' },
  { to: '/receipts', label: 'Receipts', icon: Bell, desc: 'Delivery history' },
  { to: '/staff', label: 'Staff', icon: Users, desc: 'Team & invites' },
  { to: '/branding', label: 'Branding', icon: Settings, desc: 'Theme & assets' },
  { to: '/qr', label: 'QR Codes', icon: Search, desc: 'Scan & entry' },
  { to: '/checkout', label: 'Checkout', icon: ShoppingCart, desc: 'POS flow' },
];

// Map routes to access-control keys (only guarded ones listed)
const LINK_GUARDS: Record<string, string> = {
  '/analytics': 'REPORTS_VIEW',
  '/orders': 'LIVE_ORDERS_VIEW',
  '/menu-management': 'MENU_VIEW',
  '/table-management': 'TABLES_VIEW',
  '/kds': 'KITCHEN_VIEW',
  '/payments': 'PAYMENTS_VIEW',
  '/receipts': 'RECEIPTS_VIEW',
  '/staff': 'STAFF_VIEW',
  '/branding': 'CUSTOMIZATION_VIEW',
  '/qr': 'QR_VIEW',
  '/checkout': 'CHECKOUT_VIEW',
};

const __DEV_BYPASS_PROTECTED__ = import.meta?.env?.MODE === 'development' || process.env.NODE_ENV === 'development';

// --- Local HTTP helper ---
async function getJSON<T>(path: string, opts: { signal?: AbortSignal } = {}): Promise<T> {
  return await apiFetch<T>(path, { signal: opts.signal });
}

// --- Analytics endpoint wrappers (decouple from lib export names) ---
async function revenueTimeseriesSafe(params: { range: string; interval: string }) {
  const q = new URLSearchParams({ range: params.range, interval: params.interval });
  return await getJSON<any>(`/analytics/revenue_timeseries?${q.toString()}`);
}

async function paymentConversionFunnelSafe(params: { range: string }) {
  const q = new URLSearchParams({ range: params.range });
  return await getJSON<any>(`/analytics/payment_conversion_funnel?${q.toString()}`);
}

async function orderFulfillmentTimelineSafe(params: { range: string }) {
  const q = new URLSearchParams({ range: params.range });
  return await getJSON<any>(`/analytics/order_fulfillment_timeline?${q.toString()}`);
}

// --- Local analytics shims (preserve old names without touching other files) ---

type WindowKey = '7d' | '30d' | '90d' | 'mtd' | 'qtd' | 'ytd';

function mapWindowToRange(win: string): '7d' | '30d' | '90d' {
  // Our backend exposes 7d/30d/90d; fold others to closest sensible default.
  if (win === '7d') return '7d';
  if (win === '30d' || win === 'mtd' || win === 'qtd') return '30d';
  return '90d';
}

async function getSummary(win: WindowKey) {
  const range = mapWindowToRange(win);
  const [seriesResp, funnelResp, fulfillmentResp] = await Promise.all([
    revenueTimeseriesSafe({ range, interval: 'day' }),
    paymentConversionFunnelSafe({ range }),
    orderFulfillmentTimelineSafe({ range })
  ]);

  // Normalize timeseries → array of points
  const seriesPoints: any[] = Array.isArray((seriesResp as any)?.series)
    ? (seriesResp as any).series
    : Array.isArray((seriesResp as any)?.data)
      ? (seriesResp as any).data
      : Array.isArray(seriesResp as any)
        ? (seriesResp as any)
        : [];

  const totalMinor = seriesPoints.reduce((acc: number, p: any) => {
    const val = Number(
      p?.revenue ?? p?.total_minor ?? p?.amount_minor ?? p?.total_cents ?? 0
    );
    return acc + (Number.isFinite(val) ? val : 0);
  }, 0);
  const totalRevenue = totalMinor / 100;

  // Normalize funnel → rows[]
  const funnelRows: any[] = Array.isArray((funnelResp as any)?.rows)
    ? (funnelResp as any).rows
    : Array.isArray(funnelResp as any)
      ? (funnelResp as any)
      : [];

  let successRate: number | null = null;
  try {
    const map: Record<string, number> = {};
    funnelRows.forEach((s: any) => {
      const key = String(s.stage || s.name || '').toLowerCase();
      const val = Number(s.value ?? s.count ?? 0);
      map[key] = val;
    });
    const initiated = map['initiated'] || map['created'] || 0;
    const succeeded = map['succeeded'] || 0;
    successRate = initiated > 0 ? (succeeded / initiated) * 100 : null;
  } catch {}

  // Normalize fulfillment → rows[] and compute approximate avg time
  const fulfillRows: any[] = Array.isArray((fulfillmentResp as any)?.rows)
    ? (fulfillmentResp as any).rows
    : Array.isArray(fulfillmentResp as any)
      ? (fulfillmentResp as any)
      : [];

  let avgOrderTimeMin: number | null = null;
  try {
    const prepare = fulfillRows.find((s: any) => String(s.step || s.name).toLowerCase().includes('prepare'));
    const delivery = fulfillRows.find((s: any) => {
      const k = String(s.step || s.name).toLowerCase();
      return k.includes('serve') || k.includes('complete') || k.includes('deliver');
    });
    const p50 = (delivery?.p50_ms ?? prepare?.p50_ms);
    if (typeof p50 === 'number') avgOrderTimeMin = Math.round(p50 / 60000);
  } catch {}

  return { totalRevenue, successRate, avgOrderTimeMin };
}

async function getRevenue(win: WindowKey, _granularity: 'day' | 'week' | 'month') {
  const range = mapWindowToRange(win);
  const resp = await revenueTimeseriesSafe({ range, interval: 'day' });
  const series: any[] = Array.isArray((resp as any)?.series)
    ? (resp as any).series
    : Array.isArray((resp as any)?.data)
      ? (resp as any).data
      : Array.isArray(resp as any)
        ? (resp as any)
        : [];
  return series;
}

async function getTopItems(win: WindowKey, limit = 10) {
  // Not available in our current API surface; return an empty list so <TopItems /> renders fallback state.
  return [] as Array<{ name: string; qty: number; revenue: number }>;
}

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [topItemsData, setTopItemsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<WindowKey>('7d');
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  const { canAccessDashboard, currentUser, switchUser, users } =
    useAccessControl();

  // Preflight: ensure auth + health are ok so the dashboard doesn't stall
  useEffect(() => {
    let aborted = false;
    const ctrl = new AbortController();
    (async () => {
      try {
        await getJSON('/auth/whoami', { signal: ctrl.signal });
        await getJSON('/health/supabase', { signal: ctrl.signal });
      } catch (e) {
        // In dev we soft-fail so the rest of the dashboard can proceed
        console.warn('Preflight checks failed (continuing in dev):', e);
      }
      if (!aborted) {
        // nothing else to do; analytics loader will run in the other effect
      }
    })();
    return () => {
      aborted = true;
      ctrl.abort();
    };
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeWindow, granularity]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fan out to all analytics endpoints (summary derived locally for resiliency)
      const [summary, revenue, topItems] = await Promise.all([
        getSummary(timeWindow),
        getRevenue(timeWindow, granularity),
        getTopItems(timeWindow, 10)
      ]);

      setSummaryData(summary);
      setRevenueData(revenue);
      setTopItemsData(topItems);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: "Total Revenue",
      value: "$45,231",
      change: "+20.1%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      name: "Orders Today",
      value: "156",
      change: "+12.5%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      name: "Active Tables",
      value: "24/32",
      change: "+5.2%",
      icon: Users,
      color: "text-purple-600",
    },
    {
      name: "Avg Order Time",
      value: "18 min",
      change: "-2.1%",
      icon: Clock,
      color: "text-orange-600",
    },
  ];

  const isAllowed = (to: string) => {
    const guard = LINK_GUARDS[to as keyof typeof LINK_GUARDS];
    // While access control is still resolving (no currentUser yet), don't hide tiles
    if (!currentUser) return true;
    return guard ? canAccessDashboard(guard) : true;
  };
  const recentOrders = [
    {
      id: "#1234",
      table: "Table 5",
      items: 3,
      total: "$45.50",
      status: "Preparing",
      time: "5 min ago",
    },
    {
      id: "#1235",
      table: "Table 2",
      items: 2,
      total: "$28.75",
      status: "Ready",
      time: "8 min ago",
    },
    {
      id: "#1236",
      table: "Table 8",
      items: 4,
      total: "$67.25",
      status: "Served",
      time: "12 min ago",
    },
    {
      id: "#1237",
      table: "Table 1",
      items: 1,
      total: "$15.50",
      status: "Pending",
      time: "15 min ago",
    },
  ];
  const PageBody = () => (
    <div className="min-h-screen bg-gray-50">

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {(() => {
            const filtered = QUICK_LINKS.filter(({ to }) => isAllowed(to));
            const data = filtered.length ? filtered : QUICK_LINKS;
            return data.map(({ to, label, icon: Icon, desc }) => (
              <Link
                key={to}
                to={to}
                className="group border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-shadow hover:shadow-sm p-4 flex items-start space-x-3"
              >
                <div className="rounded-lg bg-blue-50 p-2">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-700">{label}</div>
                  {desc ? <div className="text-sm text-gray-500 mt-0.5">{desc}</div> : null}
                </div>
              </Link>
            ));
          })()}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
            >
              Dashboard
            </Link>
            <Link to="/menu-management" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu Management
            </Link>
            <Link
              to="/orders"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Orders
            </Link>
            <Link
              to="/table-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Table Management
            </Link>
            <Link
              to="/analytics"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Analytics
            </Link>
            <Link
              to="/settings"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Settings
            </Link>
          </div>
        </nav>

        {/* Analytics Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Business Analytics</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Window:</label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value as WindowKey)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="mtd">Month to Date</option>
                  <option value="qtd">Quarter to Date</option>
                  <option value="ytd">Year to Date</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Granularity:</label>
                <select
                  value={granularity}
                  onChange={(e) => setGranularity(e.target.value as 'day' | 'week' | 'month')}
                  disabled={timeWindow === '7d'}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <KpiCards data={summaryData} loading={loading} error={error} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} loading={loading} error={error} />
          </div>

          {/* Top Items */}
          <div>
            <TopItems data={topItemsData} loading={loading} error={error} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  from last week
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.table} • {order.items} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {order.total}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              order.status === "Ready"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Preparing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "Served"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {order.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {canAccessDashboard("MENU_VIEW") && (
                  <Link
                    to="/menu-management"
                    className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <MenuIcon className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-blue-900">
                      Menu Management
                    </span>
                  </Link>
                )}
                {canAccessDashboard("LIVE_ORDERS_VIEW") && (
                  <Link
                    to="/orders"
                    className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-green-900">
                      Order Management
                    </span>
                  </Link>
                )}
                {canAccessDashboard("TABLES_VIEW") && (
                  <Link
                    to="/table-management"
                    className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Grid3X3 className="w-5 h-5 text-indigo-600 mr-3" />
                    <span className="font-medium text-indigo-900">
                      Table Management
                    </span>
                  </Link>
                )}
                {canAccessDashboard("STAFF_VIEW") && (
                  <Link
                    to="/staff"
                    className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Users className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-medium text-purple-900">
                      Staff Management
                    </span>
                  </Link>
                )}
                {canAccessDashboard("KITCHEN_VIEW") && (
                  <Link
                    to="/kds"
                    className="flex items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <ChefHat className="w-5 h-5 text-red-600 mr-3" />
                    <span className="font-medium text-red-900">
                      Kitchen Dashboard
                    </span>
                  </Link>
                )}
                {canAccessDashboard("CUSTOMIZATION_VIEW") && (
                  <Link
                    to="/branding"
                    className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-medium text-purple-900">
                      Branding & Customization
                    </span>
                  </Link>
                )}
                {canAccessDashboard("REPORTS_VIEW") && (
                  <Link
                    to="/analytics"
                    className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-medium text-purple-900">
                      Analytics
                    </span>
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Today's Performance
              </h3>
              <p className="text-blue-100 mb-4">
                Your restaurant is performing 15% better than yesterday!
              </p>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue Goal</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-white rounded-full h-2"
                    style={{ width: "78%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return __DEV_BYPASS_PROTECTED__ ? (
    <PageBody />
  ) : (
    <Protected>
      <PageBody />
    </Protected>
  );
}