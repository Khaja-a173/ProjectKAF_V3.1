import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { beginCheckoutAttempt, endCheckoutAttempt, getCurrentAttemptKey } from "../lib/idempotency";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DashboardHeader from "../components/DashboardHeader";
import SessionCartComponent from "../components/SessionCart";
import OrderSuccessModal from "../components/OrderSuccessModal";
import TableSessionBadge from "../components/TableSessionBadge";
import ModePrompt from "../components/ModePrompt";
import { cartStore, Mode, ModeRequiredError, ContextRequiredError } from "../state/cartStore";
import { useSessionManagement } from "../hooks/useSessionManagement";
import { Search, Star, Clock, Leaf, Flame } from "lucide-react";
import { useMenuManagement } from "../hooks/useMenuManagement";

export default function Menu() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const source = searchParams.get("source"); // 'qr' or 'layout'

  const {
    createTableSession,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    placeOrder,
    getSessionByTable,
    getCartBySession,
  } = useSessionManagement({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [hasTableSession, setHasTableSession] = useState(false);
  const [_, force] = useState(0); // re-render when store changes

  // Use real menu data from management system
  const { sections, loading } = useMenuManagement({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  // resolve context
  const { tenantId, sessionIdFromUrl } = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    const tid = sp.get('tid') || localStorage.getItem('tenant_id') || 'tenant_123';
    const sid = sp.get('sid') || localStorage.getItem('session_id') || '';
    return { tenantId: tid, sessionIdFromUrl: sid };
  }, []);

  useEffect(() => {
    const unsub = cartStore.subscribe(() => force(x => x + 1));
    return () => {
      unsub(); // ✅ call the function and return nothing
    };
  }, []);

  useEffect(() => {
    if (tenantId) {
      cartStore.setContext(tenantId, sessionIdFromUrl || undefined);
      setHasTableSession(!!sessionIdFromUrl || !!localStorage.getItem('session_id') || !!tableId);
    }
  }, [tenantId, sessionIdFromUrl, tableId]);

  function requireModeOrOpenPrompt(): boolean {
    if (!cartStore.mode) {
      setPromptOpen(true);
      return false;
    }
    return true;
  }

  async function handleSelectMode(mode: Mode) {
    try {
      cartStore.setMode(mode);
      setPromptOpen(false);
    } catch (e) {
      console.error(e);
    }
  }
  // Get current session and cart
  const currentSession = tableId ? getSessionByTable(tableId) : null;
  const currentCart = currentSession
    ? getCartBySession(currentSession.id)
    : null;

  // Create session automatically when table is accessed
  useEffect(() => {
    const initializeSession = async () => {
      if (tableId && !currentSession && !sessionCreated && !creatingSession) {
        setCreatingSession(true);
        try {
          console.log(`🪑 Auto-creating session for table ${tableId} (source: ${source})`);
          await createTableSession(tableId, {
            customerName: "Guest",
            partySize: 2,
          });
          setSessionCreated(true);
          console.log(`✅ Session created for table ${tableId}`);
        } catch (err) {
          console.error("❌ Failed to create session:", err);
        } finally {
          setCreatingSession(false);
        }
      }
    };

    initializeSession();
  }, [tableId, currentSession, sessionCreated, creatingSession, createTableSession, source]);

  const categories = [
    { id: "all", name: "All Items" },
    ...sections
      .filter((s) => s.isActive)
      .map((section) => ({ id: section.id, name: section.name })),
  ];

  // Get all available items from sections
  const allItems = sections.flatMap((section) => section.items || []);

  const filteredItems = allItems.filter((item) => {
    if (!item.isAvailable) return false; // Only show available items

    const matchesCategory =
      selectedCategory === "all" || item.sectionId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = async (item: any) => {
    try {
      if (!requireModeOrOpenPrompt()) return;
      cartStore.add({ id: item.id, name: item.name, price: item.price }, 1);
      console.log("✅ Item added to cart:", item.name);
    } catch (e) {
      if (e instanceof ModeRequiredError) {
        setPromptOpen(true);
        return;
      }
      if (e instanceof ContextRequiredError) {
        alert('Please scan the table QR or select Takeaway to start.');
        return;
      }
      console.error("❌ Failed to add to cart:", e);
      alert("Failed to add item to cart");
    }
  };

  const handleUpdateCartQuantity = async (
    itemId: string,
    newQuantity: number,
  ) => {
    try {
      await updateCartQuantity(itemId, newQuantity);
      console.log("✅ Cart quantity updated:", itemId, newQuantity);
    } catch (err) {
      console.error("❌ Failed to update cart quantity:", err);
      alert("Failed to update quantity");
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      console.log("✅ Item removed from cart:", itemId);
    } catch (err) {
      console.error("❌ Failed to remove from cart:", err);
      alert("Failed to remove item");
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentSession || !currentCart) return;

    try {
      const idempotencyKey = beginCheckoutAttempt();
      console.log("🚀 Starting order placement process...");
      console.log("Session:", currentSession.id);
      console.log("Cart items:", currentCart.items.length);
      console.log("Idempotency key:", idempotencyKey);
      
      // Call the idempotent checkout API directly
      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': getCurrentAttemptKey() || 'fallback-key'
        },
        body: JSON.stringify({
          tenantId: "tenant_123",
          sessionId: currentSession.id,
          mode: "table",
          tableId: currentSession.tableId,
          cartVersion: 1, // Simple version for now
          items: currentCart.items.map(item => ({
            id: item.menuItemId,
            name: item.name,
            price_cents: Math.round((item.price || 0) * 100),
            qty: item.quantity
          })),
          totalCents: Math.round((currentCart.totalMinor || 0))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.log("❌ Checkout failed:", error);
        throw new Error(error.error || 'Checkout failed');
      }

      const result = await response.json();
      const order = result.order;
      
      console.log("✅ Order placed successfully:", order);
      console.log("Duplicate:", result.duplicate);
      endCheckoutAttempt();
      setPlacedOrder(order);
      setShowOrderSuccess(true);
      
      // Auto-redirect to live orders after 3 seconds
      setTimeout(() => {
        console.log("🔄 Redirecting to live orders...");
        window.location.href = `/live-orders?order=${order.id}`;
      }, 3000);
    } catch (err) {
      endCheckoutAttempt();
      console.error("❌ Failed to place order:", err);
      alert("Failed to place order: " + (err instanceof Error ? err.message : "Please try again."));
    }
  };

  const handleTrackOrder = () => {
    setShowOrderSuccess(false);
    window.location.href = `/live-orders?order=${placedOrder?.id}`;
  };

  const handleBrowseMenu = () => {
    setShowOrderSuccess(false);
    // Stay on menu page
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Original beautiful menu design (unchanged)
  const getDietaryIcon = (item: any) => {
    if (item.isVegan) return <Leaf className="w-4 h-4 text-green-600" />;
    if (item.isVegetarian) return <Leaf className="w-4 h-4 text-green-500" />;
    return null;
  };

  const getSpiceLevel = (level: number) => {
    if (level === 0) return null;
    return (
      <div className="flex items-center">
        {[...Array(level)].map((_, i) => (
          <Flame key={i} className="w-3 h-3 text-red-500" />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        ></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Our Menu</h1>
          <p className="text-xl">Discover our culinary masterpieces</p>
          
          {/* Table Serving Message */}
          {tableId && (
            <div className="mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 inline-block">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold">
                    Now serving to Table {tableId}
                  </span>
                  {source === 'qr' && (
                    <span className="bg-blue-500/80 text-white px-2 py-1 rounded-full text-xs">
                      QR Scanned
                    </span>
                  )}
                  {source === 'layout' && (
                    <span className="bg-purple-500/80 text-white px-2 py-1 rounded-full text-xs">
                      Table Selected
                    </span>
                  )}
                </div>
                {creatingSession && (
                  <div className="mt-2 text-sm text-white/80">
                    Setting up your dining session...
                  </div>
                )}
                {currentSession && (
                  <div className="mt-2 text-sm text-white/80">
                    Session active • Ready to order
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Menu - Synced with Kitchen</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Menu */}
          <div className="flex-1">
            {/* Search and Filter */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>
                    {item.tags.includes("popular") && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Popular
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <span className="text-2xl font-bold text-orange-600">
                        ${item.price}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{item.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {item.preparationTime && (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>{item.preparationTime} min</span>
                          </>
                        )}
                        {item.calories && <span>{item.calories} cal</span>}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getDietaryIcon(item)}
                        {getSpiceLevel(item.spicyLevel)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No menu items found matching your criteria.
                </p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-96">
            <SessionCartComponent
              cart={currentCart}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onPlaceOrder={handlePlaceOrder}
              disabled={!currentSession || creatingSession}
            />
          </div>
        </div>
      </div>

      {/* Mode Selection Modal */}
      <ModePrompt
        open={promptOpen}
        hasTableSession={hasTableSession}
        onSelect={handleSelectMode}
        onClose={() => setPromptOpen(false)}
      />
      {/* Order Success Modal */}
      <OrderSuccessModal
        order={placedOrder}
        isOpen={showOrderSuccess}
        onClose={() => setShowOrderSuccess(false)}
        onTrackOrder={handleTrackOrder}
        onBrowseMenu={handleBrowseMenu}
      />

      <Footer />
    </div>
  );
}
