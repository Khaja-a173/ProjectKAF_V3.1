import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { API_BASE, getErrorMessage } from '@/lib/api';

// --- Local HTTP helper ---
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

// --- Safe peak hours fetcher (accept multiple backend shapes) ---
async function fetchPeakHours(range: string) {
  const q = new URLSearchParams({ range });
  const raw: any = await getJSON<any>(`/analytics/peak_hours_heatmap?${q.toString()}`);

  const rows: any[] = Array.isArray(raw?.rows)
    ? raw.rows
    : Array.isArray(raw?.data?.rows)
      ? raw.data.rows
      : Array.isArray(raw)
        ? raw
        : [];

  const normalized = rows.map((r: any) => ({
    weekday: Number(r.weekday ?? r.dow ?? r.day ?? 0),
    hour24: Number(r.hour24 ?? r.hour ?? 0),
    orders_count: Number(r.orders_count ?? r.count ?? r.orders ?? 0),
    revenue_total: String(r.revenue_total ?? r.revenue ?? r.amount_total ?? '0'),
  }));

  return { window: range, rows: normalized } as PeakHoursData;
}

interface PeakHoursProps {
  window: string;
  onRefresh?: () => void;
}

interface PeakHourRow {
  weekday: number;
  hour24: number;
  orders_count: number;
  revenue_total: string;
}

interface PeakHoursData {
  window: string;
  rows: PeakHourRow[];
}

const PeakHours: React.FC<PeakHoursProps> = ({ window: timeWindow, onRefresh }) => {
  const [data, setData] = useState<PeakHoursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPeakHours();
  }, [timeWindow]);

  const loadPeakHours = async () => {
    try {
      setLoading(true);
      setError(null);
      const peakHoursData = await fetchPeakHours(timeWindow);
      setData(peakHoursData);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to load peak hours');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount || '0');
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD'
    }).format(Number.isFinite(num) ? num : 0);
  };

  const getWeekdayName = (weekday: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[weekday] || 'Unknown';
  };

  const formatHour = (hour24: number) => {
    if (hour24 === 0) return '12 AM';
    if (hour24 < 12) return `${hour24} AM`;
    if (hour24 === 12) return '12 PM';
    return `${hour24 - 12} PM`;
  };

  // Create 7x24 grid data
  const createHeatmapGrid = () => {
    const grid: Array<Array<PeakHourRow | null>> = [];
    
    // Initialize 7x24 grid with nulls
    for (let day = 0; day < 7; day++) {
      grid[day] = new Array(24).fill(null);
    }
    
    // Fill grid with actual data
    if (data?.rows) {
      data.rows.forEach(row => {
        if (row.weekday >= 0 && row.weekday < 7 && row.hour24 >= 0 && row.hour24 < 24) {
          grid[row.weekday][row.hour24] = row;
        }
      });
    }
    
    return grid;
  };

  // Get max orders for color intensity
  const getMaxOrders = () => {
    if (!data?.rows) return 1;
    return Math.max(...data.rows.map(row => row.orders_count), 1);
  };

  // Get color intensity based on orders count
  const getCellColor = (ordersCount: number, maxOrders: number) => {
    if (ordersCount === 0) return 'bg-gray-50';
    const intensity = ordersCount / maxOrders;
    if (intensity > 0.8) return 'bg-blue-600';
    if (intensity > 0.6) return 'bg-blue-500';
    if (intensity > 0.4) return 'bg-blue-400';
    if (intensity > 0.2) return 'bg-blue-300';
    return 'bg-blue-200';
  };

  const getCellTextColor = (ordersCount: number, maxOrders: number) => {
    if (ordersCount === 0) return 'text-gray-400';
    const intensity = ordersCount / maxOrders;
    return intensity > 0.4 ? 'text-white' : 'text-gray-700';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-25 gap-1">
            {Array.from({ length: 7 * 24 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
        </div>
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const grid = createHeatmapGrid();
  const maxOrders = getMaxOrders();
  const hasData = data?.rows && data.rows.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No traffic in this window</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Hour labels */}
        <div className="grid grid-cols-25 gap-1 mb-2">
          <div className="text-xs text-gray-500"></div>
          {Array.from({ length: 24 }).map((_, hour) => (
            <div key={hour} className="text-xs text-gray-500 text-center">
              {hour === 0 ? '12A' : hour < 12 ? `${hour}A` : hour === 12 ? '12P' : `${hour-12}P`}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        {grid.map((dayRow, dayIndex) => (
          <div key={dayIndex} className="grid grid-cols-25 gap-1 mb-1">
            {/* Day label */}
            <div className="text-xs text-gray-500 flex items-center">
              {getWeekdayName(dayIndex)}
            </div>
            
            {/* Hour cells */}
            {dayRow.map((cell, hourIndex) => {
              const ordersCount = cell?.orders_count || 0;
              const revenue = cell?.revenue_total || '0';
              
              return (
                <div
                  key={hourIndex}
                  className={`h-6 rounded text-xs flex items-center justify-center cursor-pointer transition-colors ${getCellColor(ordersCount, maxOrders)} ${getCellTextColor(ordersCount, maxOrders)}`}
                  title={ordersCount > 0 ? `${formatHour(hourIndex)}: ${ordersCount} orders • ${formatCurrency(revenue)}` : `${formatHour(hourIndex)}: No activity`}
                >
                  {ordersCount > 0 ? ordersCount : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Less activity</span>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-50 rounded"></div>
          <div className="w-3 h-3 bg-blue-200 rounded"></div>
          <div className="w-3 h-3 bg-blue-300 rounded"></div>
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
        </div>
        <span>More activity</span>
      </div>
    </div>
  );
};

export default PeakHours;