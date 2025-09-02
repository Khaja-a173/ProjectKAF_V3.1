import React, { useState } from 'react';
import { createPaymentIntent, confirmPaymentIntent, getErrorMessage } from '@/lib/api';
import { CreditCard, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

interface PayButtonProps {
  amount: number;
  currency: string;
  orderId?: string;
  method: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  disabledProviders?: string[];
}

export default function PayButton({
  amount,
  currency,
  orderId,
  method,
  onSuccess,
  onError,
  disabled = false,
  disabledProviders,
}: PayButtonProps) {
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatAmount = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const handlePayment = async () => {
    if (processing || disabled) return;

    if (disabledProviders?.includes(method)) {
      const msg = 'Selected payment method is disabled by admin.';
      setErrorMsg(msg);
      onError?.(msg);
      return;
    }

    try {
      setProcessing(true);
      setStatus('processing');
      setErrorMsg(null);

      // 1) Create payment intent (single-payment flow)
      if (!orderId) {
        throw new Error('Missing order ID for payment');
      }
      const intentResponse: any = await createPaymentIntent({
        order_id: orderId as string,
        amount,
        method,
      });

      if (!intentResponse || intentResponse.error) {
        const statusCode = intentResponse?.status;
        if (statusCode === 501) {
          const msg = 'Payment provider not configured yet. Please contact restaurant admin.';
          setErrorMsg(msg);
          onError?.(msg);
          setStatus('error');
          return;
        }
        throw new Error(intentResponse?.message || 'Failed to create payment intent');
      }

      const intentId = intentResponse.intent_id || intentResponse.id;
      if (!intentId) {
        throw new Error('Missing payment intent id');
      }

      // 2) Confirm payment intent (mock auto-succeeds; real providers will redirect/SDK in later phase)
      const confirmResponse: any = await confirmPaymentIntent(intentId);

      if (confirmResponse?.success || confirmResponse?.status === 'succeeded') {
        setStatus('success');
        onSuccess?.({
          transaction_id: confirmResponse.transaction_id || confirmResponse.charge_id || intentId,
          amount,
          currency,
          method,
        });
        setTimeout(() => { window.location.href = '/checkout/success'; }, 1200);
        return;
      }

      // If backend uses provider split, surface helpful message
      if (confirmResponse?.status === 501 || confirmResponse?.error_code === 'PROVIDER_NOT_CONFIGURED') {
        const msg = 'Payment provider not configured yet. Please contact restaurant admin.';
        setErrorMsg(msg);
        onError?.(msg);
        setStatus('error');
        return;
      }

      // Fallback generic failure
      throw new Error(confirmResponse?.message || 'Payment confirmation failed');
    } catch (err: any) {
      console.error('Payment failed:', err);
      const msg = getErrorMessage ? getErrorMessage(err) : (err?.message || 'Payment processing failed');
      setErrorMsg(msg);
      onError?.(msg);
      setStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Payment Successful</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-5 h-5" />
            <span>Try Again</span>
          </>
        );
      default:
        return (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pay {formatAmount(amount, currency)}</span>
          </>
        );
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 text-sm">{errorMsg}</p>
            {errorMsg.includes('not configured') && (
              <p className="text-red-600 text-xs mt-1">
                The restaurant needs to configure their payment provider in the admin settings.
              </p>
            )}
          </div>
        </div>
      )}

      {status === 'success' ? (
        <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
          <span className="text-green-700 font-medium">Payment Successful!</span>
        </div>
      ) : (
        <button
          onClick={handlePayment}
          disabled={disabled || processing || !method || disabledProviders?.includes(method)}
          className={`w-full py-4 px-6 rounded-xl text-white font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
        >
          {getButtonContent()}
        </button>
      )}

      {method === 'card' && !processing && !errorMsg && (
        <p className="text-sm text-gray-500 text-center">
          Card payment requires provider configuration by the restaurant admin.
        </p>
      )}
    </div>
  );
}