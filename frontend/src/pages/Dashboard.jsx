import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import VideoCard from "../components/VideoCard";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { Funnel, Search, Upload, Clock, Building2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [filters, setFilters] = useState({ status: "all", search: "" });
  const [uploading, setUploading] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef();
  const socketRef = useRef();
  const refreshTimeoutRef = useRef(null);

  const canUpload = user?.role === "editor" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  //  : Clean refresh logic - NO arguments.callee
  const shouldRefresh = useCallback(() => {
    return Object.values(progressMap).some(
      (p) => p.progress < 100 || p.status === "processing"
    );
  }, [progressMap]);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get("/videos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(res.data);
      localStorage.setItem("videosCount", res.data.length.toString());
    } catch (err) {
      console.error(" Videos error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  //  SOCKET: Real-time processing updates (TENANT FILTERED)
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    socketRef.current = io("http://localhost:5000", {
      query: { userId: userData.id },
    });

    socketRef.current.on("connect", () => {
      console.log(" SOCKET CONNECTED:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ SOCKET DISCONNECTED");
    });

    socketRef.current.on("progress", (data) => {
      console.log(" SOCKET PROGRESS:", data);
      setProgressMap((prev) => ({ ...prev, [data.videoId]: data }));
      fetchVideos();
    });

    return () => socketRef.current?.disconnect();
  }, [fetchVideos]);

  //  : Clean polling + tenant display for ALL users
  useEffect(() => {
    fetchVideos(); // Initial load

    //  : Proper recursive timeout (no arguments.callee)
    const pollVideos = () => {
      if (shouldRefresh()) {
        fetchVideos();
        refreshTimeoutRef.current = setTimeout(pollVideos, 3000);
      }
    };

    if (shouldRefresh()) {
      refreshTimeoutRef.current = setTimeout(pollVideos, 3000);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchVideos, shouldRefresh]);

  // Filter videos (client-side for status filtering)
  const filteredVideos = videos.filter((video) => {
    if (filters.status !== "all" && video.status !== filters.status)
      return false;
    if (
      filters.search &&
      !video.filename.toLowerCase().includes(filters.search.toLowerCase()) &&
      !video.title?.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  //  REAL UPLOAD PROGRESS + PROCESSING
  const handleUpload = async () => {
    if (!fileRef.current?.files[0]) return toast.error("Select a video file");

    const formData = new FormData();
    formData.append("video", fileRef.current.files[0]);
    formData.append("title", fileRef.current.files[0].name.split(".")[0]);
    formData.append("description", "");

    setUploading(true);
    setUploadProgress(0);

    try {
      await api.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      toast.success(" Upload complete! Processing...");
      fetchVideos();
      fileRef.current.value = "";
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/*  PERFECTED TENANT HEADER - Works for ALL users */}
        <section className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">
                  {user?.tenantName || "default"}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {isAdmin
                    ? `Admin • ${filteredVideos.length} videos`
                    : `${filteredVideos.length} videos`}
                </p>
              </div>
            </div>
            {isAdmin && (
              <a
                href="/admin"
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Admin Dashboard →
              </a>
            )}
          </div>
        </section>

        {/*  Upload Section */}
        {canUpload && (
          <section className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <Upload className="w-6 h-6 text-indigo-600" />
              Upload New Video
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="file"
                ref={fileRef}
                accept="video/*"
                className="flex-1 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                disabled={uploading}
              />
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {uploading ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    {uploadProgress > 0
                      ? `Uploading ${uploadProgress}%`
                      : "Uploading..."}
                  </>
                ) : (
                  "Upload Video"
                )}
              </button>
            </div>

            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Viewer Mode */}
        {!canUpload && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              👁️ Viewer Mode
            </h2>
            <p className="text-blue-700">
              Read-only access to published videos in{" "}
              <strong>{user?.tenantName || "default"}</strong>
            </p>
          </div>
        )}

        {/* Filters */}
        <section className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold">
              <Funnel className="w-5 h-5" />
              Videos ({filteredVideos.length}) - {user?.tenantName || "default"}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="published">Published</option>
                <option value="safe">Safe</option>
                <option value="flagged">Flagged</option>
              </select>
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Video Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <p className="col-span-full text-center text-gray-500 py-12">
              Loading videos...
            </p>
          ) : filteredVideos.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">
              No videos found
            </p>
          ) : (
            filteredVideos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                progress={progressMap[video._id]?.progress}
                status={progressMap[video._id]?.status}
              />
            ))
          )}
        </section>

        {Object.values(progressMap).some((p) => p.progress < 100) && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="w-5 h-5 animate-spin" />
              <span>🔄 Processing videos in background...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
