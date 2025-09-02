import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Calendar,
  Clock,
  Users,
  Star,
  MapPin,
  Phone,
  CheckCircle2,
} from "lucide-react";

export default function Reserve() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedGuests, setSelectedGuests] = useState(2);
  const [selectedTable, setSelectedTable] = useState("");

  const availableTimes = [
    { time: "5:00 PM", available: true },
    { time: "5:30 PM", available: true },
    { time: "6:00 PM", available: false },
    { time: "6:30 PM", available: true },
    { time: "7:00 PM", available: false },
    { time: "7:30 PM", available: true },
    { time: "8:00 PM", available: true },
    { time: "8:30 PM", available: false },
    { time: "9:00 PM", available: true },
    { time: "9:30 PM", available: true },
  ];

  const tableOptions = [
    {
      id: "window",
      name: "Window Table",
      description: "Perfect for romantic dinners",
      premium: true,
    },
    {
      id: "private",
      name: "Private Booth",
      description: "Intimate dining experience",
      premium: true,
    },
    {
      id: "main",
      name: "Main Dining",
      description: "Central restaurant atmosphere",
      premium: false,
    },
    {
      id: "patio",
      name: "Patio Seating",
      description: "Outdoor dining experience",
      premium: false,
    },
  ];

  const specialPackages = [
    {
      name: "Romantic Dinner",
      price: 150,
      includes: [
        "3-course meal",
        "Wine pairing",
        "Roses & candles",
        "Live music",
      ],
      image:
        "https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Chef's Tasting",
      price: 120,
      includes: [
        "7-course tasting",
        "Wine selection",
        "Chef interaction",
        "Recipe cards",
      ],
      image:
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Business Lunch",
      price: 85,
      includes: [
        "Express service",
        "Private seating",
        "WiFi access",
        "Coffee included",
      ],
      image:
        "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

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
              "url(https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        ></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Reserve Your Experience</h1>
          <p className="text-xl">Choose your perfect dining moment</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Reservation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Reservation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedGuests}
                  onChange={(e) => setSelectedGuests(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Preference
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Any table</option>
                {tableOptions.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} {table.premium ? "(Premium)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-colors">
                Find Tables
              </button>
            </div>
          </div>

          {/* Available Times */}
          {selectedDate && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Times
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {availableTimes.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      slot.available
                        ? selectedTime === slot.time
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 hover:bg-orange-100 text-gray-900"
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                    {!slot.available && <div className="text-xs">Booked</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Special Packages */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Special Dining Experiences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialPackages.map((pkg, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {pkg.name}
                    </h3>
                    <span className="text-2xl font-bold text-orange-600">
                      ${pkg.price}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    {pkg.includes.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-colors">
                    Reserve This Experience
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table Options */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Choose Your Table
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tableOptions.map((table) => (
              <div
                key={table.id}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-colors ${
                  selectedTable === table.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
                onClick={() => setSelectedTable(table.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {table.name}
                  </h3>
                  {table.premium && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{table.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurant Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Premium Service
            </h3>
            <p className="text-gray-600">
              Exceptional service with attention to every detail
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Prime Location
            </h3>
            <p className="text-gray-600">
              Located in the heart of the culinary district
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              24/7 Support
            </h3>
            <p className="text-gray-600">
              Round-the-clock customer service for your needs
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
