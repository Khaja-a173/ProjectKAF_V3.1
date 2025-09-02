import { useState } from "react";
import { SessionCart, CartItem } from "../types/session";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Clock,
  Leaf,
  Flame,
  Edit,
  X,
} from "lucide-react";

interface SessionCartProps {
  cart: SessionCart | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPlaceOrder: () => void;
  onEditItem?: (item: CartItem) => void;
  disabled?: boolean;
}

// Currency exponent helper
const CURRENCY_EXPONENTS: Record<string, number> = {
  KWD: 3,
  BHD: 3,
  OMR: 3, // 3 decimal places
  JPY: 0,
  KRW: 0, // 0 decimal places
  // Default: 2 decimal places for INR, AUD, USD, EUR, etc.
};

const getCurrencyExponent = (currency: string): number => {
  return CURRENCY_EXPONENTS[currency] ?? 2;
};

// Safe money formatter using minor units
const formatMoney = (
  amountMinor: number | undefined,
  currency: string = "INR",
): string => {
  const safeAmount = Number.isFinite(amountMinor) ? amountMinor! : 0;
  const exponent = getCurrencyExponent(currency);
  const majorAmount = safeAmount / Math.pow(10, exponent);

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(majorAmount);
  } catch {
    // Fallback if currency is invalid
    return `${currency} ${majorAmount.toFixed(exponent)}`;
  }
};

export default function SessionCartComponent({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onEditItem,
  disabled = false,
}: SessionCartProps) {
  const [showOrderReview, setShowOrderReview] = useState(false);
  
  if (!cart) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No active cart</p>
          <p className="text-sm text-gray-400">
            Select a table to start ordering
          </p>
        </div>
      </div>
    );
  }

  // Safe items array
  const items = Array.isArray(cart.items) ? cart.items : [];
  
  // Safe currency
  const currency = cart.currency || "INR";
  
  // Safe totals with fallbacks (using minor units)
  const subtotalMinor = Number.isFinite(cart.subtotalMinor) ? cart.subtotalMinor : 0;
  const taxMinor = Number.isFinite(cart.taxMinor) ? cart.taxMinor : 0;
  const totalMinor = Number.isFinite(cart.totalMinor) ? cart.totalMinor : subtotalMinor + taxMinor;
  const getDietaryIcons = (item: CartItem) => {
    const icons = [];
    if (item.isVegan)
      icons.push(
        <Leaf
          key="vegan"
          className="w-3 h-3 text-green-600"
          aria-label="Vegan"
        />,
      );
    else if (item.isVegetarian)
      icons.push(
        <Leaf
          key="vegetarian"
          className="w-3 h-3 text-green-500"
          aria-label="Vegetarian"
        />,
      );

    if (item.spicyLevel > 0) {
      icons.push(
        <div
          key="spicy"
          className="flex"
          aria-label={`Spicy Level: ${item.spicyLevel}`}
        >
          {[...Array(item.spicyLevel)].map((_, i) => (
            <Flame key={i} className="w-3 h-3 text-red-500" />
          ))}
        </div>,
      );
    }

    return icons;
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    console.log("🛒 Cart - Placing order with items:", items.length);
    console.log("🛒 Cart - Total amount:", formatMoney(totalMinor, currency));
    setShowOrderReview(true);
  };

  const confirmPlaceOrder = () => {
    console.log("🛒 Cart - Confirming order placement");
    onPlaceOrder();
    setShowOrderReview(false);
  };

  // Safe item price formatting (convert to minor units)
  const formatItemPrice = (price: number | undefined): string => {
    const safePrice = Number.isFinite(price) ? price! : 0;
    const priceMinor = Math.round(
      safePrice * Math.pow(10, getCurrencyExponent(currency)),
    );
    return formatMoney(priceMinor, currency);
  };

  // Safe line total calculation
  const getLineTotal = (item: CartItem): string => {
    const safePrice = Number.isFinite(item.price) ? item.price : 0;
    const safeQuantity = Number.isFinite(item.quantity) ? item.quantity : 0;
    const lineTotal = safePrice * safeQuantity;
    const lineTotalMinor = Math.round(
      lineTotal * Math.pow(10, getCurrencyExponent(currency)),
    );
    return formatMoney(lineTotalMinor, currency);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Order</h3>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">{items.length} items</span>
            {cart.status === "locked" && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Processing
              </span>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-sm text-gray-400">Add items to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.name || "Unknown Item"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatItemPrice(item.price)} each
                      </p>
                      {item.specialInstructions && (
                        <p className="text-xs text-orange-600 mt-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {getDietaryIcons(item)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, (item.quantity || 1) - 1)
                        }
                        disabled={disabled || cart.status === "locked"}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity || 0}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, (item.quantity || 0) + 1)
                        }
                        disabled={disabled || cart.status === "locked"}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {getLineTotal(item)}
                      </span>
                      {onEditItem && (
                        <button
                          onClick={() => onEditItem(item)}
                          disabled={disabled || cart.status === "locked"}
                          className="p-1 text-gray-400 hover:text-orange-500 disabled:opacity-50"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        disabled={disabled || cart.status === "locked"}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatMoney(subtotalMinor, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    {formatMoney(taxMinor, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-600">
                    {formatMoney(totalMinor, currency)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={
                  disabled || cart.status === "locked" || items.length === 0 || !cart.id
                }
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {cart.status === "locked" ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Processing Order...</span>
                  </>
                ) : !cart.id ? (
                  <span>Setting up session...</span>
                ) : (
                  <span>Place Order</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {showOrderReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Your Order
              </h3>
              <button
                onClick={() => setShowOrderReview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity || 0}x {item.name || "Unknown Item"}
                  </span>
                  <span>{getLineTotal(item)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 mb-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatMoney(totalMinor, currency)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowOrderReview(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPlaceOrder}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
