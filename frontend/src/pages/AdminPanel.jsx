import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
import { Shield, Users, Video, Building2, BarChart3 } from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, videosRes, tenantsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/videos"),
        api.get("/admin/tenants"),
      ]);

      setStats({
        totalUsers: usersRes.data.users.length,
        totalVideos: videosRes.data.videos.length,
        totalTenants: tenantsRes.data.tenants.length,
        tenantBreakdown: tenantsRes.data.tenants.reduce((acc, t) => {
          acc[t._id] = {
            name: t.name,
            videos: t.videoCount || 0,
            users: t.userCount || 0,
          };
          return acc;
        }, {}),
      });
    } catch (error) {
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Complete system overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalVideos}
                </p>
                <p className="text-gray-600">Total Videos</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTenants}
                </p>
                <p className="text-gray-600">Total Tenants</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-gray-600">Uptime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="/admin/users"
            className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
          >
            <Users className="w-12 h-12 text-indigo-600 bg-indigo-50 rounded-xl p-3 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Manage Users
            </h3>
            <p className="text-gray-600 text-center">
              View all users across all tenants
            </p>
          </a>
          <a
            href="/admin/videos"
            className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
          >
            <Video className="w-12 h-12 text-purple-600 bg-purple-50 rounded-xl p-3 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              All Videos
            </h3>
            <p className="text-gray-600 text-center">
              View videos from all tenants
            </p>
          </a>
          <a
            href="/tenants"
            className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
          >
            <Building2 className="w-12 h-12 text-emerald-600 bg-emerald-50 rounded-xl p-3 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Tenants
            </h3>
            <p className="text-gray-600 text-center">
              Manage tenant organizations
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
