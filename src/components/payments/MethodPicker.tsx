import React from 'react';
import { CreditCard, DollarSign, Smartphone, Wallet, Building } from 'lucide-react';

type IconType = React.ComponentType<{ className?: string }>;

type PaymentMethodId = 'card' | 'cash' | 'upi' | 'wallet' | 'bank_transfer' | (string & {});

interface MethodPickerProps {
  /** ProjectKAF (main) prop */
  enabledMethods?: string[];
  /** Part2 prop */
  methods?: string[];
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  /** Optional — currently unused but kept for compatibility with main */
  currency?: string;
  /** Optional list of disabled providers */
  disabledProviders?: string[];
}

const METHOD_META: Record<string, { label: string; description?: string; Icon: IconType }> = {
  card: {
    label: 'Credit/Debit Card',
    description: 'Visa, Mastercard, Amex',
    Icon: CreditCard
  },
  cash: {
    label: 'Cash',
    description: 'Pay at counter',
    Icon: DollarSign
  },
  upi: {
    label: 'UPI',
    description: 'Google Pay, PhonePe, Paytm',
    Icon: Smartphone
  },
  wallet: {
    label: 'Digital Wallet',
    description: 'Apple Pay, Samsung Pay',
    Icon: Wallet
  },
  bank_transfer: {
    label: 'Bank Transfer',
    description: 'Pay via bank transfer',
    Icon: Building
  }
};

function normalizeLabel(method: string): string {
  if (METHOD_META[method]) return METHOD_META[method].label;
  // Fallback: Title Case unknown ids like "pay_later" -> "Pay Later"
  return method
    .replace(/[_-]+/g, ' ')
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

export default function MethodPicker(props: MethodPickerProps) {
  const { enabledMethods, methods, selectedMethod, onMethodSelect, disabledProviders } = props;

  // Accept both prop shapes; prefer explicit `methods` if provided
  const inputList = (methods && methods.length ? methods : enabledMethods) || [];

  // Map input ids to display info; keep unknowns with a sensible default icon/label
  let available = inputList
    .filter((id) => !(disabledProviders?.includes(id)))
    .map((id) => {
      const meta = METHOD_META[id] || { label: normalizeLabel(id), Icon: CreditCard, description: undefined };
      return { id: id as PaymentMethodId, ...meta };
    });

  if (available.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-800 mb-2 font-medium">No payment methods configured</div>
        <p className="text-sm text-yellow-700">Contact the restaurant admin to configure payment methods.</p>
      </div>
    );
  }

  const SelectedIcon = selectedMethod ? (METHOD_META[selectedMethod]?.Icon || CreditCard) : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>

      <div className="space-y-3">
        {available.map((method) => {
          const Icon = METHOD_META[method.id]?.Icon || CreditCard;
          const isActive = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => onMethodSelect(method.id)}
              className={`w-full p-4 border-2 rounded-xl transition-colors text-left ${
                isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <div className="font-medium text-gray-900">{method.label}</div>
                  {method.description && <div className="text-sm text-gray-500">{method.description}</div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            Selected:&nbsp;
            {METHOD_META[selectedMethod]?.label || normalizeLabel(selectedMethod)}
          </div>
        </div>
      )}
    </div>
  );
}