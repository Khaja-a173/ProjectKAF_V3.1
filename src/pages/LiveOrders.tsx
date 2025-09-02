import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
// import DashboardHeader from "../components/DashboardHeader";
import { useSessionManagement } from "../hooks/useSessionManagement";
import { format } from "date-fns";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  DollarSign,
  Eye,
  Bell,
  RefreshCw,
  Filter,
  Search,
  MapPin,
  Users,
  Timer,
  Activity,
  AlertTriangle,
  Star,
  Flame,
  Leaf,
  Package,
  CreditCard,
  Archive,
} from "lucide-react";

export default function LiveOrders() {
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get("order");
  
  const {
    orders,
    archivedOrders,
    loading,
  } = useSessionManagement({
    tenantId: "tenant_123",
    locationId: "location_456",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTable, setSelectedTable] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 5 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing live orders");
      setSearchTerm(prev => prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Scroll to highlighted order
  useEffect(() => {
    if (highlightOrderId) {
      setTimeout(() => {
        const element = document.getElementById(`order-${highlightOrderId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-4", "ring-blue-500", "ring-opacity-50");
          setTimeout(() => {
            element.classList.remove("ring-4", "ring-blue-500", "ring-opacity-50");
          }, 3000);
        }
      }, 500);
    }
  }, [highlightOrderId, orders]);

  console.log("LiveOrders - Current orders:", orders.length);
  console.log("LiveOrders - Archived orders:", archivedOrders.length);

  // Group orders by status
  const ordersByStatus = {
    placed: orders.filter(o => o.status === "placed"),
    confirmed: orders.filter(o => o.status === "confirmed"),
    preparing: orders.filter(o => o.status === "preparing"),
    ready: orders.filter(o => o.status === "ready"),
    delivering: orders.filter(o => o.status === "delivering"),
    served: orders.filter(o => o.status === "served"),
    paying: orders.filter(o => o.status === "paying"),
    completed: archivedOrders.filter(o => ["paid", "closed"].includes(o.status)),
  };

  const allTables = [...new Set([
    ...orders.map(o => o.tableId),
    ...archivedOrders.map(o => o.tableId)
  ])].filter(Boolean).sort();

  const filteredOrdersByStatus = Object.fromEntries(
    Object.entries(ordersByStatus).map(([status, statusOrders]) => [
      status,
      statusOrders.filter(order => {
        const matchesSearch = 
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.tableId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTable = selectedTable === "all" || order.tableId === selectedTable;
        return matchesSearch && matchesTable;
      })
    ])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "bg-yellow-500";
      case "confirmed": return "bg-blue-500";
      case "preparing": return "bg-orange-500";
      case "ready": return "bg-green-500";
      case "delivering": return "bg-purple-500";
      case "served": return "bg-gray-500";
      case "paying": return "bg-indigo-500";
      case "paid": return "bg-emerald-500";
      case "closed": return "bg-slate-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "preparing": return <ChefHat className="w-4 h-4" />;
      case "ready": return <Package className="w-4 h-4" />;
      case "delivering": return <Truck className="w-4 h-4" />;
      case "served": return <CheckCircle className="w-4 h-4" />;
      case "paying": return <CreditCard className="w-4 h-4" />;
      case "paid": return <DollarSign className="w-4 h-4" />;
      case "closed": return <Archive className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDietaryIcons = (item: any) => {
    const icons = [];
    if (item.isVegan) icons.push(<Leaf key="vegan" className="w-3 h-3 text-green-600" aria-label="Vegan" />);
    else if (item.isVegetarian) icons.push(<Leaf key="vegetarian" className="w-3 h-3 text-green-500" aria-label="Vegetarian" />);
    
    if (item.spicyLevel > 0) {
      icons.push(
        <div key="spicy" className="flex" aria-label={`Spicy Level: ${item.spicyLevel}`}>
          {[...Array(item.spicyLevel)].map((_, i) => (
            <Flame key={i} className="w-3 h-3 text-red-500" />
          ))}
        </div>
      );
    }
    
    return icons;
  };

  const formatElapsedTime = (placedAt: Date) => {
    const minutes = Math.floor((Date.now() - placedAt.getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const renderOrderCard = (order: any, isHighlighted = false) => (
    <div
      id={`order-${order.id}`}
      key={order.id}
      className={`bg-white rounded-xl shadow-lg border-l-4 p-6 hover:shadow-xl transition-all ${
        isHighlighted ? "ring-4 ring-blue-500 ring-opacity-50" : ""
      } ${
        order.priority === "urgent" ? "border-red-500 bg-red-50" :
        order.priority === "high" ? "border-orange-500 bg-orange-50" :
        "border-gray-300"
      }`}
    >
      {/* Order Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg ${getStatusColor(order.status)} flex items-center justify-center text-white`}>
            {getStatusIcon(order.status)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{order.tableId}</span>
              <span>•</span>
              <Users className="w-3 h-3" />
              <span>Session #{order.sessionId.slice(-6)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            ${order.totalAmount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {formatElapsedTime(order.placedAt)}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {item.quantity}x {item.name}
              </span>
              <div className="flex items-center space-x-1">
                {getDietaryIcons(item)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                item.status === "queued" ? "bg-gray-500" :
                item.status === "in_progress" ? "bg-orange-500" :
                item.status === "ready_item" ? "bg-green-500" :
                item.status === "served_item" ? "bg-blue-500" :
                "bg-gray-400"
              }`}>
                {item.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>Special Instructions:</strong> {order.specialInstructions}
          </div>
        </div>
      )}

      {/* Order Timeline */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Placed: {format(order.placedAt, "HH:mm:ss")}</div>
        {order.confirmedAt && (
          <div>Confirmed: {format(order.confirmedAt, "HH:mm:ss")}</div>
        )}
        {order.readyAt && (
          <div>Ready: {format(order.readyAt, "HH:mm:ss")}</div>
        )}
        {order.servedAt && (
          <div>Served: {format(order.servedAt, "HH:mm:ss")}</div>
        )}
        {order.paidAt && (
          <div>Paid: {format(order.paidAt, "HH:mm:ss")}</div>
        )}
      </div>

      {/* Estimated Ready Time */}
      {order.estimatedReadyAt && order.status !== "served" && order.status !== "paid" && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <Timer className="w-4 h-4" />
            <span>Est. Ready: {format(order.estimatedReadyAt, "HH:mm")}</span>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading live orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders or tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Tables</option>
                {allTables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Auto-refresh</span>
              </label>
              
              <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">🔍 Live Order Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{filteredOrdersByStatus.placed.length}</div>
              <div className="text-yellow-800">Placed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredOrdersByStatus.confirmed.length}</div>
              <div className="text-blue-800">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{filteredOrdersByStatus.preparing.length}</div>
              <div className="text-orange-800">Preparing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filteredOrdersByStatus.ready.length}</div>
              <div className="text-green-800">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{filteredOrdersByStatus.delivering.length}</div>
              <div className="text-purple-800">Delivering</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{filteredOrdersByStatus.served.length}</div>
              <div className="text-gray-800">Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{filteredOrdersByStatus.paying.length}</div>
              <div className="text-indigo-800">Paying</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{filteredOrdersByStatus.completed.length}</div>
              <div className="text-emerald-800">Completed</div>
            </div>
          </div>
        </div>

        {/* VERTICAL Order Status Sections */}
        <div className="space-y-8">
          {/* Order Placed */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Order Placed ({filteredOrdersByStatus.placed.length})
              </h2>
              <div className="text-sm text-gray-500">Awaiting confirmation</div>
            </div>
            
            {filteredOrdersByStatus.placed.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders placed yet</p>
                <p className="text-sm text-gray-500">New orders will appear here when customers place them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrdersByStatus.placed.map(order => 
                  renderOrderCard(order, order.id === highlightOrderId)
                )}
              </div>
            )}
          </section>

          {/* Confirmed */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Confirmed ({filteredOrdersByStatus.confirmed.length})
              </h2>
              <div className="text-sm text-gray-500">Sent to kitchen</div>
            </div>
            
            {filteredOrdersByStatus.confirmed.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No confirmed orders</p>
                <p className="text-sm text-gray-500">Confirmed orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrdersByStatus.confirmed.map(order => 
                  renderOrderCard(order, order.id === highlightOrderId)
                )}
              </div>
            )}
          </section>

          {/* Preparing */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Preparing ({filteredOrdersByStatus.preparing.length})
              </h2>
              <div className="text-sm text-gray-500">Kitchen is cooking</div>
            </div>
            
            {filteredOrdersByStatus.preparing.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders being prepared</p>
                <p className="text-sm text-gray-500">Orders being cooked will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrdersByStatus.preparing.map(order => 
                  renderOrderCard(order, order.id === highlightOrderId)
                )}
              </div>
            )}
          </section>

          {/* Ready */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Ready ({filteredOrdersByStatus.ready.length})
              </h2>
              <div className="text-sm text-gray-500">Ready for pickup</div>
            </div>
            
            {filteredOrdersByStatus.ready.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders ready</p>
                <p className="text-sm text-gray-500">Ready orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrdersByStatus.ready.map(order => 
                  renderOrderCard(order, order.id === highlightOrderId)
                )}
              </div>
            )}
          </section>

          {/* Out for Delivery */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Out for Delivery ({filteredOrdersByStatus.delivering.length})
              </h2>
              <div className="text-sm text-gray-500">Staff delivering</div>
            </div>
            
            {filteredOrdersByStatus.delivering.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders out for delivery</p>
                <p className="text-sm text-gray-500">Orders being delivered will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrdersByStatus.delivering.map(order => 
                  renderOrderCard(order, order.id === highlightOrderId)
                )}
              </div>
            )}
          </section>

          {/* Served */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Served ({filteredOrdersByStatus.served.length})
              </h2>
              <div className="text-sm text-gray-500">Delivered to table</div>
            </div>
            
            {filteredOrdersByStatus.served.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No served orders</p>
                <p className="text-sm text-gray-500">Served orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrdersByStatus.served.map(order => 
                  renderOrderCard(order, order.id === highlightOrderId)
                )}
              </div>
            )}
          </section>

          {/* Payment Processing */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Payment Processing ({filteredOrdersByStatus.paying.length})
              </h2>
              <div className="text-sm text-gray-500">Processing payment</div>
            </div>
            
            {filteredOrdersByStatus.paying.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No payments being processed</p>
                <p className="text-sm text-gray-500">Payment processing orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrdersByStatus.paying.map(order => 
                  renderOrderCard(order, order.id === highlightOrderId)
                )}
              </div>
            )}
          </section>

          {/* Completed Orders */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Archive className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Completed ({filteredOrdersByStatus.completed.length})
              </h2>
              <div className="text-sm text-gray-500">Paid and closed</div>
            </div>
            
            {filteredOrdersByStatus.completed.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No completed orders</p>
                <p className="text-sm text-gray-500">Completed orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrdersByStatus.completed.map(order => 
                  renderOrderCard(order, order.id === highlightOrderId)
                )}
              </div>
            )}
          </section>
        </div>

        {/* Real-time Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Live Restaurant Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{orders.length}</div>
              <div className="text-blue-100">Active Orders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {orders.filter(o => ["preparing", "ready"].includes(o.status)).length}
              </div>
              <div className="text-blue-100">In Kitchen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)}
              </div>
              <div className="text-blue-100">Active Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {Math.round(orders.length > 0 ? 
                  orders.reduce((sum, o) => sum + (Date.now() - o.placedAt.getTime()), 0) / 
                  (orders.length * 1000 * 60) : 0)}m
              </div>
              <div className="text-blue-100">Avg Wait Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}