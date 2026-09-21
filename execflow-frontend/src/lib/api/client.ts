import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT is attached once the Auth module lands. Reading from localStorage
// here (not cookies) keeps this a pure client-side concern for v1.
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("execflow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// A 401 means the token is missing/expired/invalid - clear it so the app
// doesn't keep sending a dead token, and bounce to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.localStorage.removeItem("execflow_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
