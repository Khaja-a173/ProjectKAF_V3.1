import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, getErrorMessage } from '@/lib/api';
import { subscribeOrders } from '@/lib/realtime';
import DashboardHeader from '../components/DashboardHeader';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  DollarSign,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  menu_items: {
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  kitchen_state: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  special_instructions?: string;
  created_at: string;
  ready_at?: string;
  served_at?: string;
  order_items: Array<OrderItem>;
  restaurant_tables?: {
    table_number: string;
  };
  customers?: {
    first_name: string;
    last_name: string;
  };
}

// ---------------- Local HTTP helpers (scoped to this file) ----------------
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

async function sendJSON<T>(path: string, method: 'POST' | 'PATCH' | 'PUT', body: any, opts: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  const text = await res.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  return data as T;
}

async function postJSON<T>(path: string, body?: any, opts: { signal?: AbortSignal } = {}): Promise<T> {
  return sendJSON<T>(path, 'POST', body ?? {}, opts);
}

// ---------------- Minimal Orders API wrappers ----------------
async function apiGetOrders(params: { since?: string } = {}): Promise<Order[]> {
  const q = new URLSearchParams();
  if (params.since) q.set('since', params.since);
  const data: any = await getJSON<any>(`/orders${q.toString() ? `?${q.toString()}` : ''}`);
  return Array.isArray(data) ? data as Order[] : (data?.orders ?? []);
}

async function apiUpdateOrder(orderId: string, patch: Partial<Order>): Promise<void> {
  await sendJSON(`/orders/${orderId}`, 'PATCH', patch);
}

async function apiCancelOrder(orderId: string): Promise<void> {
  // Prefer explicit cancel endpoint; fallback to DELETE if available
  try {
    await postJSON(`/orders/${orderId}/cancel`, {});
  } catch {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) {
      const text = await res.text();
      let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
      throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
    }
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadOrders();
    
    // Subscribe to real-time updates (tenant-aware)
    const tenantId = localStorage.getItem('tenant_id') || undefined;
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      if (tenantId && typeof subscribeOrders === 'function') {
        subscription = subscribeOrders(tenantId, () => {
          Promise.resolve().then(loadOrders);
        });
      }
    } catch (e) {
      console.warn('Orders realtime subscription not available:', e);
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const list = await apiGetOrders({ since: '24h' });
      setOrders(list || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await apiUpdateOrder(orderId, { status } as any);
      loadOrders(); // Refresh after update
    } catch (err: any) {
      alert('Failed to update order: ' + getErrorMessage(err));
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await apiCancelOrder(orderId);
      loadOrders(); // Refresh after cancel
    } catch (err: any) {
      alert('Failed to cancel order: ' + getErrorMessage(err));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-gray-100 text-gray-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'served': return <CheckCircle className="w-4 h-4" />;
      case 'paid': return <DollarSign className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const q = searchTerm.toLowerCase();
    const num = (order.order_number || '').toLowerCase();
    const table = (order.restaurant_tables?.table_number || '').toLowerCase();
    const matchesSearch = num.includes(q) || table.includes(q);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Order Management" subtitle="Manage and track all orders" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Order Management" subtitle="Manage and track all orders" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/orders" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Orders
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu
            </Link>
            <Link to="/tables" className="text-gray-500 hover:text-gray-700 pb-2">
              Tables
            </Link>
            <Link to="/staff" className="text-gray-500 hover:text-gray-700 pb-2">
              Staff
            </Link>
            <Link to="/kds" className="text-gray-500 hover:text-gray-700 pb-2">
              Kitchen
            </Link>
            <Link to="/branding" className="text-gray-500 hover:text-gray-700 pb-2">
              Branding
            </Link>
          </div>
        </nav>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Order</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">Error loading orders: {error}</div>
            <button
              onClick={loadOrders}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">No orders match your current filters.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                    <p className="text-sm text-gray-500">
                      {order.restaurant_tables?.table_number || 'Takeaway'} • {order.order_type}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.menu_items.name}</span>
                      <span>${Number(item.total_price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.special_instructions && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> {order.special_instructions}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${Number(order.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Confirm
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'served')}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Mark Served
                    </button>
                  )}
                  {order.status === 'served' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'paid')}
                      className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                    >
                      Mark Paid
                    </button>
                  )}
                  {!['paid', 'cancelled'].includes(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}