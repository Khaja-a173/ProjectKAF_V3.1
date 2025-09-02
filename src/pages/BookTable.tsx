import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSessionManagement } from "../hooks/useSessionManagement";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  MapPin,
  CheckCircle,
  QrCode,
  Camera,
  Grid3X3,
} from "lucide-react";

export default function BookTable() {
  const navigate = useNavigate();
  const { createTableSession, getSessionByTable } = useSessionManagement({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  const [activeSection, setActiveSection] = useState("qr-scanner");
  const [selectedTable, setSelectedTable] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    occasion: "",
    specialRequests: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const timeSlots = [
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
    "10:00 PM",
  ];

  const occasions = [
    "Birthday",
    "Anniversary",
    "Date Night",
    "Business Meeting",
    "Family Gathering",
    "Celebration",
    "Other",
  ];

  const availableTables = [
    { id: "T02", seats: 4, location: "Window View", status: "available" },
    { id: "T06", seats: 4, location: "Main Hall", status: "available" },
    { id: "T07", seats: 2, location: "Main Hall", status: "available" },
    { id: "T09", seats: 4, location: "Garden View", status: "available" },
    { id: "T10", seats: 6, location: "Garden View", status: "available" },
    { id: "T14", seats: 2, location: "Counter Seating", status: "available" },
    { id: "T15", seats: 4, location: "Main Hall", status: "available" },
  ];

  const handleStartScanning = () => {
    setIsScanning(true);
    // Simulate QR scanning
    setTimeout(() => {
      setIsScanning(false);
      const scannedTable = `T${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`;
      setTableNumber(scannedTable);
      // Immediately redirect to menu with QR scan indicator
      window.location.href = `/menu?table=${scannedTable}&source=qr`;
    }, 2000);
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId);
    setTableNumber(tableId);
    // Immediately redirect to menu with layout selection indicator
    window.location.href = `/menu?table=${tableId}&source=layout`;
  };

  const handleCreateSession = async (tableId: string) => {
    try {
      setIsCreatingSession(true);

      // Check for existing session first
      const existingSession = getSessionByTable(tableId);
      if (existingSession) {
        console.log("♻️ Using existing session for table:", tableId);
        // Redirect to menu page immediately
        window.location.href = `/menu?table=${tableId}&session=${existingSession.id}`;
        return;
      }

      // Create new session
      const session = await createTableSession(tableId, {
        customerName: formData.name || "Guest",
        customerEmail: formData.email,
        customerPhone: formData.phone,
        partySize: parseInt(formData.guests) || 2,
      });

      console.log("✅ Session created, navigating to menu");
      // Redirect to menu page immediately
      window.location.href = `/menu?table=${tableId}&session=${session.id}`;
    } catch (err) {
      console.error("❌ Failed to create session:", err);
      alert(
        "Failed to create table session: " +
          (err instanceof Error ? err.message : "Please try again."),
      );
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTable) {
      handleCreateSession(selectedTable);
    } else {
      alert("Please select a table first");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your reservation. We've sent a confirmation email to{" "}
              {formData.email}. We look forward to serving you!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Table:</strong> {selectedTable || tableNumber}
                </p>
                <p>
                  <strong>Date:</strong> {formData.date}
                </p>
                <p>
                  <strong>Time:</strong> {formData.time}
                </p>
                <p>
                  <strong>Guests:</strong> {formData.guests}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-colors"
            >
              Make Another Booking
            </button>
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
              "url(https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        ></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Book a Table</h1>
          <p className="text-xl">Reserve your perfect dining experience</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section 1: QR Scanner & Table Layout */}
        <div className="mb-12">
          {/* QR Scanner Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Connect to Table
              </h2>
              <p className="text-gray-600">
                Scan QR code on your table or enter table number to start
                ordering
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Scan QR Code
                </h3>
                <p className="text-gray-600 mb-6">
                  Point your camera at the QR code on your table
                </p>

                <button
                  onClick={handleStartScanning}
                  disabled={isScanning}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Camera className="w-5 h-5" />
                  <span>{isScanning ? "Scanning..." : "Start Scanning"}</span>
                </button>
              </div>

              <div className="text-center text-gray-500 mb-6">OR</div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Grid3X3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enter Table Number
                </h3>
                <p className="text-gray-600 mb-4">
                  Type your table number if you can't scan the QR code
                </p>

                <input
                  type="text"
                  placeholder="e.g. T01, T02, T15"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center mb-4"
                />

                <button
                  onClick={() => setActiveSection("table-layout")}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Check Availability & View Menu
                </button>
              </div>
            </div>
          </div>

          {/* Table Layout Section */}
          {activeSection === "table-layout" && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Available Tables
                </h3>
                <p className="text-gray-600">
                  Click on any available table to select it
                </p>
                <p className="text-sm text-gray-500">
                  (Showing 7 available tables - Updated automatically)
                </p>
              </div>

              {/* Horizontal Table Layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                {availableTables.map((table) => (
                  <div
                    key={table.id}
                    onClick={() => handleTableSelect(table.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedTable === table.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300 bg-white"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {table.id}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {table.seats} seats
                      </div>
                      <div className="text-xs text-gray-500">
                        {table.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mb-6">
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Hide Available Tables
                </button>
              </div>

              {/* Need Help Section */}
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Need Help?
                </h4>
                <p className="text-gray-600 mb-4">
                  Can't find your table or having trouble? View all available
                  tables or ask our staff for assistance.
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Available Tables
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  For special table arrangements, please contact our staff
                  directly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Booking Form (Existing) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Make a Reservation
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Reservation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occasion
                  </label>
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select occasion</option>
                    {occasions.map((occasion) => (
                      <option key={occasion} value={occasion}>
                        {occasion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedTable && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 font-medium">
                    Selected Table: {selectedTable}
                  </p>
                  <p className="text-green-600 text-sm">
                    {availableTables.find((t) => t.id === selectedTable)?.seats}{" "}
                    seats •{" "}
                    {
                      availableTables.find((t) => t.id === selectedTable)
                        ?.location
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Any dietary restrictions, seating preferences, or special requests..."
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingSession}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-colors"
              >
                {isCreatingSession
                  ? "Creating Session..."
                  : "Start Dining Experience"}
              </button>
            </form>
          </div>

          {/* Restaurant Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Restaurant Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">
                      123 Gourmet Street, Culinary District, CD 12345
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Hours</p>
                    <div className="text-gray-600 text-sm">
                      <p>Monday - Thursday: 5:00 PM - 10:00 PM</p>
                      <p>Friday - Saturday: 5:00 PM - 11:00 PM</p>
                      <p>Sunday: 4:00 PM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Reservation Policy</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  • Reservations are held for 15 minutes past the reserved time
                </li>
                <li>
                  • Cancellations must be made at least 2 hours in advance
                </li>
                <li>• Large parties (8+) may require a deposit</li>
                <li>
                  • We accommodate dietary restrictions with advance notice
                </li>
                <li>• Smart casual dress code preferred</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
