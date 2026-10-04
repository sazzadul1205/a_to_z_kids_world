import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context";
import { authApi } from "../lib/api";
import { clearToken, getToken, onTokenChange, setToken } from "../lib/authToken";
import { useResource } from "../hooks/useResource";

// Admin-only session. The storefront has no shopper accounts: this provider
// exists purely to guard the unlinked /admin routes.
export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken);
  const [sessionUser, setSessionUser] = useState(null);

  // Revalidate a stored token on mount so a revoked account cannot linger.
  const fetcher = useCallback(async () => {
    if (!getToken()) return null;
    const payload = await authApi.me();
    return payload?.user ?? null;
  }, []);

  const { data: validatedUser, status: validationStatus } = useResource(fetcher);

  // The API client clears the token on a 401, so mirror that here. Holding the
  // token in state means a cleared token also drops the validated user, which
  // would otherwise stay cached and keep the session looking signed in.
  useEffect(
    () =>
      onTokenChange((nextToken) => {
        setTokenState(nextToken);
        if (!nextToken) setSessionUser(null);
      }),
    [],
  );

  const user = token ? (sessionUser ?? validatedUser) : null;

  const status = useMemo(() => {
    if (user) return "signed-in";
    return validationStatus === "loading" ? "loading" : "signed-out";
  }, [user, validationStatus]);

  const signIn = useCallback(async (email, password) => {
    const payload = await authApi.login({ email, password });
    setToken(payload.token);
    setSessionUser(payload.user);
    return payload.user;
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setSessionUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "Admin",
      signIn,
      signOut,
    }),
    [user, status, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}