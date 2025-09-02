import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import {
  ChefHat,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  BarChart3,
} from "lucide-react";

export default function Analytics() {
  // Preflight + dynamic analytics state
  const [isReady, setIsReady] = useState(false);
  const [summary, setSummary] = useState<{ revenue: string; orders: number }>({ revenue: "0.00", orders: 0 });
  const [metrics, setMetrics] = useState<Array<{ name: string; value: string; change: string; trend: "up" | "down" }>>([]);
  const [topItems, setTopItems] = useState<Array<{ name: string; orders: number; revenue: string }>>([]);
  const [hourlyData, setHourlyData] = useState<Array<{ hour: string; orders: number; revenue: number }>>([]);

  // Preflight to avoid UI stall
  useEffect(() => {
    let aborted = false;
    const ctrl = new AbortController();
    (async () => {
      try {
        await apiFetch('/auth/whoami');
        await apiFetch('/health/supabase');
      } catch (e) {
        console.warn('Analytics preflight warning:', e);
      } finally {
        if (!aborted) setIsReady(true);
      }
    })();
    return () => { aborted = true; ctrl.abort(); };
  }, []);

  // Load analytics once preflight is ready
  useEffect(() => {
    if (!isReady) return;
    let aborted = false;
    (async () => {
      try {
        // Summary
        const s: any = await apiFetch('/analytics/summary');
        if (!aborted) setSummary({ revenue: s.revenue ?? '0.00', orders: s.orders ?? 0 });

        // Revenue timeseries → derive hourly-like view (fallback if empty)
        const rt: any = await apiFetch('/analytics/revenue_timeseries?range=7d&interval=day');
        const series = Array.isArray(rt?.series) ? rt.series : [];
        const h = series.slice(-10).map((p: any, i: number) => ({
          hour: String(i).padStart(2, '0') + ':00',
          orders: Number(p.orders ?? 0),
          revenue: Number(p.revenue ?? 0),
        }));
        if (!aborted) setHourlyData(h);

        // Top items (if available in your API; otherwise skip)
        try {
          const ti: any = await apiFetch('/analytics/top-items');
          if (!aborted && ti && Array.isArray(ti.rows)) {
            setTopItems(
              ti.rows.map((r: any) => ({
                name: r.name ?? r.item_name ?? 'Item',
                orders: Number(r.count ?? r.orders ?? 0),
                revenue: String(r.revenue ?? '0.00'),
              }))
            );
          }
        } catch {}

        // Compose headline metrics
        if (!aborted) {
          setMetrics([
            { name: 'Revenue (7d)', value: `$${summary.revenue ?? '0.00'}`, change: '+0.0%', trend: 'up' },
            { name: 'Orders (7d)', value: String(summary.orders ?? 0), change: '+0.0%', trend: 'up' },
            { name: 'Avg Order Value', value: `$${(Number(summary.revenue ?? 0) / Math.max(1, Number(summary.orders ?? 0))).toFixed(2)}`, change: '+0.0%', trend: 'up' },
            { name: 'Customers', value: String(summary.orders ?? 0), change: '+0.0%', trend: 'up' },
          ]);
        }
      } catch (e) {
        console.error('Analytics load failed:', e);
      }
    })();
    return () => { aborted = true; };
  }, [isReady]);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Dashboard
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-gray-700 pb-2">
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
              to="/staff-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Staff Management
            </Link>
            <Link
              to="/admin/kitchen"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Kitchen Dashboard
            </Link>
            <Link
              to="/analytics"
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {metric.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    metric.trend === "up"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <TrendingUp
                    className={`w-6 h-6 ${metric.trend === "down" ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span
                  className={`text-sm font-medium ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  from yesterday
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hourly Performance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Today's Performance
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {hourlyData.map((data, index) => (
                    <div
                      key={data.hour}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600 w-12">
                          {data.hour}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(data.orders / 30) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {data.orders} orders
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          ${data.revenue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Selling Items
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.orders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.revenue}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Peak hours: 6-8 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Best margin: Desserts (67%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Avg table turnover: 1.2h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Avg prep time: 18 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
