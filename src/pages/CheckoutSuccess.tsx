// src/pages/CheckoutSuccess.tsx
import { Link, useLocation } from "react-router-dom";

export default function CheckoutSuccess() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("order_id") || "";
  const intentId = params.get("intent_id") || "";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Payment Successful 🎉</h1>
        {!!orderId && <p className="text-sm text-gray-600">Order ID: {orderId}</p>}
        {!!intentId && <p className="text-sm text-gray-600">Payment Intent: {intentId}</p>}
        <p className="text-gray-700">
          Thanks! Your order has been placed. You can track its progress in real time.
        </p>
        <div className="flex gap-3 justify-center">
          {orderId ? (
            <Link
              to={`/order/${orderId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Track Order
            </Link>
          ) : null}
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-900 rounded hover:bg-gray-200"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}