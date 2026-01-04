import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
import { User, Mail, Shield, Trash2, Building2 } from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reassigning, setReassigning] = useState({});
  const [roleOptions] = useState(["viewer", "editor", "admin"]);

  useEffect(() => {
    fetchUsers();
    fetchTenants();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users"); //  CORRECT
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  //  : Use /admin/tenants (matches backend)
  const fetchTenants = async () => {
    try {
      const res = await api.get("/admin/tenants"); //  : /admin/tenants
      setTenants(res.data.tenants || []);
    } catch (err) {
      console.error("Failed to fetch tenants");
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setLoading(true);
      await api.put(`/admin/users/${userId}/role`, { role: newRole }); //  CORRECT
      toast.success(" Role updated!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  //  : Use POST /admin/users/reassign-tenant (matches backend)
  const handleTenantReassign = async (userId, tenantId) => {
    if (!tenantId || tenantId === users.find((u) => u._id === userId)?.tenantId)
      return;

    try {
      setReassigning((prev) => ({ ...prev, [userId]: true }));
      //  : POST instead of PUT, correct endpoint
      await api.post("/admin/users/reassign-tenant", { userId, tenantId });
      toast.success(" User moved to new tenant!");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reassign tenant");
    } finally {
      setReassigning((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      setLoading(true);
      // TODO: Add DELETE endpoint later
      toast.error("Delete endpoint not implemented yet");
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Access Required
          </h1>
          <p className="text-gray-600">Only admins can manage users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <User className="w-12 h-12 bg-indigo-100 text-indigo-600 p-3 rounded-xl" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              ALL users across ALL tenants ({users.length})
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Global User Management
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {u.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {u.tenantName || u.tenantId?.name || "default"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : u.role === "editor"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <select
                        value={u.role || "viewer"}
                        onChange={(e) =>
                          handleRoleUpdate(u._id, e.target.value)
                        }
                        disabled={loading}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <select
                        value={u.tenantId?._id || u.tenantId || ""}
                        onChange={(e) =>
                          handleTenantReassign(u._id, e.target.value)
                        }
                        disabled={reassigning[u._id] || loading}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        <option value="">Move Tenant</option>
                        {tenants.map((tenant) => (
                          <option key={tenant._id} value={tenant._id}>
                            {tenant.name}{" "}
                            {tenant.organization
                              ? `(${tenant.organization})`
                              : ""}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 p-1.5 -m-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        title="Delete not implemented"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
