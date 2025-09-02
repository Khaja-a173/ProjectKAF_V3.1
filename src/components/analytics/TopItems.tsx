import { Trophy, TrendingUp } from 'lucide-react';

interface TopItem {
  menu_item_id: string;
  name: string;
  qty: number;
}

interface TopItemsData {
  window: string;
  items: TopItem[];
}

interface TopItemsProps {
  data: TopItemsData | null;
  loading: boolean;
  error: string | null;
}

export default function TopItems({ data, loading, error }: TopItemsProps) {
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Failed to load top items</div>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-500 mb-2">No sales data</div>
          <p className="text-sm text-gray-400">
            No items sold in selected window: {data?.window || '30d'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.menu_item_id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-600' :
                  'bg-blue-500'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">Menu Item</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{item.qty}</div>
                <div className="text-sm text-gray-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  sold
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}