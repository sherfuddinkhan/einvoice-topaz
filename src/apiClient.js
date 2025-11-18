import axios from "axios";

// Create an axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:3001/proxy",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add auth token dynamically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId");

  if (token) config.headers["X-Auth-Token"] = token;
  if (companyId) config.headers["companyId"] = companyId;

  return config;
});

// Optional: global response error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
