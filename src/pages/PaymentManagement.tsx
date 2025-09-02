import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getPaymentProviders,
  createPaymentProvider,
  updatePaymentProvider,
  listPaymentIntents,
  createPaymentIntent,
  listPaymentEvents,
  type PaymentProvider as ApiPaymentProvider,
  type PaymentIntent as ApiPaymentIntent,
  type PaymentEvent as ApiPaymentEvent,
  getErrorMessage,
} from "@/lib/api";
import DashboardHeader from '../components/DashboardHeader';
import {
  CreditCard,
  Plus,
  Globe,
  TestTube,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Save,
  X,
} from 'lucide-react';

// UI-facing types mapped from API types
type PaymentProvider = ApiPaymentProvider;
interface PaymentIntent extends ApiPaymentIntent {
  currency?: string;
}
interface PaymentEventUI extends ApiPaymentEvent {
  provider?: string; // derived from the intent when available
}

export default function PaymentManagement() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [intents, setIntents] = useState<PaymentIntent[]>([]);
  const [events, setEvents] = useState<PaymentEventUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'providers' | 'intents' | 'events'>('providers');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<PaymentProvider | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [providersResp, intentsResp] = await Promise.all([
        getPaymentProviders(),
        listPaymentIntents(),
      ]);

      const intentsList = intentsResp?.data ?? [];
      setProviders(providersResp || []);
      setIntents(intentsList as PaymentIntent[]);

      // Build a quick map of intentId -> provider for UI
      const providerByIntent = new Map<string, string>();
      intentsList.forEach((i) => providerByIntent.set(i.id, i.provider));

      // Fetch recent events per intent (cap to 20 to avoid over-fetch)
      const intentsToFetch = intentsList.slice(0, 20);
      const eventsArrays = await Promise.all(
        intentsToFetch.map(async (i) => {
          try {
            const evts = await listPaymentEvents(i.id);
            return evts.map((e) => ({ ...e, provider: providerByIntent.get(e.intent_id) }));
          } catch {
            return [] as PaymentEventUI[];
          }
        })
      );
      const flatEvents = ([] as PaymentEventUI[]).concat(...eventsArrays);

      setEvents(flatEvents);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load payment data:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const provider = String(formData.get('provider') || '');
      if (!provider) throw new Error('Provider is required');

      const enabled = formData.get('is_enabled') === 'on';
      const config: Record<string, any> = {
        display_name: (formData.get('display_name') || undefined) as string | undefined,
        publishable_key: (formData.get('publishable_key') || undefined) as string | undefined,
        secret_last4: (formData.get('secret_last4') || undefined) as string | undefined,
        is_live: formData.get('is_live') === 'on',
      };

      await createPaymentProvider({ provider: provider as any, config, enabled });

      setShowProviderModal(false);
      await loadData();
    } catch (err: any) {
      alert('Failed to create provider: ' + getErrorMessage(err));
    }
  };

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const amountDisplay = parseFloat(String(formData.get('amount') || '0'));
      const orderId = String(formData.get('order_id') || '');
      const method = String(formData.get('method') || '') || undefined;

      if (!orderId) throw new Error('Order ID is required');
      if (!amountDisplay || amountDisplay <= 0) throw new Error('Amount must be greater than 0');

      const amountCents = Math.round(amountDisplay * 100);

      await createPaymentIntent({
        order_id: orderId,
        amount: amountCents,
        method,
      });

      setShowIntentModal(false);
      await loadData();
    } catch (err: any) {
      alert('Failed to create payment intent: ' + getErrorMessage(err));
    }
  };

  const handleToggleProvider = async (
    provider: PaymentProvider,
    field: 'enabled',
    value: boolean
  ) => {
    try {
      if (field === 'enabled') {
        await updatePaymentProvider(provider.id, { enabled: value });
      }
      await loadData();
    } catch (err: any) {
      alert('Failed to update provider: ' + getErrorMessage(err));
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return '💳';
      case 'razorpay':
        return '🏦';
      default:
        return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requires_confirmation':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requires_confirmation':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Activity className="w-4 h-4" />;
      case 'succeeded':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'canceled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Payment Management" subtitle="Manage payment providers and transactions" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Payment Management" subtitle="Manage payment providers and transactions" />

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
            <Link to="/menu-admin" className="text-gray-500 hover:text-gray-700 pb-2">
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
            <Link to="/payments" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Payments
            </Link>
          </div>
        </nav>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'providers'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Payment Providers
            </button>
            <button
              onClick={() => setActiveTab('intents')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'intents'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Payment Intents
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'events'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Webhook Events
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">Error loading payment data: {error}</div>
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Payment Providers</h3>
                <button
                  onClick={() => setShowProviderModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Provider</span>
                </button>
              </div>
            </div>

            {providers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment providers</h3>
                <p className="text-gray-600 mb-6">Add your first payment provider to start accepting payments</p>
                <button
                  onClick={() => setShowProviderModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Provider
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <div key={provider.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getProviderIcon(provider.provider)}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {(provider.config as any)?.display_name || provider.provider}
                          </h4>
                          <p className="text-sm text-gray-500 capitalize">{provider.provider}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingProvider(provider)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Environment</span>
                        <div className="flex items-center space-x-2">
                          {(provider.config as any)?.is_live ? (
                            <div className="flex items-center space-x-1">
                              <Globe className="w-3 h-3 text-green-600" />
                              <span className="text-sm text-green-600">Live</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <TestTube className="w-3 h-3 text-yellow-600" />
                              <span className="text-sm text-yellow-600">Test</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={provider.enabled}
                            onChange={(e) => handleToggleProvider(provider, 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      {(provider.config as any)?.publishable_key && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          Key: {(provider.config as any).publishable_key.substring(0, 12)}...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Intents Tab */}
        {activeTab === 'intents' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Payment Intents</h3>
                <button
                  onClick={() => setShowIntentModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Intent</span>
                </button>
              </div>
            </div>

            {intents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment intents</h3>
                <p className="text-gray-600">Payment intents will appear here when created</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {intents.map((intent) => (
                        <tr key={intent.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {intent.id.substring(0, 8)}...
                            </div>
                            {intent.order_id && (
                              <div className="text-sm text-gray-500">Order: {intent.order_id.substring(0, 8)}...</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {(intent.currency || 'USD').toUpperCase()} {(intent.amount / 100).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getProviderIcon(intent.provider)}</span>
                              <span className="text-sm text-gray-900 capitalize">{intent.provider}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(intent.status)}`}>
                              {getStatusIcon(intent.status)}
                              <span className="ml-1 capitalize">{String(intent.status).replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {intent.created_at ? new Date(intent.created_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Webhook Events</h3>

            {events.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No webhook events</h3>
                <p className="text-gray-600">Webhook events from payment providers will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getProviderIcon(event.provider || 'mock')}</span>
                        <div>
                          <div className="font-medium text-gray-900">{event.type}</div>
                          <div className="text-sm text-gray-500 capitalize">{event.provider || 'provider'}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.created_at ? new Date(event.created_at).toLocaleString() : '-'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono overflow-x-auto">
                      {JSON.stringify(event.payload ?? {}, null, 2).substring(0, 400)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Provider Modal */}
        {showProviderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Payment Provider</h3>
                <button onClick={() => setShowProviderModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProvider} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                  <select
                    name="provider"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select provider</option>
                    <option value="stripe">Stripe</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="mock">Mock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    name="display_name"
                    type="text"
                    placeholder="e.g., Main Stripe Account"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                  <input
                    name="publishable_key"
                    type="text"
                    placeholder="pk_test_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key (Last 4)</label>
                  <input
                    name="secret_last4"
                    type="text"
                    placeholder="...1234"
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      name="is_live"
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Live Mode</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      name="is_enabled"
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enabled</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowProviderModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Add Provider</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Intent Modal */}
        {showIntentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Payment Intent</h3>
                <button onClick={() => setShowIntentModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateIntent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="25.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                  <input
                    name="order_id"
                    type="text"
                    required
                    placeholder="Related order UUID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Method (optional)</label>
                  <input
                    name="method"
                    type="text"
                    placeholder="card | upi | wallet | cash"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowIntentModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Intent</span>
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