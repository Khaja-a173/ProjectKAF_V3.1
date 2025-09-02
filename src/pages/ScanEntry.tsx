import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE, getErrorMessage, setTenantId } from '@/lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { QrCode, Camera, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

// Local helpers aligned to our API contract
async function postJSON<T>(path: string, body: any, opts: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

// Expected shapes from backend
interface QRResolveResponse {
  tenant: { id: string; name: string };
  table: { id: string; table_number: string; capacity?: number };
  menu_bootstrap?: { items: Array<any> };
}

interface StartCartResponse { cart_id: string }

export default function ScanEntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QRResolveResponse | null>(null);

  // Extract QR parameters from URL
  const code = searchParams.get('code');
  const table = searchParams.get('table');

  useEffect(() => {
    if (code && table) {
      handleQRResolve();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, table]);

  const handleQRResolve = async () => {
    if (!code || !table) {
      setError('Invalid QR code parameters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1) Resolve the QR to a tenant/table context
      const response = await postJSON<QRResolveResponse>('/qr/resolve', { code, table });
      setQrData(response);

      // 2) Persist context locally for subsequent pages
      localStorage.setItem('tenant_id', response.tenant.id);
      localStorage.setItem('table_id', response.table.id);
      localStorage.setItem('table_number', response.table.table_number);

      // Also inform our API client about the tenant for headers
      setTenantId(response.tenant.id);

      // 3) Start a new cart session for this table (dine-in)
      const cartResponse = await postJSON<StartCartResponse>('/cart/start', {
        mode: 'dine_in',
        table_id: response.table.id,
      });
      localStorage.setItem('cart_id', cartResponse.cart_id);

      // 4) Redirect to menu with context
      setTimeout(() => {
        navigate(`/menu?cart=${cartResponse.cart_id}&table=${response.table.table_number}`);
      }, 1200);

    } catch (err: any) {
      console.error('QR resolve failed:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    navigate('/book-table');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing QR Code</h2>
            <p className="text-gray-600">Connecting you to {table}...</p>
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
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleQRResolve}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleManualEntry}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                Enter Manually
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (qrData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connected!</h2>
            <p className="text-gray-600 mb-2">Welcome to {qrData.tenant.name}</p>
            <p className="text-gray-600 mb-6">Table {qrData.table.table_number}</p>
            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Restaurant:</strong> {qrData.tenant.name}</p>
                <p><strong>Table:</strong> {qrData.table.table_number}</p>
                {typeof qrData.table.capacity !== 'undefined' && (
                  <p><strong>Capacity:</strong> {qrData.table.capacity} guests</p>
                )}
                <p><strong>Menu Items:</strong> {qrData.menu_bootstrap?.items?.length ?? 0} available</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Redirecting to menu...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Scanner</h2>
          <p className="text-gray-600 mb-6">
            Scan the QR code on your table to start ordering
          </p>
          <button
            onClick={handleManualEntry}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>Enter Table Manually</span>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}