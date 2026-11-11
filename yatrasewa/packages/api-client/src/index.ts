// YatraSewa typed API client (package stub for the web/mobile consumers).
// In this build the web app uses a local axios instance; this package
// provides a shared typed Axios client and Query hooks for expansion.
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api/v1",
  timeout: 15000,
});

export * as AuthHooks from "./hooks/useAuth.js";
