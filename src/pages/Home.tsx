import { Link } from "react-router-dom";
import { useCustomization } from "../hooks/useCustomization";
import DynamicPageRenderer from "../components/DynamicPageRenderer";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Star,
  Clock,
  MapPin,
  Phone,
  ChefHat,
  Award,
  Users,
  Heart,
  Calendar,
  ShoppingCart,
} from "lucide-react";

export default function Home() {
  const { pages, theme, loading } = useCustomization({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  const homePage = pages.find(
    (p) => p.slug === "home" && p.status === "published",
  );

  // Only use customization if page has been actively customized with sections AND has visible content
  const hasCustomContent =
    homePage &&
    homePage.sections.length > 0 &&
    homePage.sections.some(
      (s) => s.visible && s.props && Object.keys(s.props).length > 0,
    );

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading page...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If tenant has customized the page, render it dynamically
  if (hasCustomContent) {
    return (
      <div className="min-h-screen">
        <Header />
        <DynamicPageRenderer page={homePage} theme={theme} />
        <Footer />
      </div>
    );
  }

  // Default beautiful design (original) - unchanged
  const features = [
    {
      icon: ChefHat,
      title: "Expert Chefs",
      description:
        "Our world-class chefs create culinary masterpieces with passion and precision.",
    },
    {
      icon: Award,
      title: "Award Winning",
      description:
        "Recognized for excellence in fine dining and exceptional customer service.",
    },
    {
      icon: Users,
      title: "Perfect for Groups",
      description:
        "Intimate dining for couples or spacious areas for larger celebrations.",
    },
    {
      icon: Heart,
      title: "Made with Love",
      description:
        "Every dish is prepared with care using the finest, freshest ingredients.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment:
        "Absolutely incredible dining experience! The ambiance, service, and food were all perfect.",
      image:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      name: "Michael Chen",
      rating: 5,
      comment:
        "Best restaurant in the city! The chef's special was outstanding and the staff was amazing.",
      image:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      name: "Emily Rodriguez",
      rating: 5,
      comment:
        "Perfect for our anniversary dinner. Romantic atmosphere and exceptional cuisine.",
      image:
        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section - Original Beautiful Design */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        ></div>

        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Experience Premium Indo-Arabian Dining
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up">
            Book a table, browse our authentic menu, or order takeaway from KAF
            Restro - where tradition meets taste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up max-w-4xl mx-auto">
            <Link
              to="/book-table"
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Table</span>
            </Link>
            <Link
              to="/reserve"
              className="bg-gray-800/80 backdrop-blur-sm text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-gray-700/80 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Reserve</span>
            </Link>
            <Link
              to="/menu"
              className="bg-gray-800/80 backdrop-blur-sm text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-gray-700/80 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ChefHat className="w-5 h-5" />
              <span>View Menu</span>
            </Link>
            <Link
              to="/take-away"
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Take Away</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Original Design */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Bella Vista
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the perfect blend of exceptional cuisine, elegant
              ambiance, and impeccable service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes - Original Design */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Signature Dishes
            </h2>
            <p className="text-xl text-gray-600">
              Discover our chef's most celebrated creations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Grilled Atlantic Salmon",
                description:
                  "Fresh salmon with herb crust, served with seasonal vegetables",
                price: "$28",
                image:
                  "https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400",
              },
              {
                name: "Wagyu Beef Tenderloin",
                description:
                  "Premium wagyu beef with truffle sauce and roasted potatoes",
                price: "$45",
                image:
                  "https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400",
              },
              {
                name: "Lobster Risotto",
                description:
                  "Creamy arborio rice with fresh lobster and saffron",
                price: "$38",
                image:
                  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
              },
            ].map((dish, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {dish.name}
                    </h3>
                    <span className="text-2xl font-bold text-orange-600">
                      {dish.price}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{dish.description}</p>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors">
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Original Design */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Guests Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from our valued customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info - Original Design */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-300">
                123 Gourmet Street
                <br />
                Culinary District, CD 12345
              </p>
            </div>
            <div>
              <Phone className="w-8 h-8 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300">
                +1 (555) 123-4567
                <br />
                Reservations & Inquiries
              </p>
            </div>
            <div>
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hours</h3>
              <p className="text-gray-300">
                Mon-Thu: 5PM-10PM
                <br />
                Fri-Sat: 5PM-11PM
                <br />
                Sun: 4PM-9PM
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
