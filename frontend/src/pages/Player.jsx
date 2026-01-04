import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadVideo = useCallback(() => {
    if (!videoRef.current || !id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setHasError(true);
      return;
    }

    videoRef.current.src = `http://localhost:5000/api/videos/public-stream/${id}?token=${token}`;
    videoRef.current.load();
  }, [id]);

  useEffect(() => {
    if (videoRef.current) {
      loadVideo();
    }
  }, [loadVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setIsVideoReady(true);
    const handleError = () => setHasError(true);

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-red-500/20 rounded-2xl flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Video Unavailable
          </h1>
          <p className="text-gray-400 mb-8">
            This video cannot be played or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Compact Header */}
      <div className="px-6 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 p-2 -m-2 rounded-lg hover:bg-white/10"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium text-sm">Dashboard</span>
        </button>
      </div>

      {/* Full Height Video Player */}
      <div className="h-[calc(100%-80px)] flex items-center justify-center px-4">
        <div className="w-full max-w-4xl h-full flex flex-col">
          <div className="flex-1 bg-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden mx-2">
            <video
              ref={(el) => {
                videoRef.current = el;
                setIsVideoReady(!!el);
              }}
              controls
              controlsList="nodownload"
              className="w-full h-full object-contain bg-gradient-to-b from-gray-900 to-black"
              muted
              playsInline
              disablePictureInPicture
              poster={
                isVideoReady
                  ? null
                  : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PHRleHQgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjY2IiB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+"
              }
            />
          </div>

          {/* Minimal Status Bar */}
          <div className="px-4 py-2 bg-black/60 border-t border-gray-800 mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Protected Stream</span>
              <span className="flex items-center gap-1">
                {isVideoReady && (
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                )}
                Secure
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
