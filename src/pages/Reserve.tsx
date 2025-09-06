import React, { useState } from "react";
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

type TableInfo = {
  id: string;
  name: string;
  description?: string;
  premium?: boolean;
  seats?: number;
  type?: string; // e.g., 'window' | 'private' | 'main' | 'patio'
};

function getSpecialtyMessage(table: TableInfo): string {
  const key = (table.type || table.id || '').toLowerCase();
  switch (key) {
    case 'window':
      return 'Panoramic views with romantic ambience. Ideal for special occasions.';
    case 'private':
      return 'Cozy booth with enhanced privacy for intimate dining or business talks.';
    case 'main':
      return 'Vibrant center-floor energy with quick service and full attention.';
    case 'patio':
      return 'Open-air experience with fresh breeze—perfect for evenings.';
    default:
      return table.description || 'Comfortable seating and attentive service.';
  }
}

export default function Reserve() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedGuests, setSelectedGuests] = useState(2);
  const [selectedTable, setSelectedTable] = useState("");

  // Dynamic availability state
  const [availableTables, setAvailableTables] = useState<TableInfo[] | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showTableModal, setShowTableModal] = useState(false);
  const [activeTable, setActiveTable] = useState<TableInfo | null>(null);

  // Submit handler to ensure button triggers search reliably
  async function handleFindTables(e: React.FormEvent) {
    e.preventDefault();
    await loadTables();
  }

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

  type SpecialPackage = {
    id: string;
    name: string;
    price: number;
    image: string;
    includes: string[];
  };

  const specialPackages: SpecialPackage[] = [
    {
      id: 'romance',
      name: 'Romance Package',
      price: 129,
      image: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1920',
      includes: [
        'Private booth seating',
        'Candlelight ambiance',
        '3-course chef’s special',
        'Complimentary dessert for two'
      ]
    },
    {
      id: 'family',
      name: 'Family Feast',
      price: 159,
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1920',
      includes: [
        'Large table (up to 6)',
        'Kid-friendly menu options',
        'Sharing platters',
        'Priority service'
      ]
    },
    {
      id: 'celebration',
      name: 'Celebration Night',
      price: 189,
      image: 'https://images.pexels.com/photos/585922/pexels-photo-585922.jpeg?auto=compress&cs=tinysrgb&w=1920',
      includes: [
        'Window table (if available)',
        'Welcome mocktail for each guest',
        'Personalized message plate',
        'Photo capture & print'
      ]
    }
  ];

  async function loadTables() {
    if (!selectedDate || !selectedGuests) {
      setError('Please select date and guests first.');
      return;
    }
    setError(null);
    setLoadingTables(true);
    try {
      // Try to use the real API if available
      let apiFetch: undefined | ((path: string, init?: RequestInit) => Promise<any>);
      try {
        // Dynamically import to avoid build-time coupling if api file moves
        const mod: any = await import('@/lib/api');
        apiFetch = mod.apiFetch || mod.default?.apiFetch;
      } catch {
        apiFetch = undefined;
      }

      let tables: TableInfo[] | null = null;
      if (apiFetch) {
        const pref = selectedTable || undefined;
        const body = {
          date: selectedDate,
          time: selectedTime || undefined,
          guests: selectedGuests,
          preference: pref, // 'window' | 'private' | 'main' | 'patio' or undefined
        };
        const res = await apiFetch('/tables/available', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        // Expecting array back
        tables = Array.isArray(res) ? res : res?.tables || null;
      }

      // Fallback: synthesize from local `tableOptions` for now
      if (!tables) {
        const fallbackMap: Record<string, number> = {
          window: 2,
          private: 4,
          main: 6,
          patio: 4,
        };
        tables = tableOptions.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          premium: t.premium,
          seats: fallbackMap[t.id] ?? 4,
          type: t.id,
        }))
        // Filter by guests and (optionally) preference
        .filter(t => t.seats! >= selectedGuests)
        .filter(t => !selectedTable || t.id === selectedTable);
      }

      setAvailableTables(tables);
    } catch (e: any) {
      console.error('Failed to load tables', e);
      setError(e?.message || 'Failed to load tables');
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
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

          <form onSubmit={handleFindTables} className="space-y-0">
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
                <button
                  type="submit"
                  disabled={loadingTables}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-60"
                >
                  {loadingTables ? 'Finding…' : 'Find Tables'}
                </button>
              </div>
            </div>
          </form>

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

          {/* ▼ Available Tables (dynamic results) */}
          {availableTables && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {availableTables.length ? 'Available Tables' : 'No tables match your selection'}
              </h3>

              {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableTables.map((t) => (
                  <div
                    key={t.id}
                    className="p-6 rounded-xl border-2 cursor-pointer transition-colors hover:border-orange-300"
                    onClick={() => {
                      setActiveTable(t);
                      setShowTableModal(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{t.name}</h4>
                        <p className="text-sm text-gray-600">
                          Seats up to {t.seats ?? '—'}
                        </p>
                      </div>
                      {t.premium && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {t.description || getSpecialtyMessage(t)}
                    </p>
                  </div>
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

      {/* ▼ Table specialty modal */}
      {showTableModal && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{activeTable.name}</h4>
                {activeTable.premium && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setShowTableModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-gray-700">{getSpecialtyMessage(activeTable)}</p>
              {typeof activeTable.seats === 'number' && (
                <p className="text-sm text-gray-500">Seating capacity: {activeTable.seats}</p>
              )}
              {selectedDate && (
                <p className="text-sm text-gray-500">
                  For: <strong>{selectedDate}</strong>
                  {selectedTime ? ` at ${selectedTime}` : ''} • {selectedGuests} {selectedGuests === 1 ? 'guest' : 'guests'}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowTableModal(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
                onClick={() => {
                  // In a future step we can navigate to a reservation confirmation flow
                  setShowTableModal(false);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
