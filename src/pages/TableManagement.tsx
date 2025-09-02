import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  Grid3X3,
  Users,
  Clock,
  MapPin,
  Settings,
  Plus,
  Edit,
  Trash2,
  QrCode,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  UserCheck,
  Coffee,
  Utensils,
  Eye,
  RotateCcw,
  Split,
  Merge,
  Bell,
  Download,
  Filter,
  Search,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";

interface Table {
  id: string;
  number: string;
  capacity: number;
  zone: string;
  status: "available" | "held" | "occupied" | "cleaning" | "out-of-service";
  session?: TableSession;
  position: { x: number; y: number };
  qrCode: string;
  notes?: string;
}

interface TableSession {
  id: string;
  tableId: string;
  customerName?: string;
  partySize: number;
  startTime: Date;
  status: "pending" | "active" | "paying" | "closed";
  waiter?: string;
  orderCount: number;
  totalAmount: number;
  elapsedTime: string;
}

interface Zone {
  id: string;
  name: string;
  color: string;
  tables: number;
  capacity: number;
}

export default function TableManagement() {
  const [activeView, setActiveView] = useState<
    "floor" | "sessions" | "analytics" | "settings"
  >("floor");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app this would come from API
  const [tables, setTables] = useState<Table[]>([
    {
      id: "T01",
      number: "T01",
      capacity: 4,
      zone: "main-hall",
      status: "occupied",
      position: { x: 100, y: 150 },
      qrCode: "QR_T01_ABC123",
      session: {
        id: "S001",
        tableId: "T01",
        customerName: "John Smith",
        partySize: 3,
        startTime: new Date(Date.now() - 45 * 60 * 1000),
        status: "active",
        waiter: "Sarah",
        orderCount: 2,
        totalAmount: 67.5,
        elapsedTime: "45m",
      },
    },
    {
      id: "T02",
      number: "T02",
      capacity: 2,
      zone: "window",
      status: "available",
      position: { x: 200, y: 100 },
      qrCode: "QR_T02_DEF456",
    },
    {
      id: "T03",
      number: "T03",
      capacity: 6,
      zone: "main-hall",
      status: "held",
      position: { x: 150, y: 250 },
      qrCode: "QR_T03_GHI789",
    },
    {
      id: "T04",
      number: "T04",
      capacity: 4,
      zone: "patio",
      status: "cleaning",
      position: { x: 300, y: 200 },
      qrCode: "QR_T04_JKL012",
    },
    {
      id: "T05",
      number: "T05",
      capacity: 8,
      zone: "private",
      status: "occupied",
      position: { x: 250, y: 300 },
      qrCode: "QR_T05_MNO345",
      session: {
        id: "S002",
        tableId: "T05",
        customerName: "Corporate Event",
        partySize: 8,
        startTime: new Date(Date.now() - 90 * 60 * 1000),
        status: "paying",
        waiter: "Mike",
        orderCount: 5,
        totalAmount: 245.8,
        elapsedTime: "1h 30m",
      },
    },
  ]);

  const zones: Zone[] = [
    {
      id: "main-hall",
      name: "Main Hall",
      color: "#3B82F6",
      tables: 12,
      capacity: 48,
    },
    {
      id: "window",
      name: "Window Seating",
      color: "#10B981",
      tables: 8,
      capacity: 24,
    },
    { id: "patio", name: "Patio", color: "#F59E0B", tables: 6, capacity: 32 },
    {
      id: "private",
      name: "Private Dining",
      color: "#8B5CF6",
      tables: 3,
      capacity: 24,
    },
    { id: "bar", name: "Bar Area", color: "#EF4444", tables: 5, capacity: 15 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "held":
        return "bg-yellow-500";
      case "occupied":
        return "bg-blue-500";
      case "cleaning":
        return "bg-orange-500";
      case "out-of-service":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "held":
        return <Timer className="w-4 h-4" />;
      case "occupied":
        return <Users className="w-4 h-4" />;
      case "cleaning":
        return <RotateCcw className="w-4 h-4" />;
      case "out-of-service":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredTables = tables.filter((table) => {
    const matchesZone = selectedZone === "all" || table.zone === selectedZone;
    const matchesStatus =
      selectedStatus === "all" || table.status === selectedStatus;
    const matchesSearch =
      table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.session?.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesZone && matchesStatus && matchesSearch;
  });

  const handleTableAction = (tableId: string, action: string) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          switch (action) {
            case "hold":
              return { ...table, status: "held" as const };
            case "seat":
              return {
                ...table,
                status: "occupied" as const,
                session: {
                  id: `S${Date.now()}`,
                  tableId,
                  partySize: 2,
                  startTime: new Date(),
                  status: "active" as const,
                  orderCount: 0,
                  totalAmount: 0,
                  elapsedTime: "0m",
                },
              };
            case "clean":
              return {
                ...table,
                status: "cleaning" as const,
                session: undefined,
              };
            case "available":
              return {
                ...table,
                status: "available" as const,
                session: undefined,
              };
            case "out-of-service":
              return {
                ...table,
                status: "out-of-service" as const,
                session: undefined,
              };
            default:
              return table;
          }
        }
        return table;
      }),
    );
  };

  const renderFloorView = () => (
    <div className="space-y-6">
      {/* Floor Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tables or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="held">Held</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="out-of-service">Out of Service</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zone Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {zones.map((zone) => {
          const zoneTables = tables.filter((t) => t.zone === zone.id);
          const occupied = zoneTables.filter(
            (t) => t.status === "occupied",
          ).length;
          const available = zoneTables.filter(
            (t) => t.status === "available",
          ).length;

          return (
            <div key={zone.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: zone.color }}
                ></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Occupied</span>
                  <span className="font-medium text-blue-600">
                    {occupied}/{zoneTables.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium text-green-600">
                    {available}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(occupied / zoneTables.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floor Map */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Floor Layout</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Held</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Cleaning</span>
            </div>
          </div>
        </div>

        <div className="relative bg-gray-50 rounded-lg h-96 overflow-hidden">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className={`absolute w-16 h-16 rounded-lg border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-all duration-200 ${getStatusColor(table.status)} flex items-center justify-center text-white font-semibold text-sm`}
              style={{
                left: `${table.position.x}px`,
                top: `${table.position.y}px`,
              }}
              onClick={() => {
                // Open table details modal
              }}
            >
              <div className="text-center">
                <div>{table.number}</div>
                <div className="text-xs opacity-75">{table.capacity}p</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Table Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Elapsed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(table.status)}`}
                      ></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {table.number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {table.capacity} seats
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {zones.find((z) => z.id === table.zone)?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(table.status)}`}
                    >
                      {getStatusIcon(table.status)}
                      <span className="ml-1 capitalize">
                        {table.status.replace("-", " ")}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {table.session ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {table.session.customerName || "Guest"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {table.session.partySize} guests • $
                          {table.session.totalAmount}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        No active session
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {table.session ? (
                      <span className="text-sm text-gray-900">
                        {table.session.elapsedTime}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {table.status === "available" && (
                        <button
                          onClick={() => handleTableAction(table.id, "hold")}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Hold
                        </button>
                      )}
                      {table.status === "held" && (
                        <button
                          onClick={() => handleTableAction(table.id, "seat")}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Seat
                        </button>
                      )}
                      {table.status === "occupied" && (
                        <button
                          onClick={() => handleTableAction(table.id, "clean")}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Clean
                        </button>
                      )}
                      {table.status === "cleaning" && (
                        <button
                          onClick={() =>
                            handleTableAction(table.id, "available")
                          }
                          className="text-green-600 hover:text-green-900"
                        >
                          Ready
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSessionsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Active Sessions
        </h3>
        <div className="space-y-4">
          {tables
            .filter((t) => t.session)
            .map((table) => (
              <div
                key={table.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${getStatusColor(table.status)} flex items-center justify-center text-white font-semibold`}
                    >
                      {table.number}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {table.session?.customerName || "Guest"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {table.session?.partySize} guests •{" "}
                        {zones.find((z) => z.id === table.zone)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ${table.session?.totalAmount}
                    </div>
                    <div className="text-sm text-gray-500">
                      {table.session?.elapsedTime}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Waiter: {table.session?.waiter}
                    </span>
                    <span className="text-sm text-gray-600">
                      Orders: {table.session?.orderCount}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm">
                      Transfer
                    </button>
                    <button className="text-orange-600 hover:text-orange-900 text-sm">
                      Split
                    </button>
                    <button className="text-red-600 hover:text-red-900 text-sm">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Table Utilization
              </p>
              <p className="text-2xl font-bold text-gray-900">73%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">
              ↗ +5.2% from last week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Turn Time</p>
              <p className="text-2xl font-bold text-gray-900">1h 24m</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600">
              ↘ -3.1% from last week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Revenue/Seat/Hour
              </p>
              <p className="text-2xl font-bold text-gray-900">$18.50</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">
              ↗ +8.7% from last week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">No-Show Rate</p>
              <p className="text-2xl font-bold text-gray-900">4.2%</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">
              ↘ -1.3% from last week
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Utilization by Zone
          </h3>
          <div className="space-y-4">
            {zones.map((zone) => {
              const utilization = Math.floor(Math.random() * 40) + 60; // Mock data
              return (
                <div key={zone.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {zone.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${utilization}%`,
                        backgroundColor: zone.color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Turn Time Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">&lt; 1 hour</span>
              <span className="text-sm font-medium">23%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">1-2 hours</span>
              <span className="text-sm font-medium">45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">2-3 hours</span>
              <span className="text-sm font-medium">28%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">&gt; 3 hours</span>
              <span className="text-sm font-medium">4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Table Management Settings
        </h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Status Timers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hold Timer (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cleaning Timer (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Zone Configuration
            </h4>
            <div className="space-y-3">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    ></div>
                    <span className="font-medium text-gray-900">
                      {zone.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {zone.tables} tables
                    </span>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Permissions
            </h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Allow table transfers
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Allow session merge/split
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Require manager override for status changes
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

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
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
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
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Settings
            </Link>
          </div>
        </nav>

        {/* Sub-navigation for Table Management */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link
              to="/table-management"
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
            >
              Table Management
            </Link>
            <button
              onClick={() => setActiveView("floor")}
              className={`pb-2 font-medium ${activeView === "floor" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Floor Management
            </button>
            <button
              onClick={() => setActiveView("sessions")}
              className={`pb-2 font-medium ${activeView === "sessions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Active Sessions
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className={`pb-2 font-medium ${activeView === "analytics" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveView("settings")}
              className={`pb-2 font-medium ${activeView === "settings" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Settings
            </button>
          </div>
        </nav>

        {/* Content */}
        {activeView === "floor" && renderFloorView()}
        {activeView === "sessions" && renderSessionsView()}
        {activeView === "analytics" && renderAnalyticsView()}
        {activeView === "settings" && renderSettingsView()}
      </div>
    </div>
  );
}
