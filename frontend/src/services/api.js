import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Request interceptor - add token
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Response interceptor - set video count in localStorage
api.interceptors.response.use(
  (response) => {
    // Check if response contains videos array and update localStorage
    const data = response.data;
    if (data.videos || Array.isArray(data)) {
      const videos = data.videos || data;
      localStorage.setItem("videosCount", videos.length.toString());
    }
    return response;
  },
  (error) => {
    // Handle errors (optional - you can add error logging here)
    return Promise.reject(error);
  }
);

export default api;
