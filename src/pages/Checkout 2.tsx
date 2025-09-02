import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPaymentIntent, confirmPaymentIntent, createPaymentSplits } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Wallet, 
  Clock, 
  CheckCircle,
  Users,
  Plus,
  Minus
} from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'upi' | 'wallet'>('card');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [splits, setSplits] = useState([{ amount: 0, method: 'card' as const }]);
  const [useSplitPayment, setUseSplitPayment] = useState(false);

  // Mock order data - in real app this would come from API
  const orderData = {
    id: orderId,
    number: 'ORD-123456',
    total: 48.60,
    subtotal: 45.00,
    tax: 3.60,
    items: [
      { name: 'Truffle Arancini', qty: 2, price: 16.00 },
      { name: 'Grilled Salmon', qty: 1, price: 13.00 }
    ]
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex'
    },
    {
      id: 'cash',
      name: 'Cash',
      icon: DollarSign,
      description: 'Pay at counter'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Google Pay, PhonePe, Paytm'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'Apple Pay, Samsung Pay'
    }
  ];

  const handlePayment = async () => {
    if (!orderId) return;

    try {
      setProcessing(true);

      if (useSplitPayment) {
        // Handle split payment
        const totalSplits = splits.reduce((sum, split) => sum + split.amount, 0);
        if (Math.abs(totalSplits - orderData.total) > 0.01) {
          alert('Split amounts must equal total order amount');
          return;
        }

        // Create payment intent for each split
        for (const split of splits) {
          const intent = await createPaymentIntent({
            order_id: orderId,
            amount: split.amount,
            method: split.method
          });
          
          // Confirm immediately in dev mode
          await confirmPaymentIntent(intent.payment_intent_id);
        }
      } else {
        // Single payment
        const intent = await createPaymentIntent({
          order_id: orderId,
          amount: orderData.total,
          method: paymentMethod
        });
        
        // Confirm immediately in dev mode
        await confirmPaymentIntent(intent.payment_intent_id);
      }

      setCompleted(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate(`/order-tracking?order=${orderId}`);
      }, 3000);

    } catch (err: any) {
      alert('Payment failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const addSplit = () => {
    setSplits([...splits, { amount: 0, method: 'card' }]);
  };

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      setSplits(splits.filter((_, i) => i !== index));
    }
  };

  const updateSplit = (index: number, field: 'amount' | 'method', value: any) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  if (completed) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. You'll be redirected to order tracking.
            </p>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-600">
                <p><strong>Order:</strong> {orderData.number}</p>
                <p><strong>Amount:</strong> ${orderData.total.toFixed(2)}</p>
                <p><strong>Method:</strong> {paymentMethod.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{item.qty}x {item.name}</span>
                  <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

            {/* Split Payment Toggle */}
            <div className="mb-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={useSplitPayment}
                  onChange={(e) => setUseSplitPayment(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900">Split Payment</span>
                <Users className="w-4 h-4 text-gray-500" />
              </label>
            </div>

            {useSplitPayment ? (
              /* Split Payment Interface */
              <div className="space-y-4 mb-6">
                {splits.map((split, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Split {index + 1}</span>
                      {splits.length > 1 && (
                        <button
                          onClick={() => removeSplit(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          value={split.amount}
                          onChange={(e) => updateSplit(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                        <select
                          value={split.method}
                          onChange={(e) => updateSplit(index, 'method', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="card">Card</option>
                          <option value="cash">Cash</option>
                          <option value="upi">UPI</option>
                          <option value="wallet">Wallet</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addSplit}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Payment</span>
                </button>

                <div className="text-sm text-gray-600">
                  Total splits: ${splits.reduce((sum, split) => sum + split.amount, 0).toFixed(2)} / ${orderData.total.toFixed(2)}
                </div>
              </div>
            ) : (
              /* Single Payment Interface */
              <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`w-full p-4 border-2 rounded-xl transition-colors text-left ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <method.icon className={`w-6 h-6 ${
                        paymentMethod === method.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  <span>Pay ${orderData.total.toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Secure payment processing • Dev mode simulation</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}