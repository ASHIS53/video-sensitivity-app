import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
import {
  Shield,
  Building2,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Download,
} from "lucide-react";

export default function Tenants() {
  const { user, logout } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", organization: "" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", organization: "" });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      //  : Admin-only endpoint
      const res = await api.get("/admin/tenants");
      setTenants(res.data.tenants || []);
    } catch (err) {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      //  : Admin-only endpoint
      await api.post("/admin/tenants", formData);
      toast.success(" Tenant created successfully!");
      setFormData({ name: "", organization: "" });
      setCreating(false);
      fetchTenants();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create tenant");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (tenant) => {
    setEditingId(tenant._id); //  : _id not id
    setEditData({ name: tenant.name, organization: tenant.organization });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      //  : Admin-only endpoint
      await api.put(`/admin/tenants/${editingId}`, editData);
      toast.success(" Tenant updated!");
      setEditingId(null);
      fetchTenants();
    } catch (err) {
      toast.error("Failed to update tenant");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tenantId) => {
    if (
      !window.confirm(
        `Delete "${
          tenants.find((t) => t._id === tenantId)?.name
        }" tenant? All data will be lost!`
      )
    )
      return;
    try {
      setLoading(true);
      //  : Admin-only endpoint
      await api.delete(`/admin/tenants/${tenantId}`);
      toast.success(" Tenant deleted!");
      fetchTenants();
    } catch (err) {
      toast.error("Failed to delete tenant");
    } finally {
      setLoading(false); //  : Wrong state
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
          <p className="text-gray-600">Only admins can manage tenants</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-12 h-12 bg-indigo-100 text-indigo-600 p-3 rounded-xl" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tenant Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage organizations ({tenants.length} total)
              </p>
            </div>
          </div>
        </div>

        {/* Create Tenant Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Create New Tenant
            </h2>
          </div>

          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="funnailcorp"
                required
                disabled={creating}
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Funnail Corporation"
                disabled={creating}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="lg:col-span-3 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-2 justify-center"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Tenant"
              )}
            </button>
          </form>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              All Tenants ({tenants.length})
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
                    Organization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Videos
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {tenant.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {tenant.organization || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {tenant.userCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {tenant.videoCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(tenant)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 -m-1 rounded-lg hover:bg-indigo-50"
                        disabled={loading}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant._id)}
                        className="text-red-600 hover:text-red-900 p-1 -m-1 rounded-lg hover:bg-red-50"
                        disabled={loading}
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
