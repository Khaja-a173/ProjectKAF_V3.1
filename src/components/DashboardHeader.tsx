import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogo } from "@/contexts/BrandingContext";
import { supabase } from "@/lib/supabase";
import {
  ChefHat,
  Menu as MenuIcon,
  X,
  Search,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

/**
 * Admin Dashboard Header
 * - Same visual style as main Header (keeps logo + name)
 * - No public nav items (Home/Menu/Events/Gallery/Contact/Cart are removed)
 * - Shows: Search, Notifications, Settings, Logout
 * - Dynamic page title based on current admin sub-route
 * - Logo click → Home (/)
 * - Logout → sign out, then go Home (/)
 */
export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logoHeader } = useLogo();

  // Session (to show Logout only when actually logged in)
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Map dashboard routes to titles
  const computeTitle = (pathname: string) => {
    // Normalize path (strip trailing slash)
    const p = pathname.replace(/\/+$/, "");

    if (p === "/dashboard") return "Dashboard Overview";
    if (p.startsWith("/menu-management")) return "Menu Management";
    if (p.startsWith("/orders")) return "Order Management";
    if (p.startsWith("/table-management")) return "Table Management";
    if (p.startsWith("/staff")) return "Staff Management";
    if (p.startsWith("/kds")) return "Kitchen Display";
    if (p.startsWith("/branding")) return "Branding";
    if (p.startsWith("/analytics")) return "Analytics";
    if (p.startsWith("/payments")) return "Payments";
    // Fallback for any other admin route
    if (p.startsWith("/dashboard")) return "Dashboard";
    return "Admin";
  };

  const pageTitle = computeTitle(location.pathname);

  const handleLogoClick = () => {
    navigate("/"); // go to Home
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/"); // back to Home after logout
  };

  // Desktop action buttons (Search/Notifications/Settings/Logout)
  const Actions = () => (
    <div className="hidden md:flex items-center space-x-2">
      <button
        className="p-2 text-gray-600 hover:text-orange-600"
        aria-label="Search"
        title="Search"
        onClick={() => {
          // placeholder hook-in (you can open a command palette / dialog here)
          console.debug("Search clicked");
        }}
      >
        <Search className="w-5 h-5" />
      </button>
      <button
        className="p-2 text-gray-600 hover:text-orange-600"
        aria-label="Notifications"
        title="Notifications"
        onClick={() => {
          // placeholder for notifications drawer
          console.debug("Notifications clicked");
        }}
      >
        <Bell className="w-5 h-5" />
      </button>
      <button
        className="p-2 text-gray-600 hover:text-orange-600"
        aria-label="Settings"
        title="Settings"
        onClick={() => {
          navigate("/branding"); // or a dedicated /settings route if you have one
        }}
      >
        <Settings className="w-5 h-5" />
      </button>

      {session && (
        <button
          onClick={handleLogout}
          className="ml-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-800 transition-colors inline-flex items-center"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      )}
    </div>
  );

  // Mobile action buttons (rendered inside the collapsible)
  const MobileActions = () => (
    <div className="space-y-2 pt-2 border-t border-gray-200 mt-2">
      <button
        className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50"
        onClick={() => {
          console.debug("Search clicked");
          setIsMenuOpen(false);
        }}
      >
        Search
      </button>
      <button
        className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50"
        onClick={() => {
          console.debug("Notifications clicked");
          setIsMenuOpen(false);
        }}
      >
        Notifications
      </button>
      <button
        className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50"
        onClick={() => {
          navigate("/branding"); // or /settings
          setIsMenuOpen(false);
        }}
      >
        Settings
      </button>

      {session && (
        <button
          onClick={async () => {
            await handleLogout();
            setIsMenuOpen(false);
          }}
          className="block w-full text-center bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-800 transition-colors"
        >
          Logout
        </button>
      )}
    </div>
  );

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center h-16">
          {/* Logo & Name */}
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-3"
            aria-label="Go to Home"
            title="Go to Home"
          >
            {logoHeader ? (
              <img
                src={logoHeader}
                alt="Restaurant Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="text-left">
              {/* Keep the same branding name as main header */}
              <h1 className="text-xl font-bold text-gray-900">Bella Vista</h1>
              {/* Dynamic title under the name */}
              <p className="text-xs text-gray-500">{pageTitle}</p>
            </div>
          </button>

          {/* Desktop Actions */}
          <Actions />

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-orange-600"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Actions */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <MobileActions />
          </div>
        )}
      </div>
    </header>
  );
}