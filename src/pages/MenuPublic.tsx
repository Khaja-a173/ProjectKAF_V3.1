import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE, getErrorMessage } from '@/lib/api';
import { ShoppingCart, Plus, Minus, AlertCircle } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category_name: string;
  is_available: boolean;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
}

interface CartItem {
  menu_item_id: string;
  qty: number;
  note?: string;
  item: MenuItem;
}

// ---------------- Local HTTP helpers (scoped to this file only) ----------------
async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const text = await res.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  return data as T;
}

async function sendJSON<T>(path: string, method: 'POST' | 'PUT' | 'PATCH', body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
  return data as T;
}

// ---------------- Minimal API wrappers (resilient to endpoint variants) ----------------
async function fetchPublicMenu(tenantCode: string): Promise<{ categories: Category[]; items: MenuItem[] }> {
  // Try common variants in order
  try {
    return await getJSON(`/menu/public/${encodeURIComponent(tenantCode)}`);
  } catch {
    try {
      const q = new URLSearchParams({ tenant_code: tenantCode });
      return await getJSON(`/menu/public?${q.toString()}`);
    } catch {
      // Fallback: generic /menu with tenant param
      const q = new URLSearchParams({ tenant_code: tenantCode });
      return await getJSON(`/menu?${q.toString()}`);
    }
  }
}

async function createCartSafe(payload: any): Promise<{ cart_id: string }> {
  // Primary: POST /cart with items
  try {
    return await sendJSON('/cart', 'POST', payload);
  } catch (e1) {
    // Fallback: POST /cart/start then (best-effort) bulk add items
    const startBody: any = {
      mode: payload?.order_type || 'dine_in',
      table_id: payload?.table_id,
    };
    const started = await sendJSON<{ cart_id: string }>('/cart/start', 'POST', startBody);

    // Best-effort bulk add items (ignore errors to not block navigation)
    try {
      if (Array.isArray(payload?.items) && payload.items.length > 0) {
        await sendJSON('/cart/items/bulk', 'POST', { cart_id: started.cart_id, items: payload.items });
      }
    } catch {}

    return started;
  }
}

export default function MenuPublic() {
  const { tenantCode } = useParams<{ tenantCode: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const ENABLE_CART_CHECKOUT = import.meta.env.VITE_ENABLE_CART_CHECKOUT === 'true';

  useEffect(() => {
    if (tenantCode) {
      loadMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantCode]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPublicMenu(tenantCode!);
      setCategories(data.categories || []);
      setItems(data.items || []);

      if ((data.categories || []).length > 0) {
        setSelectedCategory(data.categories[0].id);
      }
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    if (!ENABLE_CART_CHECKOUT) return;

    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.menu_item_id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      } else {
        return [...prev, { menu_item_id: item.id, qty: 1, item }];
      }
    });
  };

  const updateCartQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.menu_item_id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.menu_item_id === itemId ? { ...item, qty } : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (Number(item.item.price || 0) * item.qty), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.qty, 0);
  };

  const handleCheckout = async () => {
    if (!ENABLE_CART_CHECKOUT || cart.length === 0) return;

    try {
      const qrContext = JSON.parse(sessionStorage.getItem('qr_context') || '{}');

      const cartData = {
        items: cart.map((item) => ({
          menu_item_id: item.menu_item_id,
          qty: item.qty,
          note: item.note,
        })),
        order_type: 'dine_in',
        table_id: qrContext.table?.id,
        tenant_code: tenantCode,
      };

      const result = await createCartSafe(cartData);
      // Our Cart page expects a `?cart=` query parameter
      navigate(`/cart?cart=${result.cart_id}`);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to create cart');
    }
  };

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category_id === selectedCategory)
    : items;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Menu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadMenu}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          {ENABLE_CART_CHECKOUT && getCartItemCount() > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {getCartItemCount()} items in cart
              </span>
              <button
                onClick={handleCheckout}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Cart (${getCartTotal().toFixed(2)})
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const cartItem = cart.find((c) => c.menu_item_id === item.id);
            const quantity = cartItem?.qty || 0;

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    )}
                    <p className="text-lg font-bold text-indigo-600 mt-2">
                      ${Number(item.price || 0).toFixed(2)}
                    </p>
                    {!item.is_available && (
                      <p className="text-red-500 text-sm mt-1">Currently unavailable</p>
                    )}
                  </div>

                  {ENABLE_CART_CHECKOUT && item.is_available && (
                    <div className="ml-4">
                      {quantity === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, quantity - 1)}
                            className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, quantity + 1)}
                            className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No items available in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}