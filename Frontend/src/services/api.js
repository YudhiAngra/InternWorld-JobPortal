import axios from "axios";
import { API_URL } from "../config";
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});
export default API;