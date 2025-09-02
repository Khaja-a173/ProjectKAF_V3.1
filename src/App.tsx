// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Callback from '@/pages/auth/Callback';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import DashboardLayout from '@/layouts/DashboardLayout';

// Sub-dashboard pages
import MenuManagement from '@/pages/MenuManagement';
import OrderManagement from '@/pages/OrderManagement';
import TableManagement from '@/pages/TableManagement';
import StaffManagement from '@/pages/StaffManagement';
import KDS from '@/pages/KDS';
import Branding from '@/pages/Branding';
import Analytics from '@/pages/Analytics';
import AdminPayments from '@/pages/AdminPayments';

// Public pages
import Home from '@/pages/Home';
import Menu from '@/pages/Menu';
import Events from '@/pages/Events';
import Gallery from '@/pages/Gallery';
import LiveOrders from '@/pages/LiveOrders';
import Contact from '@/pages/Contact';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<Callback />} />

        {/* Public site pages (main header navigation targets) */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/live-orders" element={<LiveOrders />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu-management" element={<MenuManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/table-management" element={<TableManagement />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/kds" element={<KDS />} />
            <Route path="/branding" element={<Branding />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/payments" element={<AdminPayments />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}