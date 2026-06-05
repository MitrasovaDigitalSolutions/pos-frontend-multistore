const DEFAULT_API_URL = "http://127.0.0.1:8000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  
  // Ensure endpoint starts with a slash
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Get token from localStorage
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("pos_auth_token");
  }

  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, clear token and redirect to login (client-side only)
  if (response.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
    localStorage.removeItem("pos_auth_token");
    localStorage.removeItem("pos_auth_user");
    window.location.href = "/login";
  }

  return response;
}
