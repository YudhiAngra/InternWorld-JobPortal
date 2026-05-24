const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:4000";

export const API_URL = `${BASE_URL}/api`;
export const SERVER_URL = BASE_URL;