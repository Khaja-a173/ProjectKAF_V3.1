import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ShoppingCart,
  Clock,
  Star,
  Plus,
  Minus,
  Search,
  Filter,
  Truck,
  Phone,
} from "lucide-react";

export default function TakeAway() {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", name: "All Items" },
    { id: "appetizers", name: "Appetizers" },
    { id: "mains", name: "Main Courses" },
    { id: "desserts", name: "Desserts" },
    { id: "beverages", name: "Beverages" },
    { id: "combos", name: "Combo Meals" },
  ];

  const menuItems = [
    {
      id: 1,
      name: "Chicken Biryani",
      category: "mains",
      price: 18.99,
      originalPrice: 22.99,
      description:
        "Aromatic basmati rice with tender chicken and traditional spices",
      image:
        "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400",
      prepTime: "25-30 min",
      rating: 4.8,
      popular: true,
      spicy: true,
    },
    {
      id: 2,
      name: "Lamb Kebab Platter",
      category: "mains",
      price: 24.99,
      description: "Grilled lamb kebabs with rice, salad, and mint chutney",
      image:
        "https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400",
      prepTime: "20-25 min",
      rating: 4.9,
      popular: true,
    },
    {
      id: 3,
      name: "Hummus & Falafel",
      category: "appetizers",
      price: 12.99,
      description: "Fresh hummus with crispy falafel and pita bread",
      image:
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
      prepTime: "10-15 min",
      rating: 4.6,
      vegetarian: true,
    },
    {
      id: 4,
      name: "Butter Chicken",
      category: "mains",
      price: 19.99,
      description: "Creamy tomato-based curry with tender chicken pieces",
      image:
        "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400",
      prepTime: "20-25 min",
      rating: 4.7,
      popular: true,
    },
    {
      id: 5,
      name: "Family Combo",
      category: "combos",
      price: 49.99,
      originalPrice: 65.99,
      description: "Biryani, kebabs, appetizers, and dessert for 4 people",
      image:
        "https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400",
      prepTime: "30-35 min",
      rating: 4.9,
      popular: true,
      serves: 4,
    },
    {
      id: 6,
      name: "Baklava",
      category: "desserts",
      price: 8.99,
      description: "Traditional honey-sweetened pastry with nuts",
      image:
        "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400",
      prepTime: "5-10 min",
      rating: 4.5,
    },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: any) => {
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

  const updateQuantity = (id: number, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-5xl font-bold mb-4">Order Takeaway</h1>
          <p className="text-xl">Delicious food delivered to your door</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Delivery Info */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <Truck className="w-6 h-6" />
              <div>
                <p className="font-semibold">Free Delivery</p>
                <p className="text-sm opacity-90">Orders over $30</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="font-semibold">Fast Delivery</p>
                <p className="text-sm opacity-90">30-45 minutes</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Phone className="w-6 h-6" />
              <div>
                <p className="font-semibold">Order Tracking</p>
                <p className="text-sm opacity-90">Real-time updates</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Section */}
          <div className="flex-1">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            {item.popular && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                Popular
                              </span>
                            )}
                            {item.vegetarian && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Vegetarian
                              </span>
                            )}
                            {item.spicy && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                Spicy
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{item.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{item.prepTime}</span>
                            </div>
                            {item.serves && <span>Serves {item.serves}</span>}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl font-bold text-gray-900">
                              ${item.price}
                            </span>
                            {item.originalPrice && (
                              <span className="text-lg text-gray-500 line-through">
                                ${item.originalPrice}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
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
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">
                        {getTotalPrice() >= 30 ? "Free" : "$3.99"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>
                        $
                        {(
                          getTotalPrice() + (getTotalPrice() >= 30 ? 0 : 3.99)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-colors">
                    Proceed to Checkout
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
