import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth";

const AdminLogin = () => {
  const { signIn, isAuthenticated, isAdmin, status } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const from = location.state?.from || "/admin";

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-soft text-text-muted">
        <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isAuthenticated && isAdmin) return <Navigate to={from} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // On success the `isAuthenticated` branch above redirects to `from`.
      await signIn(credentials.email.trim(), credentials.password);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-7 shadow-xl sm:p-9">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-fill text-ink-on-brand">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
                Staff only
              </p>
              <h1 className="text-2xl font-black text-text">Store admin</h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-text-muted">
            This area manages the catalogue. Shoppers never see it.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-text">Email address</span>
              <input
                required
                type="email"
                autoComplete="username"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="admin@atozkids.world"
                className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-text outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-text">Password</span>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-text outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            {error && (
              <p className="rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-fill px-5 py-3 font-bold text-ink-on-brand transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-text-muted">
          <ShieldCheck className="h-4 w-4" />
          Sessions expire automatically and are stored only in this browser.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
