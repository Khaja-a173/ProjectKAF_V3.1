import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, getErrorMessage } from '@/lib/api';
//import DashboardHeader from '../components/DashboardHeader';
import {
  Palette,
  Image as ImageIcon,
  Save,
  X,
  Globe
} from 'lucide-react';

// Lightweight HTTP helpers scoped to this page
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

async function sendJSON<T>(path: string, method: 'PUT' | 'PATCH' | 'POST', body: any, opts: { signal?: AbortSignal } = {}): Promise<T> {
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

// Branding API wrappers (accept either { branding } or the record directly)
async function fetchBranding(): Promise<BrandingData> {
  const data: any = await getJSON<any>('/branding');
  return (data?.branding ?? data) as BrandingData;
}

async function saveBranding(payload: Partial<BrandingData>): Promise<void> {
  // Prefer PUT to fully replace; backend can accept PATCH if implemented
  await sendJSON('/branding', 'PUT', payload);
}

interface BrandingData {
  id: string;
  tenant_id: string;
  logo_url?: string;
  hero_video_url?: string;
  theme: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  gallery_urls: string[];
  updated_at: string;
}

export default function Branding() {
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    logo_url: '',
    hero_video_url: '',
    theme: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#22c55e'
    },
    gallery_urls: [] as string[]
  });
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const brandingData = await fetchBranding();
      setBranding(brandingData);

      setFormData({
        logo_url: brandingData?.logo_url || '',
        hero_video_url: brandingData?.hero_video_url || '',
        theme: {
          primary: brandingData?.theme?.primary || '#2563eb',
          secondary: brandingData?.theme?.secondary || '#64748b',
          accent: brandingData?.theme?.accent || '#22c55e'
        },
        gallery_urls: brandingData?.gallery_urls || []
      });

      setError(null);
    } catch (err: any) {
      console.error('Failed to load branding:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveBranding(formData);
      await loadBranding();
      alert('Branding updated successfully!');
    } catch (err: any) {
      alert('Failed to update branding: ' + getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const addGalleryUrl = () => {
    if (newGalleryUrl.trim() && !formData.gallery_urls.includes(newGalleryUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        gallery_urls: [...prev.gallery_urls, newGalleryUrl.trim()]
      }));
      setNewGalleryUrl('');
    }
  };

  const removeGalleryUrl = (url: string) => {
    setFormData(prev => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter(u => u !== url)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading branding...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

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
            <Link to="/branding" className="text-purple-600 border-b-2 border-purple-600 pb-2 font-medium">
              Branding
            </Link>
          </div>
        </nav>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">Error loading branding: {error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Settings */}
          <div className="space-y-8">
            {/* Logo & Media */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Logo & Media
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Video URL</label>
                  <input
                    type="url"
                    value={formData.hero_video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_video_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/hero-video.mp4"
                  />
                </div>
              </div>
            </div>

            {/* Theme Colors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Theme Colors
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.primary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, primary: e.target.value }
                      }))}
                      className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme.primary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, primary: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.secondary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, secondary: e.target.value }
                      }))}
                      className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme.secondary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, secondary: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.theme.accent}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, accent: e.target.value }
                      }))}
                      className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.theme.accent}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, accent: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery URLs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Gallery Images
              </h3>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    onClick={addGalleryUrl}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.gallery_urls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700 truncate">{url}</span>
                      <button
                        onClick={() => removeGalleryUrl(url)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-8">
            {/* Color Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Color Preview</h3>
              
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div
                    className="w-16 h-16 rounded-lg shadow-sm"
                    style={{ backgroundColor: formData.theme.primary }}
                  ></div>
                  <div
                    className="w-16 h-16 rounded-lg shadow-sm"
                    style={{ backgroundColor: formData.theme.secondary }}
                  ></div>
                  <div
                    className="w-16 h-16 rounded-lg shadow-sm"
                    style={{ backgroundColor: formData.theme.accent }}
                  ></div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: formData.theme.primary }}>
                  <h4 className="text-white font-semibold">Primary Color</h4>
                  <p className="text-white/80 text-sm">Used for buttons and highlights</p>
                </div>
              </div>
            </div>

            {/* Logo Preview */}
            {formData.logo_url && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Logo Preview</h3>
                <div className="text-center">
                  <img
                    src={formData.logo_url}
                    alt="Logo Preview"
                    className="max-w-full h-24 object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Gallery Preview */}
            {formData.gallery_urls.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Gallery Preview</h3>
                <div className="grid grid-cols-2 gap-4">
                  {formData.gallery_urls.slice(0, 4).map((url, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}