import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogo } from "../contexts/BrandingContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Building2,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logoHeader } = useLogo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      navigate("/dashboard");
      setLoading(false);
    }, 1500);
  };

  const handleDemoLogin = (role: string) => {
    if (role === "admin") {
      setEmail("skm@projectkaf.local");
      setPassword("StrongPass!123");
    } else if (role === "manager") {
      setEmail("manager@restaurant.com");
      setPassword("manager123");
    } else if (role === "staff") {
      setEmail("staff@restaurant.com");
      setPassword("staff123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            {logoHeader ? (
              <div className="mb-6">
                <img
                  src={logoHeader}
                  alt="Restaurant Logo"
                  className="h-16 w-auto object-contain filter brightness-0 invert"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            <h1 className="text-4xl font-bold mb-4">RestaurantOS</h1>
            <p className="text-xl text-blue-100 mb-8">
              Complete enterprise restaurant management platform
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Multi-Tenant Architecture
                </h3>
                <p className="text-blue-100">
                  Manage multiple restaurant locations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Real-time Analytics</h3>
                <p className="text-blue-100">Track performance and revenue</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Enterprise Security</h3>
                <p className="text-blue-100">
                  Bank-level security and compliance
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
            <p className="text-sm text-blue-100 mb-2">
              Trusted by 10,000+ restaurants worldwide
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white"
                  ></div>
                ))}
              </div>
              <span className="text-sm font-medium">+10,000 more</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {logoHeader ? (
              <div className="lg:hidden mb-4">
                <img
                  src={logoHeader}
                  alt="Restaurant Logo"
                  className="h-16 w-auto object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="lg:hidden inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your RestaurantOS account
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              🎯 Demo Credentials
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin("admin")}
                className="w-full text-left p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <div className="font-medium text-blue-900">Admin Account</div>
                <div className="text-blue-600">
                  skm@projectkaf.local / StrongPass!123
                </div>
              </button>
              <button
                onClick={() => handleDemoLogin("manager")}
                className="w-full text-left p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <div className="font-medium text-blue-900">Manager Account</div>
                <div className="text-blue-600">
                  manager@restaurant.com / manager123
                </div>
              </button>
              <button
                onClick={() => handleDemoLogin("staff")}
                className="w-full text-left p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <div className="font-medium text-blue-900">Staff Account</div>
                <div className="text-blue-600">
                  staff@restaurant.com / staff123
                </div>
              </button>
            </div>
          </div>

          <div className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 h-12 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Sign in to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-500 font-semibold"
                >
                  Start free trial
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
