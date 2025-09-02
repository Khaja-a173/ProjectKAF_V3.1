import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  listPaymentProviders,
  createTenantPaymentProvider,
  updateTenantPaymentProvider,
  type PaymentProvider as ApiPaymentProvider,
  getErrorMessage,
} from '@/lib/api';
import {
  CreditCard,
  Save,
  AlertTriangle,
  CheckCircle,
  Globe,
  TestTube,
  Eye,
  EyeOff,
  Smartphone,
  Wallet,
  DollarSign,
  Landmark
} from 'lucide-react';

// --- UI Config (normalized view over provider records) ---
export type Provider = 'stripe' | 'razorpay' | 'mock';

type UiConfig = {
  configured: boolean;
  provider: Provider;
  live_mode: boolean;
  currency: string;
  enabled_methods: string[];
  publishable_key?: string;
  secret_key?: string; // local only when user types; we only store last4 in server config
};

function providerToUi(p: ApiPaymentProvider | undefined): UiConfig {
  if (!p) {
    return {
      configured: false,
      provider: 'mock',
      live_mode: false,
      currency: 'USD',
      enabled_methods: ['cash'],
      publishable_key: '',
      secret_key: ''
    };
  }
  const cfg = (p.config || {}) as Record<string, any>;
  return {
    configured: !!p.enabled,
    provider: (p.provider as Provider) || 'mock',
    live_mode: !!cfg.is_live,
    currency: cfg.default_currency || cfg.currency || 'USD',
    enabled_methods: Array.isArray(cfg.enabled_methods) ? cfg.enabled_methods : ['cash'],
    publishable_key: cfg.publishable_key || '',
    secret_key: '', // never hydrate from server
  };
}

export default function AdminPayments() {
  const [cfg, setCfg] = useState<UiConfig>(providerToUi(undefined));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [existing, setExisting] = useState<ApiPaymentProvider[]>([]);

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      setError(null);
      const providers = await listPaymentProviders();
      setExisting(providers || []);

      // Prefer an enabled provider; else first provider; else default cfg
      const preferred =
        providers?.find((p) => p.enabled) ||
        providers?.[0];

      setCfg(providerToUi(preferred));
    } catch (err: any) {
      console.error('Failed to load payment providers:', err);
      setError(getErrorMessage(err) || 'Failed to load payment providers');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payloadConfig: Record<string, any> = {
        display_name: `${cfg.provider[0].toUpperCase()}${cfg.provider.slice(1)} ${cfg.live_mode ? 'Live' : 'Test'}`,
        publishable_key: cfg.publishable_key || undefined,
        secret_last4: cfg.secret_key ? cfg.secret_key.slice(-4) : undefined,
        is_live: !!cfg.live_mode,
        default_currency: cfg.currency || 'USD',
        enabled_methods: cfg.enabled_methods || ['cash'],
      };

      // Do we already have a record for this provider?
      const existingForProvider = existing.find((p) => p.provider === cfg.provider);

      if (existingForProvider) {
        await updateTenantPaymentProvider(existingForProvider.id, {
          config: payloadConfig,
          enabled: true,
        });
      } else {
        await createTenantPaymentProvider({
          provider: cfg.provider,
          config: payloadConfig,
          enabled: true,
        });
      }

      await loadConfig();
      setSuccess('Payment configuration saved successfully!');
      // clear local secret input
      setCfg((p) => ({ ...p, secret_key: '' }));
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  function toggleMethod(method: string) {
    setCfg((prev) => ({
      ...prev,
      enabled_methods: prev.enabled_methods.includes(method)
        ? prev.enabled_methods.filter((m) => m !== method)
        : [...prev.enabled_methods, method]
    }));
  }

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet },
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'cash', name: 'Cash', icon: DollarSign },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: Landmark }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple shared header (no external dependency) */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
            Payment Settings
          </h1>
          <p className="text-sm text-gray-600 mt-1">Configure payment providers and methods</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">
              Orders
            </Link>
            <Link to="/settings" className="text-gray-500 hover:text-gray-700 pb-2">
              Settings
            </Link>
            <Link to="/admin/payments" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Payments
            </Link>
          </div>
        </nav>

        {/* Configuration Status */}
        <div
          className={`rounded-xl p-6 mb-8 ${
            cfg.configured ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            {cfg.configured ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <h3 className={`font-semibold ${cfg.configured ? 'text-green-900' : 'text-yellow-900'}`}>
                {cfg.configured ? 'Payment Provider Configured' : 'Payment Provider Not Configured'}
              </h3>
              <p className={`text-sm ${cfg.configured ? 'text-green-800' : 'text-yellow-800'}`}>
                {cfg.configured
                  ? `Using ${cfg.provider} in ${cfg.live_mode ? 'live' : 'test'} mode`
                  : 'Configure a payment provider to start accepting payments'}
              </p>
            </div>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">Error: {error}</div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="text-green-800">{success}</div>
          </div>
        )}

        {/* Configuration Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Payment Configuration</h2>

          <div className="space-y-8">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Payment Provider</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'mock', name: 'Mock Provider', desc: 'For testing and development', icon: TestTube },
                  { id: 'stripe', name: 'Stripe', desc: 'Global payment processing', icon: CreditCard },
                  { id: 'razorpay', name: 'Razorpay', desc: 'India-focused payments', icon: Globe }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setCfg((prev) => ({ ...prev, provider: p.id as Provider }))}
                    className={`p-4 border-2 rounded-xl transition-colors text-left ${
                      cfg.provider === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <p.icon className={`w-6 h-6 ${cfg.provider === p.id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Environment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Environment Mode</label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!cfg.live_mode}
                    onChange={() => setCfg((prev) => ({ ...prev, live_mode: false }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center space-x-2">
                    <TestTube className="w-4 h-4 text-yellow-600" />
                    <span>Test Mode</span>
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={cfg.live_mode}
                    onChange={() => setCfg((prev) => ({ ...prev, live_mode: true }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    <span>Live Mode</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
              <select
                value={cfg.currency}
                onChange={(e) => setCfg((prev) => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Enabled Payment Methods</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {paymentMethods.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      cfg.enabled_methods.includes(m.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={cfg.enabled_methods.includes(m.id)}
                      onChange={() => toggleMethod(m.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <m.icon
                        className={`w-5 h-5 ${
                          cfg.enabled_methods.includes(m.id) ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-900">{m.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* API Keys (only for real providers) */}
            {cfg.provider !== 'mock' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                  <input
                    type="text"
                    value={cfg.publishable_key}
                    onChange={(e) => setCfg((prev) => ({ ...prev, publishable_key: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`pk_${cfg.live_mode ? 'live' : 'test'}_...`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                  <div className="relative">
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      value={cfg.secret_key}
                      onChange={(e) => setCfg((prev) => ({ ...prev, secret_key: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`sk_${cfg.live_mode ? 'live' : 'test'}_...`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Secret key is encrypted and only the last 4 digits are stored</p>
                </div>
              </div>
            )}

            {/* Mock Provider Info */}
            {cfg.provider === 'mock' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TestTube className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Mock Provider</h4>
                </div>
                <p className="text-sm text-blue-800">
                  The mock provider simulates payment processing for testing and development. All transactions are approved without real charges.
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Test Payment Section */}
        {cfg.configured && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Payment</h3>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Test Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: cfg.currency
                  }).format(25.0)}
                </span>
              </div>

              <div className="space-y-3">
                {cfg.enabled_methods.map((method) => (
                  <button
                    key={method}
                    className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900 capitalize">{method.replace('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}