import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Save,
  Bell,
  Shield,
  Palette,
  Globe,
  Users,
  CreditCard,
  Key,
} from "lucide-react";
import AccessControlDashboard from "../components/AccessControlDashboard";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    restaurantName: "Bella Vista Restaurant",
    email: "admin@bellavista.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, City, State 12345",
    timezone: "America/New_York",
    currency: "USD",
    notifications: {
      newOrders: true,
      lowStock: true,
      dailyReports: false,
      marketing: true,
    },
    theme: "light",
    language: "en",
  });

  const tabs = [
    { id: "general", name: "General", icon: Globe },
    { id: "access", name: "Access Control", icon: Key },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "team", name: "Team", icon: Users },
    { id: "billing", name: "Billing", icon: CreditCard },
  ];

  const handleSave = () => {
    // Save settings logic here
    alert("Settings saved successfully!");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                value={settings.restaurantName}
                onChange={(e) =>
                  setSettings({ ...settings, restaurantName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "access":
        return (
          <AccessControlDashboard
            tenantId="tenant_123"
            locationId="location_456"
            currentUserId="user_admin"
          />
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {key === "newOrders" &&
                        "Get notified when new orders are placed"}
                      {key === "lowStock" &&
                        "Alert when inventory items are running low"}
                      {key === "dailyReports" &&
                        "Receive daily performance summaries"}
                      {key === "marketing" &&
                        "Updates about new features and promotions"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [key]: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Security Settings
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Manage your account security and access controls.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full text-left p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">Change Password</h4>
                <p className="text-sm text-gray-600">
                  Update your account password
                </p>
              </button>

              <button className="w-full text-left p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </button>

              <button className="w-full text-left p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">Login History</h4>
                <p className="text-sm text-gray-600">
                  View recent login activity
                </p>
              </button>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSettings({ ...settings, theme: "light" })}
                  className={`p-4 border-2 rounded-lg ${
                    settings.theme === "light"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <div className="w-full h-20 bg-white rounded border mb-2"></div>
                  <span className="text-sm font-medium">Light</span>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme: "dark" })}
                  className={`p-4 border-2 rounded-lg ${
                    settings.theme === "dark"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <div className="w-full h-20 bg-gray-800 rounded border mb-2"></div>
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        );

      case "team":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Team Members
              </h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Invite Member
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  name: "John Smith",
                  email: "john@restaurant.com",
                  role: "Admin",
                },
                {
                  name: "Sarah Johnson",
                  email: "sarah@restaurant.com",
                  role: "Manager",
                },
                {
                  name: "Mike Wilson",
                  email: "mike@restaurant.com",
                  role: "Staff",
                },
              ].map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {member.role}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Current Plan: Professional
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    $49/month • Next billing date: March 15, 2024
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white border border-gray-300 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Payment Method
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-5 bg-blue-600 rounded"></div>
                  <span className="text-sm text-gray-600">
                    •••• •••• •••• 4242
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Update
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-300 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Billing History
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Feb 15, 2024</span>
                    <span>$49.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Jan 15, 2024</span>
                    <span>$49.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dec 15, 2023</span>
                    <span>$49.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  RestaurantOS
                </h1>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Dashboard
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu Management
            </Link>
            <Link
              to="/orders"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Orders
            </Link>
            <Link
              to="/table-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Table Management
            </Link>
            <Link
              to="/staff-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Staff Management
            </Link>
            <Link
              to="/admin/kitchen"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Kitchen Dashboard
            </Link>
            <Link
              to="/analytics"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Analytics
            </Link>
            <Link
              to="/settings"
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
            >
              Settings
            </Link>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {activeTab} Settings
                </h2>
              </div>

              <div className="p-6">{renderTabContent()}</div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
