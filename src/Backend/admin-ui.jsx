import { AlertTriangle, Loader2, PackageOpen, Save, X } from "lucide-react";

export const AdminLoader = ({ label = "Loading..." }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-text-muted">
    <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
    <p className="text-sm font-semibold">{label}</p>
  </div>
);

export const AdminError = ({ message, onRetry }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary-300 bg-primary-50 px-5 py-4">
    <p className="flex items-center gap-2 text-sm font-semibold text-primary-900">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      {message}
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-brand-fill px-4 py-2 text-sm font-bold text-ink-on-brand transition hover:brightness-110"
      >
        Try again
      </button>
    )}
  </div>
);

export const AdminEmpty = ({ title, message }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-soft px-6 py-14 text-center">
    <PackageOpen className="h-10 w-10 text-secondary-400" />
    <p className="mt-3 font-bold text-text">{title}</p>
    {message && <p className="mt-1 text-sm text-text-muted">{message}</p>}
  </div>
);

const STATUS_TONES = {
  Pending: "bg-accent-100 text-accent-900",
  Processing: "bg-secondary-100 text-secondary-1000",
  Completed: "bg-primary-100 text-primary-900",
  Cancelled: "bg-surface-soft text-text-muted",
  Due: "bg-accent-100 text-accent-900",
  Admin: "bg-primary-100 text-primary-900",
  Customer: "bg-secondary-100 text-secondary-1000",
};

export const StatusPill = ({ value }) => (
  <span
    className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
      STATUS_TONES[value] || "bg-surface-soft text-text-muted"
    }`}
  >
    {value}
  </span>
);

export const StatCard = ({ label, value, tone = "primary" }) => {
  const tones = {
    primary: "text-primary-700",
    accent: "text-accent-800",
    secondary: "text-secondary-1000",
  };
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tones[tone] || tones.primary}`}>{value}</p>
    </div>
  );
};

export const fieldClass =
  "w-full rounded-xl border border-border bg-surface-soft px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

export const labelClass =
  "mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-fill px-4 py-2.5 text-sm font-bold text-ink-on-brand transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

export const ghostButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-primary-300 bg-primary-50 px-4 py-2.5 text-sm font-bold text-primary-800 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50";

export const AdminHeader = ({ section = "Catalogue", title, subtitle, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="text-sm font-bold uppercase tracking-widest text-primary-600">{section}</p>
      <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-3">{children}</div>}
  </div>
);

export const FormError = ({ children, message, className = "" }) => (
  <p
    className={`rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900 ${className}`}
  >
    {children || message}
  </p>
);

export const FormField = ({ label, htmlFor, required, error, children, className = "" }) => (
  <div className={className}>
    {label && (
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {required && " *"}
      </label>
    )}
    {children}
    {error && <p className="mt-1 text-sm text-primary-600">{error}</p>}
  </div>
);

export const AdminDialog = ({
  isOpen,
  onClose,
  title,
  sizeClass = "max-w-md",
  scrollable = false,
  overlay = "solid",
  roundedClass = "rounded-2xl",
  children,
}) => {
  if (!isOpen) return null;

  const overlayClass =
    overlay === "blur"
      ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4";

  return (
    <div className={overlayClass}>
      <div
        className={`w-full ${sizeClass} ${roundedClass} border border-border bg-surface p-6 shadow-xl ${
          scrollable ? "max-h-[90vh] overflow-y-auto" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-text-muted transition hover:bg-primary-50 hover:text-primary-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const AdminFormActions = ({ busy, submitLabel, cancelLabel = "Cancel", onCancel }) => (
  <div className="mt-6 flex justify-end gap-3 pt-2">
    <button type="button" onClick={onCancel} className={ghostButtonClass}>
      {cancelLabel}
    </button>
    <button type="submit" disabled={busy} className={primaryButtonClass}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {submitLabel}
    </button>
  </div>
);
