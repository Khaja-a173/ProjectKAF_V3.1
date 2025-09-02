import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE, getErrorMessage, sendReceipt } from '@/lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package, 
  Truck, 
  DollarSign,
  Bell,
  MapPin,
  Users,
  Mail,
  MessageSquare
} from 'lucide-react';

// Local HTTP helper
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

// Resilient order status fetcher (tries common variants)
async function fetchOrderStatus(orderId: string) {
  try {
    // Preferred: GET /orders/:id
    return await getJSON<any>(`/orders/${orderId}`);
  } catch (e1) {
    try {
      // Variant A: GET /orders/status?order_id=...
      const q = new URLSearchParams({ order_id: orderId });
      return await getJSON<any>(`/orders/status?${q.toString()}`);
    } catch (e2) {
      // Variant B: GET /orders/track?order_id=...
      const q = new URLSearchParams({ order_id: orderId });
      return await getJSON<any>(`/orders/track?${q.toString()}`);
    }
  }
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReceipt, setSendingReceipt] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderStatus();
      
      // Set up polling for real-time updates
      const interval = setInterval(loadOrderStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const loadOrderStatus = async () => {
    try {
      setLoading(true);
      if (!orderId) throw new Error('Missing order id');
      const response = await fetchOrderStatus(orderId as string);
      setOrderStatus(response);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load order status:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendReceipt = async (channel: 'email' | 'sms') => {
    if (!orderId) return;
    setSendingReceipt(true);
    try {
      // ask destination based on channel
      const to =
        channel === 'email'
          ? (window.prompt('Enter email address to send the receipt:', '') || '').trim()
          : (window.prompt('Enter phone number (with country code) to send the receipt:', '') || '').trim();

      if (!to) {
        throw new Error(channel === 'email' ? 'Email is required' : 'Phone number is required');
      }

      // very light validation to avoid obvious mistakes
      if (channel === 'email' && !/^\S+@\S+\.\S+$/.test(to)) {
        throw new Error('Please enter a valid email address');
      }
      if (channel === 'sms' && !/^\+?\d[\d\s\-()]{6,}$/.test(to)) {
        throw new Error('Please enter a valid phone number');
      }

      await sendReceipt({
        order_id: orderId,
        channel,
        to,
      });
      setReceiptSent(true);
      setTimeout(() => setReceiptSent(false), 3000); // Hide confirmation after 3 seconds
    } catch (err: any) {
      alert('Failed to send receipt: ' + (err?.message || String(err)));
    } finally {
      setSendingReceipt(false);
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['new', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'paid'];
    return steps.indexOf(status);
  };

  const getStatusIcon = (status: string, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    
    if (isActive) {
      switch (status) {
        case 'new': return <Clock className="w-6 h-6 text-blue-600 animate-pulse" />;
        case 'pending': return <Clock className="w-6 h-6 text-blue-600 animate-pulse" />;
        case 'confirmed': return <CheckCircle className="w-6 h-6 text-blue-600 animate-pulse" />;
        case 'preparing': return <ChefHat className="w-6 h-6 text-orange-600 animate-pulse" />;
        case 'ready': return <Package className="w-6 h-6 text-green-600 animate-pulse" />;
        case 'served': return <Truck className="w-6 h-6 text-purple-600 animate-pulse" />;
        case 'paid': return <DollarSign className="w-6 h-6 text-emerald-600 animate-pulse" />;
        default: return <Clock className="w-6 h-6 text-gray-400" />;
      }
    }
    
    return <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>;
  };

  const statusSteps = [
    { key: 'new', name: 'Order Placed', description: 'Your order has been received' },
    { key: 'confirmed', name: 'Confirmed', description: 'Restaurant confirmed your order' },
    { key: 'preparing', name: 'Preparing', description: 'Kitchen is preparing your food' },
    { key: 'ready', name: 'Ready', description: 'Your order is ready for pickup' },
    { key: 'served', name: 'Served', description: 'Order delivered to your table' },
    { key: 'paid', name: 'Completed', description: 'Payment processed successfully' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order status...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !orderStatus) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error: {error || 'Order not found'}</div>
            <button
              onClick={() => (window.location.href = '/menu')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Menu
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStep = getStatusStep(String(orderStatus.current || orderStatus.status || 'new'));

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Order Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
            <p className="text-gray-600">Order {orderStatus.order_number || orderStatus.order_id.slice(-6)}</p>
            {orderStatus.table_number && (
              <div className="flex items-center justify-center space-x-2 mt-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Table {orderStatus.table_number}</span>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.key, isActive, isCompleted)}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={`flex-1 h-1 mx-4 ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  {statusSteps[currentStep]?.name || 'Processing'}
                </h3>
                <p className="text-blue-800">
                  {statusSteps[currentStep]?.description || 'Your order is being processed'}
                </p>
              </div>
            </div>
            
            {orderStatus.estimated_ready_time && (
              <div className="mt-4 text-sm text-blue-800">
                <Clock className="w-4 h-4 inline mr-1" />
                Estimated ready time: {new Date(orderStatus.estimated_ready_time).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Order Items (mock data for now) */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {orderStatus.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">
                    {item.quantity}x {item.menu_items?.name}
                  </span>
                  <span className="text-gray-600">${Number(item.total_price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total (mock data for now) */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Amount</span>
              <span className="text-green-600">${Number(orderStatus.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Receipt Actions */}
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => handleSendReceipt('email')}
              disabled={sendingReceipt}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>Email Receipt</span>
            </button>
            <button
              onClick={() => handleSendReceipt('sms')}
              disabled={sendingReceipt}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS Receipt</span>
            </button>
          </div>
          {receiptSent && (
            <p className="text-center text-sm text-green-600 mt-2">Receipt sent!</p>
          )}

          {/* Auto-refresh indicator */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Updates automatically every 5 seconds</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}