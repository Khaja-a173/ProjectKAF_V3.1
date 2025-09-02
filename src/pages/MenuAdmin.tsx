import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Local API helpers (decouple from ../lib/api to avoid missing exports)
import { subscribeMenuItems } from '../lib/realtime';
import DashboardHeader from '../components/DashboardHeader';
import {
  Plus,
  Search,
  Upload,
  Edit,
  Trash2,
  Image as ImageIcon,
  Clock,
  X,
  Save
} from 'lucide-react';

// --- Local API helpers for Menu Admin ---
const API_BASE = import.meta.env.VITE_API_URL || '';

function authHeaders(): Record<string, string> {
  // Try both storage locations commonly used in the app
  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...authHeaders()
    },
    credentials: 'include'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `GET ${path} failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function apiJSON<T>(path: string, body: any, method: 'POST' | 'PUT' | 'PATCH' = 'POST'): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(body),
    credentials: 'include'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${method} ${path} failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

type CategoriesResponse = { categories: Array<{ id: string; name: string; description?: string; sort_order?: number; is_active?: boolean }> };
type ItemsResponse = { items: Array<any> };

async function getMenuCategories(): Promise<CategoriesResponse> {
  // Server route assumed: GET /menu/categories
  return apiGet<CategoriesResponse>('/menu/categories');
}

async function getMenuItems(): Promise<ItemsResponse> {
  // Server route assumed: GET /menu/items
  return apiGet<ItemsResponse>('/menu/items');
}

async function createMenuCategory(payload: { name: string; description?: string; sort_order?: number }): Promise<any> {
  // Server route assumed: POST /menu/categories
  return apiJSON('/menu/categories', payload, 'POST');
}

async function createMenuItem(payload: any): Promise<any> {
  // Server route assumed: POST /menu/items
  return apiJSON('/menu/items', payload, 'POST');
}

async function updateMenuItem(id: string, payload: any): Promise<any> {
  // Server route assumed: PATCH /menu/items/:id
  return apiJSON(`/menu/items/${id}`, payload, 'PATCH');
}

async function bulkImportMenuItems(csv: string): Promise<{ created: number; errors: Array<any> }> {
  // Server route assumed: POST /menu/items/bulk
  return apiJSON('/menu/items/bulk', { csv }, 'POST');
}
// --- End local helpers ---

interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  image_url?: string;
  video_url?: string;
  is_available: boolean;
  is_featured: boolean;
  preparation_time?: number;
  calories?: number;
  categories?: {
    name: string;
  };
}

export default function MenuAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const subscription = subscribeMenuItems('550e8400-e29b-41d4-a716-446655440000', (payload) => {
      console.log('Menu update:', payload);
      loadData(); // Refresh on any change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, itemsResponse] = await Promise.all([
        getMenuCategories(),
        getMenuItems()
      ]);
      setCategories(
        (categoriesResponse.categories ?? []).map(c => ({
          id: c.id,
          name: c.name,
          description: c.description ?? '',
          sort_order: c.sort_order ?? 0,
          is_active: c.is_active ?? true,
        }))
      );
      setItems(itemsResponse.items || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load menu data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const rawName = formData.get('name');
      const rawDesc = formData.get('description');
      const rawSort = formData.get('sort_order');
      const sort_order = typeof rawSort === 'string' && rawSort !== '' ? Number(rawSort) : undefined;

      const name = typeof rawName === 'string' ? rawName.trim() : '';
      const description =
        typeof rawDesc === 'string' && rawDesc.trim() !== '' ? rawDesc.trim() : undefined;

      await createMenuCategory({
        name,
        description,
        sort_order
      });
      
      setShowCategoryModal(false);
      loadData();
    } catch (err: any) {
      alert('Failed to create category: ' + err.message);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const rawCategoryId = formData.get('category_id');
      const rawName = formData.get('name');
      const rawDesc = formData.get('description');
      const rawPrice = formData.get('price');
      const rawCost = formData.get('cost');
      const rawImage = formData.get('image_url');
      const rawVideo = formData.get('video_url');
      const rawPrep  = formData.get('preparation_time');
      const rawCal   = formData.get('calories');

      const category_id = typeof rawCategoryId === 'string' ? rawCategoryId : '';
      const name = typeof rawName === 'string' ? rawName : '';
      const description = typeof rawDesc === 'string' && rawDesc.trim() !== '' ? rawDesc : undefined;

      const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : NaN;
      if (Number.isNaN(price)) {
        throw new Error('Price is required and must be a number.');
      }

      const cost = typeof rawCost === 'string' && rawCost !== ''
        ? parseFloat(rawCost)
        : undefined;

      const image_url = typeof rawImage === 'string' && rawImage.trim() !== '' ? rawImage : undefined;
      const video_url = typeof rawVideo === 'string' && rawVideo.trim() !== '' ? rawVideo : undefined;

      const preparation_time = typeof rawPrep === 'string' && rawPrep !== ''
        ? (parseInt(rawPrep, 10) || undefined)
        : undefined;
      const calories = typeof rawCal === 'string' && rawCal !== ''
        ? (parseInt(rawCal, 10) || undefined)
        : undefined;

      const is_available = formData.get('is_available') === 'on';
      const is_featured  = formData.get('is_featured') === 'on';

      const itemData = {
        category_id,
        name,
        description,
        price,
        cost,
        image_url,
        video_url,
        is_available,
        is_featured,
        preparation_time,
        calories
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData);
      } else {
        await createMenuItem(itemData);
      }
      
      setShowItemModal(false);
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      alert('Failed to save item: ' + err.message);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const csvVal = formData.get('csv');
    const csv = typeof csvVal === 'string' ? csvVal : '';
    
    try {
      const response = await bulkImportMenuItems(csv);
      alert(`Bulk import complete: ${response.created} items created, ${response.errors.length} errors`);
      setShowBulkModal(false);
      loadData();
    } catch (err: any) {
      alert('Failed to bulk import: ' + err.message);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Menu Management" subtitle="Manage categories and menu items" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Menu Management" subtitle="Manage categories and menu items" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">
              Orders
            </Link>
            <Link to="/menu" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
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
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Category</span>
              </button>
              <button
                onClick={() => setShowItemModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Item</span>
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Import</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">Error loading menu: {error}</div>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute top-2 right-2 flex space-x-1">
                  {item.is_featured && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">Featured</span>
                  )}
                  {!item.is_available && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">Unavailable</span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-lg font-bold text-green-600">{Number(item.price).toFixed(2)}</span>
                </div>

                {item.description && (
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{item.categories?.name}</span>
                  <div className="flex items-center space-x-2">
                    {item.preparation_time && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.preparation_time}m</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowItemModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.is_available}
                      onChange={async (e) => {
                        try {
                          await updateMenuItem(item.id, { is_available: e.target.checked });
                          loadData();
                        } catch (err: any) {
                          alert('Failed to update availability');
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Category</h3>
                <button onClick={() => setShowCategoryModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Category name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Category description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Create</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create/Edit Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingItem ? 'Edit Item' : 'Create Menu Item'}
                </h3>
                <button onClick={() => { setShowItemModal(false); setEditingItem(null); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      defaultValue={editingItem?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      name="category_id"
                      required
                      defaultValue={editingItem?.category_id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingItem?.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingItem?.price}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                    <input
                      name="cost"
                      type="number"
                      step="0.01"
                      defaultValue={editingItem?.cost}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      name="image_url"
                      type="url"
                      defaultValue={editingItem?.image_url}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                    <input
                      name="video_url"
                      type="url"
                      defaultValue={editingItem?.video_url}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (min)</label>
                    <input
                      name="preparation_time"
                      type="number"
                      defaultValue={editingItem?.preparation_time}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                    <input
                      name="calories"
                      type="number"
                      defaultValue={editingItem?.calories}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      name="is_available"
                      type="checkbox"
                      defaultChecked={editingItem?.is_available ?? true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      name="is_featured"
                      type="checkbox"
                      defaultChecked={editingItem?.is_featured}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowItemModal(false); setEditingItem(null); }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingItem ? 'Update' : 'Create'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bulk Import CSV</h3>
                <button onClick={() => setShowBulkModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleBulkImport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV Data (name,price,cost,category)
                  </label>
                  <textarea
                    name="csv"
                    rows={8}
                    required
                    placeholder="name,price,cost,category&#10;Margherita Pizza,12.99,5.50,Appetizers&#10;Caesar Salad,8.99,3.25,Appetizers"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}