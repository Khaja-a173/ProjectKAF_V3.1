import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, getErrorMessage, apiFetch } from '@/lib/api';
import DashboardHeader from '../components/DashboardHeader';
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Calendar,
  Clock,
  Shield,
  ChefHat,
  DollarSign,
  X,
  Plus
} from 'lucide-react';

// Lightweight HTTP helpers (aligned with our unified API layer)
async function getJSON<T>(path: string, opts: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await apiFetch(path, { method: 'GET', signal: opts.signal });
  return res as T;
}

async function postJSON<T>(path: string, body: any, opts: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body, signal: opts.signal });
  return res as T;
}

async function del(path: string, opts: { signal?: AbortSignal } = {}): Promise<void> {
  await apiFetch(path, { method: 'DELETE', signal: opts.signal });
}
const toStaffRole = (r: string): string => {
  const k = String(r || '').toLowerCase();
  if (k === 'staff' || k === 'cashier') return 'waiter';
  return k;
};

// Minimal server adapters (accepts either array or {staff: [], shifts: []})
async function apiGetStaff(): Promise<StaffMember[]> {
  const data: any = await getJSON<any>('/staff');
  return Array.isArray(data) ? data as StaffMember[] : (data?.staff ?? []);
}

async function apiGetShifts(): Promise<Shift[]> {
  const data: any = await getJSON<any>('/shifts');
  return Array.isArray(data) ? data as Shift[] : (data?.shifts ?? []);
}

async function apiAddStaff(payload: { user_id: string; role: string }): Promise<void> {
  await postJSON('/staff', { user_id: payload.user_id, role: toStaffRole(payload.role) });
}
async function apiInviteUser(payload: { email: string; role: string; tenant_id?: string }): Promise<{ id: string; status: string }>{
  return await postJSON('/users/invite', payload);
}

async function apiRemoveStaff(userId: string): Promise<void> {
  await del(`/staff/${userId}`);
}

interface StaffMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  created_at: string;
  users?: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    avatar_url?: string;
    is_active: boolean;
    last_login_at?: string;
  };
}

interface Shift {
  id: string;
  tenant_id: string;
  staff_user_id: string;
  role: string;
  starts_at: string;
  ends_at: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'shifts'>('staff');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffList, shiftList] = await Promise.all([
        apiGetStaff(),
        apiGetShifts(),
      ]);
      setStaff(staffList);
      setShifts(shiftList);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load staff data:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    try {
      await apiAddStaff({
        user_id: String(formData.get('user_id') || ''),
        role: String(formData.get('role') || ''),
      });
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      alert('Failed to add staff: ' + getErrorMessage(err));
    }
  };

  const handleRemoveStaff = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await apiRemoveStaff(userId);
      loadData();
    } catch (err: any) {
      alert('Failed to remove staff: ' + getErrorMessage(err));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'kitchen': return 'bg-orange-100 text-orange-800';
      case 'cashier': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'manager': return <Users className="w-4 h-4" />;
      case 'staff': return <Users className="w-4 h-4" />;
      case 'kitchen': return <ChefHat className="w-4 h-4" />;
      case 'cashier': return <DollarSign className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const filteredStaff = staff.filter(member => {
    const user = member.users;
    const fn = (user?.first_name || '').toLowerCase();
    const ln = (user?.last_name || '').toLowerCase();
    const em = (user?.email || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = fn.includes(q) || ln.includes(q) || em.includes(q);
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Staff Management" subtitle="Manage staff members and schedules" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading staff...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Staff Management" subtitle="Manage staff members and schedules" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">
              Orders
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu
            </Link>
            <Link to="/tables" className="text-gray-500 hover:text-gray-700 pb-2">
              Tables
            </Link>
            <Link to="/staff" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Staff
            </Link>
            <Link to="/kds" className="text-gray-500 hover:text-gray-700 pb-2">
              Kitchen
            </Link>
            <Link to="/branding" className="text-gray-500 hover:text-gray-700 pb-2">
              Branding
            </Link>
          </div>
        </nav>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'staff' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Staff Members
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'shifts' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Shifts
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">Error loading staff: {error}</div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
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
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="cashier">Cashier</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Staff</span>
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite User</span>
                </button>
              </div>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {(member.users?.first_name?.[0] || '').toUpperCase()}{(member.users?.last_name?.[0] || '').toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {`${member.users?.first_name ?? ''} ${member.users?.last_name ?? ''}`.trim() || '—'}
                              </div>
                              <div className="text-sm text-gray-500">{member.users?.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {getRoleIcon(member.role)}
                            <span className="ml-1 capitalize">{member.role}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.users?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {member.users?.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {member.users?.last_login_at 
                            ? new Date(member.users.last_login_at).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRemoveStaff(member.user_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Shifts Tab */}
        {activeTab === 'shifts' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Shifts</h3>
            
            {shifts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts scheduled</h3>
                <p className="text-gray-600">No upcoming shifts found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shifts.map((shift) => (
                  <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {`${shift.users?.first_name ?? ''} ${shift.users?.last_name ?? ''}`.trim() || '—'}
                          </h4>
                          <p className="text-sm text-gray-500">{shift.users?.email || '—'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(shift.starts_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(shift.starts_at).toLocaleTimeString()} - {new Date(shift.ends_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Staff Member</h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                  <input
                    name="user_id"
                    type="text"
                    required
                    placeholder="UUID of existing user"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="cashier">Cashier</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Staff</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}