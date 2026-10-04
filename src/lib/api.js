import { clearToken, getToken } from "./authToken";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function buildUrl(path, params) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  if (!params) return url;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    // Only primitives become query values. Anything else (an AbortSignal passed
    // into the params slot by mistake, an object, a function) is dropped rather
    // than serialised into a junk query string.
    if (!["string", "number", "boolean"].includes(typeof value)) continue;
    if (value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch(path, { method = "GET", body, params, headers = {}, auth = false, signal } = {}) {
  const requestHeaders = { ...headers };
  const requestBody =
    body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body);

  if (requestBody !== undefined && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Tracks whether this request actually carried a session, so a 401 can be
  // attributed to an expired session rather than to the request itself.
  let sentToken = false;
  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
      sentToken = true;
    }
  }

  let response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("Could not reach the store. Check that the API is running.", {
      status: 0,
    });
  }

  if (response.status === 204) return null;

  const payload = await readBody(response);

  if (!response.ok) {
    // An expired or revoked session should drop the admin session everywhere —
    // but only when this request is what carried it. A rejected login must not
    // wipe a different, still-valid session, and a public request that happens
    // to 401 has no session to clear.
    if (response.status === 401 && sentToken) clearToken();

    const message =
      (payload && typeof payload === "object" && (payload.error || payload.message)) ||
      (typeof payload === "string" && payload) ||
      `Request failed with status ${response.status}`;

    throw new ApiError(message, {
      status: response.status,
      errors: payload && typeof payload === "object" ? payload.errors ?? null : null,
    });
  }

  return payload;
}

// Only absolute http(s) URLs are passed through untouched. Everything else —
// including protocol-relative "//host" and "data:" payloads — is resolved
// against the API origin, so an image value can never point the browser at an
// unexpected origin or inline an attacker-controlled payload.
export function resolveImageUrl(value) {
  if (!value || typeof value !== "string") return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE}${value.startsWith("/") ? value : `/${value}`}`;
}

export const authApi = {
  login: (credentials) => apiFetch("/auth/login", { method: "POST", body: credentials }),
  me: () => apiFetch("/auth/me", { auth: true }),
};

export const categoriesApi = {
  list: (options) => apiFetch("/categories", options),
  create: (data) => apiFetch("/categories", { method: "POST", body: data, auth: true }),
  update: (id, data) => apiFetch(`/categories/${id}`, { method: "PUT", body: data, auth: true }),
  remove: (id) => apiFetch(`/categories/${id}`, { method: "DELETE", auth: true }),
};

export const productsApi = {
  list: (params, options) => apiFetch("/products", { params, ...options }),
  get: (id) => apiFetch(`/products/${id}`),
  create: (data) => apiFetch("/products", { method: "POST", body: data, auth: true }),
  update: (id, data) => apiFetch(`/products/${id}`, { method: "PUT", body: data, auth: true }),
  remove: (id) => apiFetch(`/products/${id}`, { method: "DELETE", auth: true }),
};

export const reviewsApi = {
  list: (params, options) => apiFetch("/reviews", { params, ...options }),
  summary: (productId, options) =>
    apiFetch(`/reviews/product/${productId}/summary`, options),
  create: (data) => apiFetch("/reviews", { method: "POST", body: data }),
  update: (id, data) => apiFetch(`/reviews/${id}`, { method: "PUT", body: data, auth: true }),
  remove: (id) => apiFetch(`/reviews/${id}`, { method: "DELETE", auth: true }),
};

export const ordersApi = {
  list: (params) => apiFetch("/orders", { params, auth: true }),
  create: (data) => apiFetch("/orders", { method: "POST", body: data, auth: true }),
  updateStatus: (id, status) =>
    apiFetch(`/orders/${id}`, { method: "PUT", body: { status }, auth: true }),
  remove: (id) => apiFetch(`/orders/${id}`, { method: "DELETE", auth: true }),
};

export const usersApi = {
  list: () => apiFetch("/users", { auth: true }),
  create: (data) => apiFetch("/users", { method: "POST", body: data, auth: true }),
  update: (id, data) => apiFetch(`/users/${id}`, { method: "PUT", body: data, auth: true }),
  remove: (id) => apiFetch(`/users/${id}`, { method: "DELETE", auth: true }),
};

export const uploadsApi = {
  image: (file) => {
    const form = new FormData();
    form.append("image", file);
    return apiFetch("/upload/image", { method: "POST", body: form, auth: true });
  },
};