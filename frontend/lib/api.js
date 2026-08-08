// Thin fetch wrapper around the Django REST backend.
// Handles JWT storage, silent refresh-on-401, and JSON plumbing.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const TOKEN_KEY = "loanledger_access";
const REFRESH_KEY = "loanledger_refresh";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ access, refresh }) {
  if (typeof window === "undefined") return;
  if (access) window.localStorage.setItem(TOKEN_KEY, access);
  if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export function isAuthed() {
  return Boolean(getAccessToken());
}

// The `lead` model requires a `user` (OneToOne) on create, but the backend
// exposes no "current user" endpoint. SimpleJWT embeds the user id as the
// `user_id` claim, so we read it straight out of the access token.
export function getCurrentUserId() {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.user_id ?? null;
  } catch {
    return null;
  }
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function rawRequest(path, { method = "GET", body, auth = true, retry = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Access token expired -> try one silent refresh, then retry once.
  if (res.status === 401 && auth && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return rawRequest(path, { method, body, auth, retry: false });
    }
    clearTokens();
    throw new ApiError("Session expired. Please log in again.", 401, null);
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = extractErrorMessage(data) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

function extractErrorMessage(data) {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  // DRF validation errors: { field: ["msg"] }
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    const msg = Array.isArray(val) ? val[0] : val;
    return `${firstKey}: ${msg}`;
  }
  return null;
}

async function tryRefresh() {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/referesh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens({ access: data.access });
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: (path) => rawRequest(path, { method: "GET" }),
  post: (path, body, opts = {}) => rawRequest(path, { method: "POST", body, ...opts }),
  patch: (path, body) => rawRequest(path, { method: "PATCH", body }),
  put: (path, body) => rawRequest(path, { method: "PUT", body }),
  delete: (path) => rawRequest(path, { method: "DELETE" }),
};

// ---- Auth ----
export async function login(username, password) {
  const data = await api.post("/login/", { username, password }, { auth: false });
  setTokens({ access: data.access, refresh: data.refresh });
  return data;
}

export async function signup({ username, email, password }) {
  return api.post("/users/", { username, email, password }, { auth: false });
}

export function logout() {
  clearTokens();
}

// ---- Leads ----
export const LeadsAPI = {
  list: () => api.get("/leads/"),
  get: (id) => api.get(`/leads/${id}/`),
  create: (payload) => api.post("/leads/", payload),
  update: (id, payload) => api.patch(`/leads/${id}/`, payload),
  remove: (id) => api.delete(`/leads/${id}/`),
  runCreditScore: (id) => api.post(`/credit-score/${id}/`, {}),
};

// ---- BRE Rules ----
export const RulesAPI = {
  list: () => api.get("/rules/"),
  get: (id) => api.get(`/rules/${id}/`),
  create: (payload) => api.post("/rules/", payload),
  update: (id, payload) => api.patch(`/rules/${id}/`, payload),
  remove: (id) => api.delete(`/rules/${id}/`),
};

export { ApiError };
