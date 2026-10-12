const TOKEN_KEY = "a-to-z-kids-admin-token";

const listeners = new Set();

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

let token = readStoredToken();

export function getToken() {
  return token;
}

export function setToken(next) {
  const value = next || "";
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private browsing; keep the in-memory copy.
  }
  token = value;
  for (const listener of listeners) listener(token);
}

export function clearToken() {
  setToken("");
}

// Lets the auth context react to expiry or a manual sign-out without a reload.
export function onTokenChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}