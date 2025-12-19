import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/";

// Export base URL for absolute media paths
export const API_BASE_URL = VITE_API_URL.split('/api')[0];

/**
 * Robust helper to get full media URL
 * Handles absolute URLs, relative paths with /media/, and relative paths without it.
 */
export const getFullMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;
  
  // Ensure path starts with /
  const absolutePath = path.startsWith('/') ? path : `/${path}`;
  
  // If it doesn't have /media/ at the start, add it
  if (!absolutePath.startsWith('/media/')) {
     return `${API_BASE_URL}/media${absolutePath}`;
  }
  
  return `${API_BASE_URL}${absolutePath}`;
};

const axiosInstance = axios.create({
  baseURL: VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors (backend not running)
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('Backend server is not running. Please start Django server with: python manage.py runserver');
      // Don't show alert on every request, just log it
      if (!originalRequest._networkErrorShown) {
        originalRequest._networkErrorShown = true;
        setTimeout(() => {
          alert('Cannot connect to backend server. Please make sure Django is running on http://localhost:8000\n\nRun: cd Snapnest && python manage.py runserver');
        }, 100);
      }
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        if (refreshToken) {
          // Use axios directly to avoid interceptor loop
          const response = await axios.post("/api/auth/token/refresh/", {
            refresh: refreshToken,
          }, {
            headers: {
              "Content-Type": "application/json",
            }
          });
          const { access } = response.data;
          localStorage.setItem("access", access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
