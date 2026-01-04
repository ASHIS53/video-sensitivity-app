import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Building2, Users, Video, Shield } from "lucide-react"; //  NEW Icons

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [videosCount, setVideosCount] = useState(0);

  const isDashboard = location.pathname === "/dashboard";
  const isLogin = location.pathname === "/" || location.pathname === "/login";
  const isAdmin = user?.role === "admin"; //  NEW: Admin check

  //  FIX #1: Only get video count on dashboard
  useEffect(() => {
    if (isDashboard) {
      const count = localStorage.getItem("videosCount") || "0";
      setVideosCount(parseInt(count));
    }
  }, [isDashboard]);

  //  FIX #2: Listen for storage changes only on dashboard
  useEffect(() => {
    if (!isDashboard) return;

    const handleStorageChange = () => {
      const count = localStorage.getItem("videosCount") || "0";
      setVideosCount(parseInt(count));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isDashboard]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  //  FIX #3: HIDE USER SECTION ON LOGIN PAGE
  if (isLogin) {
    return (
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Only - No user section on login */}
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-200"
              title="VideoSense"
            >
              <svg className="w-10 h-10 p-1.5" viewBox="0 0 48 48" fill="none">
                <path
                  d="M12 14a2 2 0 00-2 2v16a2 2 0 002 2h24a2 2 0 002-2V16a2 2 0 00-2-2H12z"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="#4F46E5"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="7"
                  fill="#EC4899"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M20 19l7 5-7 5V19z"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
                <circle cx="40" cy="12" r="3" fill="#EF4444" />
              </svg>
              VideoSense
            </Link>

            {/* Mobile menu button - Hidden on login */}
            <button
              className="md:hidden p-1 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    );
  }

  //  NORMAL NAVBAR - For dashboard/player pages
  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-200"
            title="VideoSense Dashboard"
          >
            <svg className="w-10 h-10 p-1.5" viewBox="0 0 48 48" fill="none">
              <path
                d="M12 14a2 2 0 00-2 2v16a2 2 0 002 2h24a2 2 0 002-2V16a2 2 0 00-2-2H12z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#4F46E5"
              />
              <circle
                cx="24"
                cy="24"
                r="7"
                fill="#EC4899"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M20 19l7 5-7 5V19z"
                fill="white"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <circle cx="40" cy="12" r="3" fill="#EF4444" />
            </svg>
            VideoSense
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/*  NEW: TENANT INFO SECTION */}
            {user?.tenantName && (
              <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl shadow-sm border border-indigo-100">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-800 hidden sm:block">
                  {user.tenantName}
                </span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </div>
            )}

            {/* Dashboard stats */}
            {isDashboard && (
              <div className="flex items-center gap-6 bg-gray-50 px-4 py-2 rounded-xl shadow-sm">
                <Link
                  to="/dashboard"
                  className="group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                </Link>
              </div>
            )}

            {/* User section - Only when logged in */}
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium hidden lg:block">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Hi, {user.name || user.email.split("@")[0]}
                  {isAdmin && (
                    <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-bold">
                      ADMIN
                    </span>
                  )}
                </div>

                {/*  NEW: TENANT MANAGEMENT (Admin Only) */}
                {isAdmin && (
                  <Link
                    to="/tenants"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <Building2 className="w-4 h-4" />
                    Tenants
                  </Link>
                )}

                {/*  UPDATED: Users Management (Admin Only) */}
                {isAdmin && (
                  <Link
                    to="/admin/users"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                {(user.role === "editor" || user.role === "admin") && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <Video className="w-4 h-4" />
                    Videos
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-1 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/*  UPDATED MOBILE NAVIGATION */}
        {isOpen && user && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            {/*  NEW: Mobile Tenant Info */}
            {user?.tenantName && (
              <div className="py-3 px-4 bg-indigo-50 rounded-xl mx-4 mt-4 shadow-sm border">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-indigo-800 truncate">
                      {user.tenantName}
                    </p>
                    <p className="text-xs text-indigo-600">Active Tenant</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/tenants"
                      className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full font-medium hover:bg-indigo-50"
                    >
                      Manage
                    </Link>
                  )}
                </div>
              </div>
            )}

            {isDashboard && (
              <div className="py-3 px-2">
                <div className="flex items-center gap-2 bg-indigo-50 p-4 rounded-lg mb-3 shadow-sm mx-2">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping flex-shrink-0"></div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800 min-w-0 flex-1">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="truncate">Live</span>
                    <svg
                      className="w-4 h-4 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                    <span>{videosCount}</span>
                    <span className="text-gray-500">videos</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 px-2">
              <div className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 font-semibold bg-gray-50 rounded-xl">
                <svg
                  className="w-6 h-6 text-indigo-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="font-medium">
                  Hi, {user.name || user.email.split("@")[0]}
                  {isAdmin && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-bold">
                      ADMIN
                    </span>
                  )}
                </span>
              </div>

              {/*  NEW: Mobile Tenant Management */}
              {isAdmin && (
                <Link
                  to="/tenants"
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <Building2 className="w-5 h-5 flex-shrink-0" />
                  Manage Tenants
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin/users"
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  Manage Users
                </Link>
              )}

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
