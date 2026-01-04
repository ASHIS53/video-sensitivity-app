import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VideoCard({ video, progress, status }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  //  ROLE CHECKS
  const canManage = user?.role === "editor" || user?.role === "admin";
  const isOwner = video.owner?._id === user?.id;

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError(true);
      return;
    }

    videoEl.src = `http://localhost:5000/api/videos/public-stream/${video._id}?token=${token}`;
    videoEl.load();

    const handleError = () => {
      console.error("VideoCard ERROR:", video._id, video.filename);
      setError(true);
    };

    const handleLoadedMetadata = () => {
      setLoaded(true);
      setError(false);
    };

    videoEl.addEventListener("error", handleError);
    videoEl.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      videoEl.removeEventListener("error", handleError);
      videoEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [video._id, video.filename]);

  const handleClick = () => {
    console.log(" NAVIGATING TO:", `/player/${video._id}`);
    navigate(`/player/${video._id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    console.log("Edit video:", video._id);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this video permanently?")) return;

    try {
      await fetch(`http://localhost:5000/api/videos/${video._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      window.location.reload();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (error) {
    return (
      <div
        className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-sm"> Unavailable</div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
            {video.title || video.filename.split(".")[0]}
          </h3>
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            Error
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group relative"
      onClick={handleClick}
    >
      <div className="relative">
        {/*  VIDEO - NO NATIVE CONTROLS + NO CLICK EVENTS */}
        <video
          ref={videoRef}
          controls={false}
          preload="metadata"
          className="w-full h-48 object-cover pointer-events-none"
          muted
          playsInline
        />

        {/*  PROGRESS BADGE */}
        {progress !== undefined && progress > 0 && progress < 100 && (
          <div
            className="absolute top-2 left-2 z-30 bg-black/90 text-white px-3 py-1 rounded-full text-sm font-bold border-2 border-white/50"
            onClick={(e) => e.stopPropagation()}
          >
            {progress}%
          </div>
        )}

        {/*  STATUS BADGE */}

        {/*  AI RISK SCORE BADGE - NEW! */}
        {video.riskScore > 0 && (
          <div
            className={`absolute bottom-2 left-2 z-30 px-2.5 py-1 text-xs font-bold rounded-full border-2 backdrop-blur-sm ${
              video.riskScore < 30
                ? "bg-green-500/95 text-white border-green-400/50"
                : video.riskScore < 60
                ? "bg-yellow-500/95 text-white border-yellow-400/50"
                : "bg-red-500/95 text-white border-red-400/50"
            }`}
          >
            Risk{video.riskScore}%
          </div>
        )}

        {/*  FULLSCREEN PLAY OVERLAY */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex items-center justify-center opacity-85 group-hover:opacity-95 transition-all z-20"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <div className="w-20 h-20 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer hover:bg-white/40 transition-all border-2 border-white/30">
            <svg
              className="w-10 h-10 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/*  VIDEO TITLE */}
        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
          {video.title ||
            video.filename.split("-")[0]?.split(".")[0] ||
            "Video"}
        </h3>

        {/*  VIDEO DESCRIPTION */}
        {video.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {video.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-2">
          {/*  STATUS BADGE */}
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full ${
              video.status === "published" || video.status === "safe"
                ? "bg-green-100 text-green-800"
                : video.status === "flagged"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {video.status}
          </span>

          {/*  VIEWS */}
          {video.views > 0 && (
            <span className="text-xs text-gray-500">👁️ {video.views}</span>
          )}
        </div>

        <div className="text-xs text-gray-500">
          {new Date(video.createdAt).toLocaleDateString()}
        </div>

        {/*  MANAGEMENT BUTTONS - EDITOR/ADMIN ONLY */}
        {canManage && (
          <div className="absolute top-3 right-3 flex gap-1 bg-white/95 backdrop-blur-sm rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-40 shadow-lg">
            <button
              onClick={handleEdit}
              className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-200 text-gray-600 hover:text-indigo-600 transition-all"
              title="Edit metadata"
            >
              ✏️
            </button>
            {(isOwner || user?.role === "admin") && (
              <button
                onClick={handleDelete}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-200 text-gray-600 hover:text-red-600 transition-all"
                title="Delete video"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
