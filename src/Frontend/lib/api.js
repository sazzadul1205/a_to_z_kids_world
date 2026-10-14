import axios from "axios";
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

export const api = axios.create({
  baseURL: API_BASE,
  // The backend answers 401/403 with JSON; without this axios treats a 4xx as a
  // success and hands back the raw error document.
  validateStatus: (status) => status >= 200 && status < 300,
});

// Attach the session token to every request. Reading it here rather than at each
// call site is what makes `auth: true` unnecessary.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response, config } = error;

    // Cancelled requests are a normal part of query cancellation, not a failure
    // to report. TanStack Query matches on this name to stay quiet.
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    if (!response) {
      return Promise.reject(
        new ApiError("Could not reach the store. Check that the API is running.", {
          status: 0,
        }),
      );
    }

    // Only a request that actually carried a token can have an expired session.
    // A rejected sign-in must not wipe a different, still-valid one, and a
    // public request that happens to 401 has no session to clear.
    if (response.status === 401 && config?.headers?.Authorization) {
      clearToken();
    }

    const payload = response.data;
    const message =
      (payload && typeof payload === "object" && (payload.error || payload.message)) ||
      (typeof payload === "string" && payload) ||
      `Request failed with status ${response.status}`;

    return Promise.reject(
      new ApiError(message, {
        status: response.status,
        errors: payload && typeof payload === "object" ? (payload.errors ?? null) : null,
      }),
    );
  },
);

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
  login: (credentials) => api.post("/auth/login", credentials),
  me: (signal) => api.get("/auth/me", { signal }),
};

export const categoriesApi = {
  list: (signal) => api.get("/categories", { signal }),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const productsApi = {
  list: (params, signal) => {
    const queryParams = { ...(params || {}), limit: params?.limit || 100 };
    return api.get("/products", { params: queryParams, signal }).then((res) => {
      if (res && typeof res === "object" && Array.isArray(res.products)) {
        return res.products;
      }
      return res;
    });
  },
  get: (id, signal) => api.get(`/products/${id}`, { signal }),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  // Staff-only toggles and bulk actions.
  toggleActive: (id) => api.patch(`/products/${id}/toggle-active`),
  bulkDelete: (ids) => api.post("/products/bulk/delete", { ids }),
  bulkSetFlag: (ids, flag, value) =>
    api.post("/products/bulk/flag", { ids, flag, value }),
  adjustStock: (id, adjustment, reason) =>
    api.post(`/products/${id}/adjust-stock`, { adjustment, reason }),
};

export const inventoryApi = {
  list: (params, signal) => {
    const queryParams = { ...(params || {}), limit: params?.limit || 100 };
    return api.get("/inventory", { params: queryParams, signal });
  },
  getProduct: (id, signal) => api.get(`/inventory/${id}`, { signal }),
  adjustStock: (id, adjustment, reason, referenceId, referenceType) =>
    api.post(`/inventory/${id}/adjust`, { adjustment, reason, referenceId, referenceType }),
  bulkAdjustStock: (adjustments) =>
    api.post("/inventory/bulk-adjust", { adjustments }),
  getMovements: (params, signal) => api.get("/inventory/movements", { params, signal }),
  getAlerts: (signal) => api.get("/inventory/alerts", { signal }),
};

export const reviewsApi = {
  list: (params, signal) => api.get("/reviews", { params, signal }),
  summary: (productId, signal) => api.get(`/reviews/product/${productId}/summary`, { signal }),
  create: (data) => api.post("/reviews", data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
  // Staff-only bulk actions.
  bulkDelete: (ids) => api.post("/reviews/bulk/delete", { ids }),
  deleteByProduct: (productId) => api.delete(`/reviews/product/${productId}`),
};

export const ordersApi = {
  list: (params, signal) => {
    const queryParams = { ...(params || {}), limit: params?.limit || 100 };
    return api.get("/orders", { params: queryParams, signal }).then((res) => {
      if (res && typeof res === "object" && Array.isArray(res.orders)) {
        return res.orders;
      }
      return res;
    });
  },
  create: (data) => api.post("/orders", data),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
  remove: (id) => api.delete(`/orders/${id}`),
};

export const usersApi = {
  list: (signal) => api.get("/users", { signal }),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};

export const customersApi = {
  list: (params, signal) => {
    const queryParams = { ...(params || {}), limit: params?.limit || 100 };
    return api.get("/customers", { params: queryParams, signal }).then((res) => {
      if (res && typeof res === "object" && Array.isArray(res.customers)) {
        return res.customers;
      }
      return res;
    });
  },
  search: (query, signal) => api.get("/customers/search", { params: { q: query }, signal }),
  getDetail: (phone, signal) => api.get(`/customers/${encodeURIComponent(phone)}`, { signal }),
};

// Store-wide settings. The read is public (the storefront
// needs it to decide whether the review section renders);
// only the write is staff-only, which the API enforces.
export const settingsApi = {
  get: (signal) => api.get("/settings", { signal }),
  updateReviews: (reviewsEnabled) =>
    api.patch("/settings/reviews", { reviewsEnabled }),
  updateInventory: (inventoryManagementEnabled) =>
    api.patch("/settings/inventory", { inventoryManagementEnabled }),
  updateOrderProcessing: (orderProcessingEnabled) =>
    api.patch("/settings/order-processing", { orderProcessingEnabled }),
};

export const purchaseOrdersApi = {
  list: (params, signal) => {
    const queryParams = { ...(params || {}), limit: params?.limit || 100 };
    return api.get("/purchase-orders", { params: queryParams, signal }).then((res) => {
      if (res && typeof res === "object" && Array.isArray(res.orders)) {
        return res.orders;
      }
      return res;
    });
  },
  get: (id, signal) => api.get(`/purchase-orders/${id}`, { signal }),
  create: (data) => api.post("/purchase-orders", data),
  updateStatus: (id, status) => api.put(`/purchase-orders/${id}`, { status }),
  receive: (id, items) => api.post(`/purchase-orders/${id}/receive`, { items }),
};

export const uploadsApi = {
  image: (file) => {
    const form = new FormData();
    form.append("image", file);
    // Let the browser set the multipart boundary itself.
    return api.post("/upload/image", form);
  },
};

export const expenseCategoriesApi = {
  list: (signal) =>
    api.get("/expense-categories", { signal }).then((res) => {
      if (res && typeof res === "object" && Array.isArray(res.categories)) {
        return res.categories;
      }
      return res;
    }),
  get: (id, signal) => api.get(`/expense-categories/${id}`, { signal }),
  create: (data) => api.post("/expense-categories", data),
  update: (id, data) => api.put(`/expense-categories/${id}`, data),
  remove: (id) => api.delete(`/expense-categories/${id}`),
  bulkDelete: (ids) => api.post("/expense-categories/bulk/delete", { ids }),
};

export const expensesApi = {
  list: (params, signal) => {
    const queryParams = { ...(params || {}), limit: params?.limit || 100 };
    return api.get("/expenses", { params: queryParams, signal }).then((res) => {
      if (res && typeof res === "object" && Array.isArray(res.expenses)) {
        return res.expenses;
      }
      return res;
    });
  },
  get: (id, signal) => api.get(`/expenses/${id}`, { signal }),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  remove: (id) => api.delete(`/expenses/${id}`),
  bulkDelete: (ids) => api.post("/expenses/bulk/delete", { ids }),
  // Analytics
  summary: (params, signal) => api.get("/expenses/reports/summary", { params, signal }),
  trends: (params, signal) => api.get("/expenses/reports/trends", { params, signal }),
  byCategory: (params, signal) => api.get("/expenses/reports/by-category", { params, signal }),
  top: (params, signal) => api.get("/expenses/reports/top", { params, signal }),
};

export const reportsApi = {
  // Product In/Out
  productInOutSummary: (params, signal) => api.get("/reports/product-in-out/summary", { params, signal }),
  productInOutTrends: (params, signal) => api.get("/reports/product-in-out/trends", { params, signal }),
  productInOutByProduct: (params, signal) => api.get("/reports/product-in-out/by-product", { params, signal }),
  productInOutMovements: (params, signal) => api.get("/reports/product-in-out/movements", { params, signal }),
  // Combined Dashboard
  dashboard: (params, signal) => api.get("/reports/dashboard", { params, signal }),
};

export const backupApi = {
  list: (signal) =>
    api.get("/backup", { signal }).then((res) => {
      if (res && typeof res === "object" && Array.isArray(res.backups)) {
        return res.backups;
      }
      return res;
    }),
  create: () => api.post("/backup"),
  restore: (filename, options) => api.post(`/backup/${filename}/restore`, options || {}),
  remove: (filename) => api.delete(`/backup/${filename}`),
  getData: (filename, signal) => api.get(`/backup/${filename}/data`, { signal }),
};

export const logsApi = {
  list: (signal) => api.get("/logs", { signal }),
  read: (filename, params, signal) => api.get(`/logs/${filename}`, { params, signal }),
  clear: () => api.delete("/logs"),
};

export const templatesApi = {
  // Public - get compiled HTML for printing
  getCompiled: (type, data) => api.post(`/templates/receipts/${type}`, data, { responseType: "text" }),
  // Admin
  list: (signal) => api.get("/templates", { signal }),
  get: (id, signal) => api.get(`/templates/${id}`, { signal }),
  create: (data) => api.post("/templates", data),
  update: (id, data) => api.patch(`/templates/${id}`, data),
  remove: (id) => api.delete(`/templates/${id}`),
  preview: (id, data) => api.post(`/templates/${id}/preview`, data, { responseType: "text" }),
};
