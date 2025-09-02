import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import {
  ChefHat,
  Users,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
  Bell,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  RotateCcw,
  Key,
  Smartphone,
  Calendar,
  BarChart3,
  DollarSign,
  TrendingUp,
  Award,
  Target,
  Zap,
  RefreshCw,
  Plus,
  Send,
  QrCode,
  FileText,
  Globe,
  Lock,
  Unlock,
  UserCog,
  Building,
  Timer,
  Star,
  Edit,
} from "lucide-react";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "invited" | "active" | "suspended" | "expired";
  roles: StaffRole[];
  locations: StaffLocation[];
  lastActive: Date;
  isOnline: boolean;
  deviceCount: number;
  joinedDate: Date;
  avatar?: string;
  emergencyContact?: string;
  notes?: string;
}

interface StaffRole {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  capabilities: string[];
  isCustom: boolean;
}

interface StaffLocation {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export default function StaffManagement() {
  const [activeView, setActiveView] = useState<
    | "directory"
    | "assignments"
    | "shifts"
    | "policies"
    | "security"
    | "analytics"
  >("directory");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Mock data - in real app this would come from API
  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: "S001",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@restaurant.com",
      phone: "+1 (555) 123-4567",
      status: "active",
      roles: [
        {
          id: "manager",
          name: "MANAGER",
          displayName: "Manager",
          color: "#3B82F6",
          icon: "UserCog",
          capabilities: ["manage_tables", "view_reports", "manage_staff"],
          isCustom: false,
        },
      ],
      locations: [
        {
          id: "loc1",
          name: "Main Location",
          address: "123 Main St",
          isActive: true,
        },
      ],
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      isOnline: true,
      deviceCount: 2,
      joinedDate: new Date("2023-01-15"),
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      id: "S002",
      firstName: "Mike",
      lastName: "Chen",
      email: "mike.chen@restaurant.com",
      phone: "+1 (555) 234-5678",
      status: "active",
      roles: [
        {
          id: "waiter",
          name: "WAITER",
          displayName: "Waiter",
          color: "#10B981",
          icon: "Users",
          capabilities: ["manage_orders", "handle_payments"],
          isCustom: false,
        },
      ],
      locations: [
        {
          id: "loc1",
          name: "Main Location",
          address: "123 Main St",
          isActive: true,
        },
      ],
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
      isOnline: true,
      deviceCount: 1,
      joinedDate: new Date("2023-03-20"),
    },
    {
      id: "S003",
      firstName: "Emma",
      lastName: "Davis",
      email: "emma.davis@restaurant.com",
      phone: "+1 (555) 345-6789",
      status: "active",
      roles: [
        {
          id: "chef",
          name: "CHEF",
          displayName: "Chef",
          color: "#F59E0B",
          icon: "ChefHat",
          capabilities: ["manage_kitchen", "view_orders"],
          isCustom: false,
        },
      ],
      locations: [
        {
          id: "loc1",
          name: "Main Location",
          address: "123 Main St",
          isActive: true,
        },
      ],
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isOnline: false,
      deviceCount: 1,
      joinedDate: new Date("2023-02-10"),
    },
    {
      id: "S004",
      firstName: "James",
      lastName: "Wilson",
      email: "james.wilson@restaurant.com",
      phone: "+1 (555) 456-7890",
      status: "invited",
      roles: [
        {
          id: "host",
          name: "HOST",
          displayName: "Host",
          color: "#8B5CF6",
          icon: "UserCheck",
          capabilities: ["manage_reservations", "seat_guests"],
          isCustom: false,
        },
      ],
      locations: [
        {
          id: "loc1",
          name: "Main Location",
          address: "123 Main St",
          isActive: true,
        },
      ],
      lastActive: new Date("2023-12-01"),
      isOnline: false,
      deviceCount: 0,
      joinedDate: new Date("2023-12-01"),
    },
  ]);

  const defaultRoles: StaffRole[] = [
    {
      id: "owner",
      name: "OWNER",
      displayName: "Owner",
      color: "#DC2626",
      icon: "Crown",
      capabilities: ["all"],
      isCustom: false,
    },
    {
      id: "admin",
      name: "ADMIN",
      displayName: "Admin",
      color: "#7C2D12",
      icon: "Shield",
      capabilities: ["manage_all", "view_all"],
      isCustom: false,
    },
    {
      id: "manager",
      name: "MANAGER",
      displayName: "Manager",
      color: "#3B82F6",
      icon: "UserCog",
      capabilities: ["manage_tables", "view_reports", "manage_staff"],
      isCustom: false,
    },
    {
      id: "host",
      name: "HOST",
      displayName: "Host",
      color: "#8B5CF6",
      icon: "UserCheck",
      capabilities: ["manage_reservations", "seat_guests"],
      isCustom: false,
    },
    {
      id: "waiter",
      name: "WAITER",
      displayName: "Waiter",
      color: "#10B981",
      icon: "Users",
      capabilities: ["manage_orders", "handle_payments"],
      isCustom: false,
    },
    {
      id: "cashier",
      name: "CASHIER",
      displayName: "Cashier",
      color: "#059669",
      icon: "DollarSign",
      capabilities: ["handle_payments", "issue_refunds"],
      isCustom: false,
    },
    {
      id: "chef",
      name: "CHEF",
      displayName: "Chef",
      color: "#F59E0B",
      icon: "ChefHat",
      capabilities: ["manage_kitchen", "view_orders"],
      isCustom: false,
    },
    {
      id: "kds",
      name: "KDS",
      displayName: "Kitchen Display",
      color: "#EF4444",
      icon: "Monitor",
      capabilities: ["view_orders", "update_status"],
      isCustom: false,
    },
    {
      id: "runner",
      name: "RUNNER",
      displayName: "Runner",
      color: "#6366F1",
      icon: "Zap",
      capabilities: ["deliver_orders", "update_status"],
      isCustom: false,
    },
  ];

  const locations: StaffLocation[] = [
    {
      id: "loc1",
      name: "Main Location",
      address: "123 Main St",
      isActive: true,
    },
    {
      id: "loc2",
      name: "Downtown Branch",
      address: "456 Downtown Ave",
      isActive: true,
    },
    {
      id: "loc3",
      name: "Mall Location",
      address: "789 Mall Blvd",
      isActive: false,
    },
  ];

  const filteredStaff = staff.filter((member) => {
    const matchesRole =
      selectedRole === "all" ||
      member.roles.some((role) => role.id === selectedRole);
    const matchesStatus =
      selectedStatus === "all" || member.status === selectedStatus;
    const matchesLocation =
      selectedLocation === "all" ||
      member.locations.some((loc) => loc.id === selectedLocation);
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesStatus && matchesLocation && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "invited":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "invited":
        return <Clock className="w-4 h-4" />;
      case "suspended":
        return <XCircle className="w-4 h-4" />;
      case "expired":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleStaffAction = (staffId: string, action: string) => {
    setStaff((prev) =>
      prev.map((member) => {
        if (member.id === staffId) {
          switch (action) {
            case "activate":
              return { ...member, status: "active" as const };
            case "suspend":
              return { ...member, status: "suspended" as const };
            case "resend-invite":
              // In real app, this would trigger email/SMS
              return member;
            default:
              return member;
          }
        }
        return member;
      }),
    );
  };

  const renderDirectoryView = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {defaultRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.displayName}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Staff</span>
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter((s) => s.isOnline).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Invites
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter((s) => s.status === "invited").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locations</p>
              <p className="text-2xl font-bold text-gray-900">
                {locations.filter((l) => l.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Staff Directory
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative">
                        {member.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={member.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                        {member.isOnline && (
                          <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {member.roles.map((role) => (
                        <span
                          key={role.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: role.color }}
                        >
                          {role.displayName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}
                    >
                      {getStatusIcon(member.status)}
                      <span className="ml-1 capitalize">{member.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.locations.map((loc) => loc.name).join(", ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.isOnline
                        ? "Online"
                        : `${Math.floor((Date.now() - member.lastActive.getTime()) / (1000 * 60))}m ago`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {member.status === "invited" && (
                        <button
                          onClick={() =>
                            handleStaffAction(member.id, "resend-invite")
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Resend
                        </button>
                      )}
                      {member.status === "active" && (
                        <button
                          onClick={() =>
                            handleStaffAction(member.id, "suspend")
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          Suspend
                        </button>
                      )}
                      {member.status === "suspended" && (
                        <button
                          onClick={() =>
                            handleStaffAction(member.id, "activate")
                          }
                          className="text-green-600 hover:text-green-900"
                        >
                          Activate
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
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

  const renderAssignmentsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Role Assignments
        </h3>

        <div className="space-y-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {member.avatar ? (
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={member.avatar}
                        alt=""
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    {member.isOnline && (
                      <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">
                    Add Role
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {member.roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      ></span>
                      <span className="text-sm font-medium text-gray-900">
                        {role.displayName}
                      </span>
                      <button className="text-red-500 hover:text-red-700">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Locations:</span>{" "}
                  {member.locations.map((loc) => loc.name).join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShiftsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Shift Management
          </h3>
          <div className="flex items-center space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Schedule Shift</span>
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Live Shift Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">
              Clocked In (3)
            </h4>
            <div className="space-y-2">
              {staff
                .filter((s) => s.isOnline)
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">8:30 AM</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-3">
              Scheduled (2)
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Alex Thompson</span>
                </div>
                <span className="text-xs text-gray-500">2:00 PM</span>
              </div>
              <div className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Lisa Park</span>
                </div>
                <span className="text-xs text-gray-500">6:00 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-3">Missed (1)</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">John Doe</span>
                </div>
                <span className="text-xs text-gray-500">9:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPoliciesView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Role Policies & Capabilities
        </h3>

        <div className="space-y-6">
          {defaultRoles.map((role) => (
            <div
              key={role.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {role.displayName}
                    </h4>
                    <p className="text-sm text-gray-500">{role.name}</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {role.capabilities.map((capability) => (
                  <div key={capability} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700 capitalize">
                      {capability.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Security & Device Management
        </h3>

        <div className="space-y-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {member.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={member.avatar}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    {member.isOnline && (
                      <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Smartphone className="w-3 h-3" />
                        <span>{member.deviceCount} devices</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>Last IP: 192.168.1.100</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-orange-600 hover:text-orange-900 text-sm">
                    Force Logout
                  </button>
                  <button className="text-red-600 hover:text-red-900 text-sm">
                    Revoke Access
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
                Avg Handle Time
              </p>
              <p className="text-2xl font-bold text-gray-900">4.2m</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">
              ↗ -0.3m from last week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Orders/Staff/Hour
              </p>
              <p className="text-2xl font-bold text-gray-900">12.5</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">
              ↗ +2.1 from last week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Customer Rating
              </p>
              <p className="text-2xl font-bold text-gray-900">4.8/5</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">
              ↗ +0.2 from last week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Shift Adherence
              </p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600">
              ↘ -1.2% from last week
            </span>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performers
          </h3>
          <div className="space-y-4">
            {staff.slice(0, 5).map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.roles[0]?.displayName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">98.5%</p>
                  <p className="text-sm text-gray-500">Efficiency</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Role Distribution
          </h3>
          <div className="space-y-3">
            {defaultRoles.slice(0, 6).map((role) => {
              const count = staff.filter((s) =>
                s.roles.some((r) => r.id === role.id),
              ).length;
              const percentage =
                staff.length > 0 ? (count / staff.length) * 100 : 0;

              return (
                <div key={role.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {role.displayName}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: role.color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

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

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Live</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
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
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
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

        {/* Sub-navigation for Staff Management */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveView("directory")}
              className={`pb-2 font-medium ${activeView === "directory" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Staff Directory
            </button>
            <button
              onClick={() => setActiveView("assignments")}
              className={`pb-2 font-medium ${activeView === "assignments" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Role Assignments
            </button>
            <button
              onClick={() => setActiveView("shifts")}
              className={`pb-2 font-medium ${activeView === "shifts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Shift Management
            </button>
            <button
              onClick={() => setActiveView("policies")}
              className={`pb-2 font-medium ${activeView === "policies" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Policies
            </button>
            <button
              onClick={() => setActiveView("security")}
              className={`pb-2 font-medium ${activeView === "security" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className={`pb-2 font-medium ${activeView === "analytics" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Analytics
            </button>
          </div>
        </nav>

        {/* Content */}
        {activeView === "directory" && renderDirectoryView()}
        {activeView === "assignments" && renderAssignmentsView()}
        {activeView === "shifts" && renderShiftsView()}
        {activeView === "policies" && renderPoliciesView()}
        {activeView === "security" && renderSecurityView()}
        {activeView === "analytics" && renderAnalyticsView()}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invite New Staff Member
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="staff@restaurant.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {defaultRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Invite</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
