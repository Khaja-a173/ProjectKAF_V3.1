import Header from "@/components/Header";
import HealthBanner from "@/health/HealthBanner";
//import DashboardHeader from "@/components/DashboardHeader";
import { Outlet, useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const location = useLocation();
  // List of dashboard subpages where DashboardHeader should be shown
  const dashboardRoutes = [
    "/menu-management",
    "/orders",
    "/staff",
    "/tables",
    "/payments",
    "/analytics",
    "/branding",
    "/kds"
  ];
  // Check if current path matches any dashboard subpage exactly or as a prefix
  const showDashboardHeader = dashboardRoutes.some((route) =>
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  // Optionally, customize the title per route
  let dashboardTitle = "Dashboard";
  if (location.pathname.startsWith("/menu-management")) dashboardTitle = "Menu Management";
  else if (location.pathname.startsWith("/orders")) dashboardTitle = "Orders";
  else if (location.pathname.startsWith("/staff")) dashboardTitle = "Staff";
  else if (location.pathname.startsWith("/tables")) dashboardTitle = "Tables";
  else if (location.pathname.startsWith("/payments")) dashboardTitle = "Payments";
  else if (location.pathname.startsWith("/analytics")) dashboardTitle = "Analytics";
  else if (location.pathname.startsWith("/branding")) dashboardTitle = "Branding";
  else if (location.pathname.startsWith("/kds")) dashboardTitle = "KDS";

  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Main site header applied globally */}
      <Header />

      {/* Health status banner */}
      <HealthBanner />

      {/* Conditionally render DashboardHeader for certain dashboard subpages */}
      
      {/* Dashboard content area */}
      <main id="main-content" className="flex-1 bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}