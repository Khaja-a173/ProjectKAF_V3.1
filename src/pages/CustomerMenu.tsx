import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Search,
  Star,
  Clock,
  Leaf,
  Flame,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import { MenuItem } from "../types/menu";
import { useMenuManagement } from "../hooks/useMenuManagement";

export default function CustomerMenu() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Array<MenuItem & { quantity: number }>>([]);

  // Use the same menu management hook for real-time sync
  const { sections, loading } = useMenuManagement({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  const categories = [
    { id: "all", name: "All Items" },
    ...sections
      .filter((s) => s.isActive)
      .map((section) => ({ id: section.id, name: section.name })),
  ];

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

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        ),
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as Array<MenuItem & { quantity: number }>,
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getDietaryIcon = (item: MenuItem) => {
    if (item.isVegan)
      return <Leaf className="w-4 h-4 text-green-600" aria-label="Vegan" />;
    if (item.isVegetarian)
      return (
        <Leaf className="w-4 h-4 text-green-500" aria-label="Vegetarian" />
      );
    return null;
  };

  const getSpiceLevel = (level: number) => {
    if (level === 0) return null;
    return (
      <div className="flex items-center" title={`Spicy Level: ${level}`}>
        {[...Array(level)].map((_, i) => (
          <Flame key={i} className="w-3 h-3 text-red-500" />
        ))}
      </div>
    );
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
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Menu - Updated in Real-time</span>
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

            {/* Menu Items by Section */}
            {sections
              .filter((section) => section.isActive)
              .map((section) => {
                const sectionItems =
                  section.items?.filter((item) => {
                    if (!item.isAvailable) return false;

                    const matchesCategory =
                      selectedCategory === "all" ||
                      selectedCategory === section.id;
                    const matchesSearch =
                      item.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      item.description
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    return matchesCategory && matchesSearch;
                  }) || [];

                if (sectionItems.length === 0) return null;

                return (
                  <div key={section.id} className="mb-12">
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {section.name}
                      </h2>
                      {section.description && (
                        <p className="text-gray-600">{section.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sectionItems.map((item) => (
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
                            {item.tags.includes("signature") && (
                              <div className="absolute bottom-4 left-4">
                                <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  Signature
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

                            <p className="text-gray-600 mb-4">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                {item.preparationTime && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{item.preparationTime} min</span>
                                  </div>
                                )}
                                {item.calories && (
                                  <span>{item.calories} cal</span>
                                )}
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
                              onClick={() => addToCart(item)}
                              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-colors font-medium"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No menu items found matching your criteria.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your search or category filter.
                </p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Order
                </h3>
                <div className="flex items-center space-x-1">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-600">
                    {getTotalItems()} items
                  </span>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">
                    Add items to get started
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            ${item.price} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-colors">
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
