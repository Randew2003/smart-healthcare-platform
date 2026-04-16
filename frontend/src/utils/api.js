import axios from "axios";
import { getToken, logout } from "./auth";

export const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // token expired/invalid
      logout();
    }
    return Promise.reject(err);
  }
);
