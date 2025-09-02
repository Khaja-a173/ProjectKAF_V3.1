import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  window: string;
  granularity: string;
  series: Array<{
    label: string;
    revenue: string;
  }>;
  total: string;
}

interface RevenueChartProps {
  data: RevenueData | null;
  loading: boolean;
  error: string | null;
}

export default function RevenueChart({ data, loading, error }: RevenueChartProps) {
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-2">Failed to load revenue data</div>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  // Normalize data shape to handle backend responses safely
  const series = Array.isArray((data as any)?.series)
    ? (data as any).series
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];

  const chartData = series.map((item: any) => ({
    label: String(item.label ?? item.date ?? ''),
    revenue: parseFloat(item.revenue ?? item.amount ?? '0')
  }));

  const hasData = chartData.some((d: { revenue: number }) => d.revenue > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-lg font-bold text-green-600">
            ${data?.total || '0.00'}
          </div>
        </div>
      </div>

      <div className="h-80">
        {!hasData ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">No revenue data</div>
              <p className="text-sm text-gray-500">
                No data for selected window: {data?.window || '7d'}
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Format date labels
                  if (value.includes('-')) {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                  }
                  return value;
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                labelFormatter={(label) => {
                  if (typeof label === 'string' && label.includes('-')) {
                    const date = new Date(label);
                    return date.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  }
                  return label;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}