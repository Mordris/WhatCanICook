// Read the base API URL from environment variables provided by Vite
// Fallback to localhost:5000/api if not set during development
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const SUGGEST_API_ENDPOINT = `${API_BASE_URL}/suggest/`; // Note trailing slash matches Blueprint
