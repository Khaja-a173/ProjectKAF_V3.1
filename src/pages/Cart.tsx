import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE, getErrorMessage } from '@/lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Clock } from 'lucide-react';

// ---- Local HTTP helpers (scoped to this page; no impact on shared API) ----
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

async function del(path: string, opts: { signal?: AbortSignal } = {}): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
    signal: opts.signal,
  });
  if (!res.ok) {
    const text = await res.text();
    let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  }
}

// ---- Minimal server adapters (matches our backend routes) ----
async function fetchCart(cartId: string) {
  // Supports either GET /cart/:id → cart or GET /cart?cart_id=
  try {
    return await getJSON<any>(`/cart/${cartId}`);
  } catch {
    return await getJSON<any>(`/cart?cart_id=${encodeURIComponent(cartId)}`);
  }
}

async function patchCartItem(itemId: string, patch: { qty: number }) {
  // Expected: PATCH /cart/items/:itemId { qty }
  return await sendJSON<any>(`/cart/items/${itemId}`, 'PATCH', patch);
}

async function deleteCartItem(itemId: string) {
  // Expected: DELETE /cart/items/:itemId
  await del(`/cart/items/${itemId}`);
}

async function createOrderFromCart(cartId: string, mode: 'dine_in' | 'takeaway') {
  // Server contract: POST /checkout { cart_id, mode } → { order_id }
  return await sendJSON<{ order_id: string }>(`/checkout`, 'POST', { cart_id: cartId, mode });
}

export default function Cart() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cartId = searchParams.get('cart');
  
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [orderMode, setOrderMode] = useState<'dine_in' | 'takeaway'>('dine_in');

  useEffect(() => {
    if (cartId) {
      loadCart();
    } else {
      setError('No cart session found');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId]);

  const loadCart = async () => {
    if (!cartId) return;

    try {
      setLoading(true);
      const response = await fetchCart(cartId);
      setCart(response);
      setOrderMode(response?.mode || 'dine_in');
      setError(null);
    } catch (err: any) {
      console.error('Failed to load cart:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (!cartId) return;
    if (newQty <= 0) {
      return handleRemoveItem(itemId);
    }

    try {
      await patchCartItem(itemId, { qty: newQty });
      // Re-fetch cart to ensure totals are consistent with server logic
      await loadCart();
    } catch (err: any) {
      alert('Failed to update quantity: ' + getErrorMessage(err));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!cartId) return;
    try {
      await deleteCartItem(itemId);
      await loadCart();
    } catch (err: any) {
      alert('Failed to remove item: ' + getErrorMessage(err));
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartId || !cart?.items?.length) return;

    try {
      setPlacing(true);
      const response = await createOrderFromCart(cartId, orderMode);
      navigate(`/order-tracking?order=${response.order_id}`);
    } catch (err: any) {
      alert('Failed to place order: ' + getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <button
              onClick={() => navigate('/menu')}
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

  const items = cart?.items || [];
  const totals = cart?.totals || { subtotal: 0, tax: 0, total: 0 };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-gray-600">
                {cart?.table_id ? `Table ${cart.table_id}` : 'Takeaway Order'} • {items.length} items
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some delicious items to get started</p>
              <button
                onClick={() => navigate('/menu')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-8">
                {items.map((item: any) => (
                  <div key={item.menu_item_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600">${Number(item.price || 0).toFixed(2)} each</p>
                        {item.notes && (
                          <p className="text-sm text-orange-600">Note: {item.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.menu_item_id, item.qty - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.menu_item_id, item.qty + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ${((Number(item.price) || 0) * item.qty).toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.menu_item_id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Mode Selection */}
              <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Order Type</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setOrderMode('dine_in')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      orderMode === 'dine_in'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium">Dine In</div>
                      <div className="text-sm opacity-75">Eat at the restaurant</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setOrderMode('takeaway')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                      orderMode === 'takeaway'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium">Takeaway</div>
                      <div className="text-sm opacity-75">Take your order to go</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${Number(totals.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${Number(totals.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">${Number(totals.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {placing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Estimated preparation time: 15-20 minutes
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}