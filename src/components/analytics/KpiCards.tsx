import { TrendingUp, ShoppingCart, DollarSign, Users, Utensils } from 'lucide-react';

interface KpiData {
  orders: number;
  revenue: string;
  dine_in: number;
  takeaway: number;
}

interface KpiCardsProps {
  data: KpiData | null;
  loading: boolean;
  error: string | null;
}

export default function KpiCards({ data, loading, error }: KpiCardsProps) {
  const kpis = [
    {
      name: 'Total Orders',
      value: data?.orders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Revenue',
      value: data?.revenue ? `$${data.revenue}` : '$0.00',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Dine-in Orders',
      value: data?.dine_in || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Takeaway Orders',
      value: data?.takeaway || 0,
      icon: Utensils,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.name}</p>
                <p className="text-2xl font-bold text-red-600">Error</p>
              </div>
              <div className={`p-3 rounded-lg bg-red-100`}>
                <kpi.icon className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-red-600">Failed to load</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => (
        <div key={kpi.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{kpi.name}</p>
              {loading ? (
                <div className="mt-1">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">
              {loading ? (
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                'Live data'
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}