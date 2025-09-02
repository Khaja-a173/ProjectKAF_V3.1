import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import {
  listPaymentProviders,
  createTenantPaymentProvider,
  updateTenantPaymentProvider,
  type PaymentProvider as ApiPaymentProvider,
  getErrorMessage,
} from '@/lib/api';

// UI type aligned to API
// ApiPaymentProvider shape: { id, tenant_id, provider: 'stripe'|'razorpay'|'mock', enabled: boolean, config: Record<string, any> }

type ProviderName = 'stripe' | 'razorpay' | 'mock';

type PaymentProvider = ApiPaymentProvider & {
  // convenience accessors (derived at runtime)
  config: {
    display_name?: string;
    publishable_key?: string;
    secret_last4?: string;
    is_live?: boolean;
    webhook_url?: string;
    default_currency?: string;
    [key: string]: any;
  };
};

const PROVIDER_OPTIONS: Array<{ value: ProviderName; label: string; description: string }> = [
  { value: 'stripe', label: 'Stripe', description: 'Global payment processing' },
  { value: 'razorpay', label: 'Razorpay', description: 'India-focused payments' },
  { value: 'mock', label: 'Mock (Testing)', description: 'For development only' },
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
  { value: 'INR', label: 'Indian Rupee (INR)', symbol: '₹' },
  { value: 'AED', label: 'UAE Dirham (AED)', symbol: 'د.إ' },
  { value: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$' },
  { value: 'SAR', label: 'Saudi Riyal (SAR)', symbol: '﷼' },
];

export default function PaymentSettings() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<PaymentProvider | null>(null);

  const [formData, setFormData] = useState({
    provider: 'stripe' as ProviderName,
    display_name: '',
    publishable_key: '',
    secret_key: '', // we will never store full secret; we only derive last4
    webhook_url: '',
    is_live: false,
    is_enabled: true,
    currency: 'USD',
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listPaymentProviders(); // returns PaymentProvider[]
      setProviders((data as PaymentProvider[]) || []);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to load payment providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      const secret_last4 = formData.secret_key ? formData.secret_key.slice(-4) : undefined;

      const config = {
        display_name: formData.display_name || `${formData.provider[0].toUpperCase()}${formData.provider.slice(1)} ${formData.is_live ? 'Live' : 'Test'}`,
        publishable_key: formData.publishable_key || undefined,
        secret_last4,
        is_live: !!formData.is_live,
        webhook_url: formData.webhook_url || undefined,
        default_currency: formData.currency || 'USD',
      };

      if (editingProvider) {
        await updateTenantPaymentProvider(editingProvider.id, {
          config,
          enabled: !!formData.is_enabled,
        });
        setSuccess('Payment provider updated successfully!');
      } else {
        await createTenantPaymentProvider({
          provider: formData.provider,
          config,
          enabled: !!formData.is_enabled,
        });
        setSuccess('Payment provider added successfully!');
      }

      await loadProviders();
      resetForm();
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to save payment provider');
    }
  };

  const handleEdit = (provider: PaymentProvider) => {
    setEditingProvider(provider);
    setFormData({
      provider: provider.provider as ProviderName,
      display_name: provider.config?.display_name || '',
      publishable_key: provider.config?.publishable_key || '',
      secret_key: '', // never prefill
      webhook_url: provider.config?.webhook_url || '',
      is_live: !!provider.config?.is_live,
      is_enabled: !!provider.enabled,
      currency: provider.config?.default_currency || 'USD',
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      provider: 'stripe',
      display_name: '',
      publishable_key: '',
      secret_key: '',
      webhook_url: '',
      is_live: false,
      is_enabled: true,
      currency: 'USD',
    });
    setEditingProvider(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-indigo-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
                  <p className="mt-1 text-gray-600">Configure payment providers and processing options</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{editingProvider ? 'Edit Payment Provider' : 'Add Payment Provider'}</h3>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">×</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Provider Type</label>
                      <select
                        value={formData.provider}
                        onChange={(e) => setFormData((prev) => ({ ...prev, provider: e.target.value as ProviderName }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={!!editingProvider}
                      >
                        {PROVIDER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} - {option.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                      <input
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                        placeholder="e.g., Stripe Live, Razorpay Test"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {CURRENCIES.map((currency) => (
                          <option key={currency.value} value={currency.value}>
                            {currency.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_live}
                          onChange={(e) => setFormData((prev) => ({ ...prev, is_live: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Live Mode</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_enabled}
                          onChange={(e) => setFormData((prev) => ({ ...prev, is_enabled: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enabled</span>
                      </label>
                    </div>
                  </div>

                  {formData.provider !== 'mock' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                        <input
                          type="text"
                          value={formData.publishable_key}
                          onChange={(e) => setFormData((prev) => ({ ...prev, publishable_key: e.target.value }))}
                          placeholder={`Enter your ${formData.provider} publishable key`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                        <input
                          type="password"
                          value={formData.secret_key}
                          onChange={(e) => setFormData((prev) => ({ ...prev, secret_key: e.target.value }))}
                          placeholder={editingProvider ? 'Leave blank to keep current key' : `Enter your ${formData.provider} secret key`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">We store only the last 4 digits for display. Never store full secrets client-side.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={formData.webhook_url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, webhook_url: e.target.value }))}
                          placeholder="https://your-domain.com/webhooks/payments"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {editingProvider ? 'Update Provider' : 'Add Provider'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Providers List */}
            <div className="space-y-4">
              {providers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No payment providers configured</p>
                  <p className="mt-1">Add a payment provider to start accepting payments</p>
                </div>
              ) : (
                providers.map((provider) => (
                  <div key={provider.id} className={`border rounded-lg p-4 ${provider.enabled ? 'border-indigo-200 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${provider.enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{provider.config?.display_name || provider.provider}</h3>
                          <p className="text-sm text-gray-500">
                            {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)} •{provider.config?.is_live ? ' Live Mode' : ' Test Mode'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={!!provider.enabled}
                            onChange={async (e) => {
                              try {
                                await updateTenantPaymentProvider(provider.id, { enabled: e.target.checked });
                                await loadProviders();
                              } catch (err: any) {
                                setError(getErrorMessage(err) || 'Failed to update provider');
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                          />
                          Enabled
                        </label>
                      </div>
                    </div>

                    {(provider.config?.publishable_key || provider.config?.secret_last4) && (
                      <div className="mt-3 text-sm text-gray-600">
                        {provider.config?.publishable_key && (
                          <p>Publishable Key: {provider.config.publishable_key.slice(0, 12)}...</p>
                        )}
                        {provider.config?.secret_last4 && <p>Secret Key: ****{provider.config.secret_last4}</p>}
                      </div>
                    )}

                    <div className="mt-3">
                      <button
                        onClick={() => handleEdit(provider)}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}