import { useEffect, useId, useRef } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ImagePlus,
  Loader2,
  PackageOpen,
  Pencil,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

/* ================================================================== */
/*  Design tokens — exported so consumers can compose custom markup   */
/* ================================================================== */

export const fieldClass =
  "w-full rounded-xl border border-border bg-surface-soft px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-primary-400 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-primary-100";

export const labelClass =
  "mb-1 block text-xs font-bold uppercase tracking-widest text-text-muted";

const baseButton =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

export const primaryButtonClass = `${baseButton} bg-brand-fill text-ink-on-brand hover:brightness-110 disabled:opacity-60`;

export const ghostButtonClass = `${baseButton} border border-border bg-surface text-text hover:border-primary-300 hover:bg-primary-50`;

export const dangerButtonClass = `${baseButton} border border-primary-300 bg-primary-50 text-primary-800 hover:bg-primary-100`;

export const compactButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-bold text-text transition hover:border-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50";

export const compactDangerClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-primary-50 px-2.5 py-1.5 text-xs font-bold text-primary-800 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50";

const checkboxClass =
  "h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary-600 disabled:cursor-not-allowed";

/* ================================================================== */
/*  Loading / error / empty                                            */
/* ================================================================== */

// Keyframes are injected once per render; browsers dedupe them, so the
// loader works even if index.css is missing.
const LOADER_STYLES = `
@keyframes admin-loader-ball   { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-14px)} }
@keyframes admin-loader-block  { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-10px)} }
@keyframes admin-loader-star   { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
@keyframes admin-loader-shadow { 0%,100%{opacity:.35;transform:scaleX(1)} 50%{opacity:.12;transform:scaleX(.65)} }
`;

export const AdminLoader = ({ label = "Loading…" }) => (
  <div
    className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-text-muted"
    role="status"
    aria-live="polite"
  >
    <style>{LOADER_STYLES}</style>

    <svg className="h-20 w-28" viewBox="0 0 140 92" fill="none" aria-hidden="true">
      {/* twinkling stars */}
      <path
        className="fill-accent-600"
        transform="translate(70 12)"
        style={{ transformBox: "fill-box", transformOrigin: "center", animation: "admin-loader-star 1.6s ease-in-out infinite" }}
        d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z"
      />
      <path
        className="fill-accent-600"
        transform="translate(18 30)"
        style={{ transformBox: "fill-box", transformOrigin: "center", animation: "admin-loader-star 1.6s ease-in-out .4s infinite" }}
        d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z"
      />
      <path
        className="fill-accent-600"
        transform="translate(122 26)"
        style={{ transformBox: "fill-box", transformOrigin: "center", animation: "admin-loader-star 1.6s ease-in-out .8s infinite" }}
        d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z"
      />

      {/* soft shadow that shrinks as the ball rises */}
      <ellipse
        cx="70"
        cy="81"
        rx="22"
        ry="4.5"
        fill="currentColor"
        style={{ transformBox: "fill-box", transformOrigin: "center", animation: "admin-loader-shadow 1.1s ease-in-out infinite" }}
      />

      {/* bouncing ball */}
      <g style={{ animation: "admin-loader-ball 1.1s ease-in-out infinite" }}>
        <circle cx="70" cy="62" r="14" className="fill-primary-500" />
        <path d="M57 57 Q70 64 83 57" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M57 63 Q70 70 83 63" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".65" />
        <circle cx="64" cy="56" r="3" fill="#fff" opacity=".6" />
      </g>

      {/* hopping blocks */}
      <g style={{ animation: "admin-loader-block 1.1s ease-in-out .1s infinite" }}>
        <rect x="22" y="52" width="24" height="24" rx="6" className="fill-secondary-600" />
        <text x="34" y="64" textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontSize: 16, fontWeight: 900 }}>A</text>
      </g>
      <g style={{ animation: "admin-loader-block 1.1s ease-in-out .55s infinite" }}>
        <rect x="94" y="52" width="24" height="24" rx="6" className="fill-accent-600" />
        <text x="106" y="64" textAnchor="middle" dominantBaseline="central" className="fill-ink-bright" style={{ fontSize: 16, fontWeight: 900 }}>Z</text>
      </g>
    </svg>

    <p className="text-sm font-semibold">{label}</p>
  </div>
);

export const AdminError = ({ title = "Something went wrong", message, onRetry, retryLabel = "Try again" }) => (
  <div
    role="alert"
    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary-300 bg-primary-50 px-5 py-4"
  >
    <div className="flex items-start gap-2 text-primary-900">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold">{title}</p>
        {message && <p className="mt-0.5 text-sm font-medium opacity-80">{message}</p>}
      </div>
    </div>
    {onRetry && (
      <button type="button" onClick={onRetry} className={compactDangerClass}>
        {retryLabel}
      </button>
    )}
  </div>
);

export const AdminEmpty = ({ title, message, icon: Icon = PackageOpen, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-soft px-6 py-14 text-center">
    <Icon className="h-10 w-10 text-secondary-400" aria-hidden="true" />
    <p className="mt-3 font-bold text-text">{title}</p>
    {message && <p className="mt-1 max-w-sm text-sm text-text-muted">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ================================================================== */
/*  Display primitives                                                 */
/* ================================================================== */

const STATUS_TONES = {
  Pending: "bg-accent-100 text-accent-900",
  Processing: "bg-secondary-100 text-secondary-1000",
  Completed: "bg-primary-100 text-primary-900",
  Cancelled: "bg-surface-soft text-text-muted",
  Due: "bg-accent-100 text-accent-900",
  Admin: "bg-primary-100 text-primary-900",
  Customer: "bg-secondary-100 text-secondary-1000",
};

export const StatusPill = ({ value, tones = STATUS_TONES }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${tones[value] || "bg-surface-soft text-text-muted"
        }`}
    >
      {value}
    </span>
  );
};

export const StatCard = ({ label, value, tone = "primary", icon: Icon, trend }) => {
  const tones = {
    primary: "text-primary-700",
    accent: "text-accent-800",
    secondary: "text-secondary-1000",
  };
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-text-muted" aria-hidden="true" />}
      </div>
      <p className={`mt-2 text-3xl font-black ${tones[tone] || tones.primary}`}>{value}</p>
      {trend && <p className="mt-1 text-xs font-semibold text-text-muted">{trend}</p>}
    </div>
  );
};

export const AdminHeader = ({ section = "Catalogue", title, subtitle, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-bold uppercase tracking-widest text-primary-600">{section}</p>
      <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
  </div>
);

/* ================================================================== */
/*  Form primitives                                                    */
/* ================================================================== */

export const FormError = ({ children, message, className = "" }) => (
  <p
    role="alert"
    className={`rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900 ${className}`}
  >
    {children || message}
  </p>
);

export const FormField = ({ label, htmlFor, required, error, hint, children, className = "" }) => (
  <div className={className}>
    {label && (
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {/* Star is drawn by .required-star in index.css so the label's text
            stays exactly the field name for screen readers. */}
        {required && <span className="required-star" aria-hidden="true" />}
      </label>
    )}
    {children}
    {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    {error && <p className="mt-1 text-sm font-semibold text-primary-600">{error}</p>}
  </div>
);

export const FormFieldInput = ({ label, htmlFor, id, required, error, hint, className = "", ...props }) => {
  const generatedId = useId();
  const inputId = htmlFor || id || generatedId;
  return (
    <FormField label={label} htmlFor={inputId} required={required} error={error} hint={hint}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`${fieldClass} ${className}`}
        {...props}
      />
    </FormField>
  );
};

export const FormFieldSelect = ({ label, htmlFor, id, required, error, hint, children, className = "", ...props }) => {
  const generatedId = useId();
  const selectId = htmlFor || id || generatedId;
  return (
    <FormField label={label} htmlFor={selectId} required={required} error={error} hint={hint}>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={`${fieldClass} ${className}`}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
};

export const FormFieldTextarea = ({ label, htmlFor, id, required, error, hint, className = "", ...props }) => {
  const generatedId = useId();
  const textareaId = htmlFor || id || generatedId;
  return (
    <FormField label={label} htmlFor={textareaId} required={required} error={error} hint={hint}>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={`${fieldClass} ${className}`}
        {...props}
      />
    </FormField>
  );
};

export const AdminFormActions = ({ busy, submitLabel = "Save", cancelLabel = "Cancel", onCancel }) => (
  <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
    <button type="button" onClick={onCancel} disabled={busy} className={ghostButtonClass}>
      {cancelLabel}
    </button>
    <button type="submit" disabled={busy} className={primaryButtonClass}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {submitLabel}
    </button>
  </div>
);

/* ================================================================== */
/*  Dialog                                                             */
/* ================================================================== */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const isVisible = (el) => el.getClientRects().length > 0;

export const AdminDialog = ({
  isOpen,
  onClose,
  title,
  description,
  sizeClass = "max-w-md",
  fullWidth = false,
  scrollable = true,
  overlay = "solid",
  roundedClass = "rounded-2xl",
  closeOnEsc = true,
  closeOnOverlayClick = true,
  initialFocusRef,
  children,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;

    // Prevent body scroll and compensate for the scrollbar to avoid layout shift.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Focus the requested element, or the first focusable one, or the panel itself.
    const focusFirst = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      if (!panel) return;
      const first = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)).find(isVisible);
      (first || panel).focus();
    };
    // Defer so the dialog is painted before we steal focus.
    const raf = requestAnimationFrame(focusFirst);

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEsc) {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      // Focus trap: keep Tab cycling inside the dialog.
      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible);
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Safety net: if focus somehow lands outside the panel, pull it back in.
    const handleFocusIn = (event) => {
      if (!panel || panel.contains(event.target)) return;
      const first = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)).find(isVisible);
      (first || panel).focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isOpen, onClose, closeOnEsc, initialFocusRef]);

  if (!isOpen) return null;

  const overlayClass =
    overlay === "blur"
      ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4";

  const panelClass = fullWidth
    ? `flex h-full w-full max-w-none flex-col overflow-hidden border border-border bg-surface shadow-xl ${roundedClass}`
    : `flex max-h-[90vh] w-full flex-col overflow-hidden border border-border bg-surface shadow-xl ${sizeClass} ${roundedClass}`;

  return (
    <div
      className={overlayClass}
      onMouseDown={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) onClose?.();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`${panelClass} outline-none`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-text">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-m-1 rounded-full p-1.5 text-text-muted transition hover:bg-primary-50 hover:text-primary-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={`flex-1 px-5 py-4 ${scrollable ? "overflow-y-auto" : ""}`}>{children}</div>
      </div>
    </div>
  );
};

export const AdminFormModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  sizeClass = "max-w-md",
  scrollable = true,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  busy,
  onSubmit,
  formError,
}) => (
  <AdminDialog
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    description={description}
    sizeClass={sizeClass}
    scrollable={scrollable}
  >
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {children}
      {formError && <FormError message={formError} />}
      <AdminFormActions
        busy={busy}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        onCancel={onClose}
      />
    </form>
  </AdminDialog>
);

/* ================================================================== */
/*  Selection helpers                                                  */
/* ================================================================== */

/** Checkbox that also mirrors the `indeterminate` DOM state. */
const IndeterminateCheckbox = ({ indeterminate = false, className = "", ...props }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" className={className} {...props} />;
};

export const AdminSelectAll = ({
  checked = false,
  indeterminate = false,
  onChange,
  label = "Select all",
  disabled = false,
  className = "",
}) => (
  <label
    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text transition hover:border-primary-300 hover:bg-primary-50 has-disabled:cursor-not-allowed has-disabled:opacity-60 ${className}`}
  >
    <IndeterminateCheckbox
      checked={checked}
      indeterminate={indeterminate && !checked}
      onChange={onChange}
      disabled={disabled}
      className={checkboxClass}
    />
    {label}
  </label>
);

export const AdminBulkActions = ({
  selectedCount = 0,
  busy,
  onActivate,
  onDeactivate,
  onDelete,
  activateLabel = "Activate",
  deactivateLabel = "Hide",
  deleteLabel = "Delete",
}) => {
  if (selectedCount === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-text-muted">
        {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
      </span>
      {onActivate && (
        <button type="button" disabled={busy} onClick={onActivate} className={compactButtonClass}>
          {activateLabel}
        </button>
      )}
      {onDeactivate && (
        <button type="button" disabled={busy} onClick={onDeactivate} className={compactButtonClass}>
          {deactivateLabel}
        </button>
      )}
      {onDelete && (
        <button type="button" disabled={busy} onClick={onDelete} className={compactDangerClass}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {deleteLabel}
        </button>
      )}
    </div>
  );
};

export const AdminRowActions = ({
  onEdit,
  onDelete,
  onToggle,
  toggleLabel = "Toggle",
  toggleIcon: ToggleIcon,
  disabled = false,
  deleteLabel = "Delete",
  editLabel = "Edit",
}) => {
  if (!onToggle && !onEdit && !onDelete) return null;
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {onToggle && (
        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          title={toggleLabel}
          className={compactButtonClass}
        >
          {ToggleIcon && <ToggleIcon className="h-3.5 w-3.5" aria-hidden="true" />}
          {toggleLabel}
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          disabled={disabled}
          onClick={onEdit}
          title={editLabel}
          className={compactButtonClass}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> {editLabel}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          title={deleteLabel}
          className={compactDangerClass}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {deleteLabel}
        </button>
      )}
    </div>
  );
};

/* ================================================================== */
/*  Image upload                                                       */
/* ================================================================== */

export const ImageUploadZone = ({
  value,
  onUpload,
  uploading = false,
  isDragging,
  setIsDragging,
  fileInputRef,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  previewUrl,
  onClear,
  label = "Image",
  placeholder = "Drag an image here, or click to upload",
  inputId,
  className = "",
  disabled = false,
}) => {
  const generatedId = useId();
  const fileInputId = inputId || generatedId;
  const hasImage = Boolean(value && previewUrl);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging?.(false);
    if (disabled || uploading) return;
    const file = event.dataTransfer?.files?.[0];
    if (file) onUpload?.(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (disabled || uploading) return;
    if (!isDragging) setIsDragging?.(true);
  };

  const handleDragLeave = (event) => {
    // Ignore dragleave events bubbling from children.
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsDragging?.(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) onUpload?.(file);
    event.target.value = ""; // allow re-selecting the same file
  };

  return (
    <FormField label={label} htmlFor={fileInputId} className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed p-3 transition ${isDragging ? "border-primary-400 bg-primary-50" : "border-border bg-surface-soft"
          } ${disabled ? "opacity-60" : ""}`}
      >
        <input
          id={fileInputId}
          type="file"
          ref={fileInputRef}
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
            {hasImage ? (
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="h-6 w-6 text-text-muted" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text">
              {uploading ? "Uploading…" : hasImage ? "Image attached" : "No image selected"}
            </p>
            <p className="truncate text-xs text-text-muted">{placeholder}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label
            htmlFor={fileInputId}
            aria-disabled={disabled || uploading ? true : undefined}
            className={`${ghostButtonClass} cursor-pointer ${disabled || uploading ? "pointer-events-none opacity-50" : ""
              }`}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <UploadCloud className="h-4 w-4" aria-hidden="true" />
            )}
            {uploading ? "Uploading…" : "Upload"}
          </label>

          {hasImage && onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled || uploading}
              className={compactDangerClass}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
            </button>
          )}
        </div>
      </div>
    </FormField>
  );
};

/* ================================================================== */
/*  Pagination                                                         */
/* ================================================================== */

const PAGE_SIZES = [10, 25, 50, 100];

export const AdminPagination = ({
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  className = "",
}) => {
  if (total <= 0) return null;

  const lastPage = Math.max(totalPages, 1);
  const sizes = PAGE_SIZES.includes(pageSize)
    ? PAGE_SIZES
    : [...PAGE_SIZES, pageSize].sort((a, b) => a - b);

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const go = (next) => {
    const clamped = Math.min(Math.max(next, 1), lastPage);
    if (clamped !== page) onPageChange?.(clamped);
  };

  const navButton = (onClick, disabled, label, Icon) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={compactButtonClass}
      aria-label={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <p className="text-sm text-text-muted">
        Showing <span className="font-bold text-text">{start}</span>–
        <span className="font-bold text-text">{end}</span> of{" "}
        <span className="font-bold text-text">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Rows per page"
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-medium text-text outline-none focus:border-primary-400"
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}

        {navButton(() => go(1), page <= 1, "First page", ChevronsLeft)}
        {navButton(() => go(page - 1), page <= 1, "Previous page", ChevronLeft)}

        <span className="min-w-24 text-center text-sm font-bold text-text">
          Page {page} of {lastPage}
        </span>

        {navButton(() => go(page + 1), page >= lastPage, "Next page", ChevronRight)}
        {navButton(() => go(lastPage), page >= lastPage, "Last page", ChevronsRight)}
      </div>
    </div>
  );
};

/* ================================================================== */
/*  Data table                                                         */
/* ================================================================== */

const asSet = (value) => (value instanceof Set ? value : new Set(value || []));

/**
 * Column shape:
 *   {
 *     key:           string,               // unique key + item accessor
 *     label:         ReactNode,            // header text
 *     render?:       (item) => ReactNode,  // custom cell
 *     className?:    string,               // cell class
 *     headerClassName?: string,
 *     align?:        "left" | "center" | "right",
 *   }
 */
export const AdminDataTable = ({
  title = "Items",
  items = [],
  columns = [],
  status = "idle",
  error,
  onReload,
  emptyTitle,
  emptyMessage,
  emptyAction,
  selection,
  onSelectionChange,
  bulkActions,
  rowActions,
  getRowKey = (item) => item?.id,
  getRowClassName,
  pagination,
  onPaginationChange,
  onPageSizeChange,
  loadingLabel = "Loading…",
  className = "",
}) => {
  const selected = asSet(selection?.selected);
  const onSelect =
    typeof onSelectionChange === "function" ? onSelectionChange : selection?.onSelect;
  const selectable = typeof onSelect === "function";

  const keyFor = (item, index) => getRowKey(item) ?? index;

  const allSelected =
    selectable && items.length > 0 && items.every((item, i) => selected.has(keyFor(item, i)));
  const someSelected =
    selectable && !allSelected && items.some((item, i) => selected.has(keyFor(item, i)));

  const toggleAll = () => {
    if (!selectable) return;
    const next = new Set(selected);
    if (allSelected) {
      items.forEach((item, i) => next.delete(keyFor(item, i)));
    } else {
      items.forEach((item, i) => next.add(keyFor(item, i)));
    }
    onSelect(next);
  };

  const toggleOne = (key, checked) => {
    if (!selectable) return;
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    onSelect(next);
  };

  if (status === "loading" || status === "pending") {
    return <AdminLoader label={loadingLabel} />;
  }

  if (error) {
    const message = typeof error === "string" ? error : error?.message;
    return <AdminError message={message} onRetry={onReload} />;
  }

  const heading = title.toLowerCase();
  const alignClass = (align) =>
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-text">
          All {heading} <span className="font-bold text-text-muted">({items.length})</span>
        </h2>
        <AdminBulkActions
          selectedCount={selected.size}
          busy={bulkActions?.busy}
          onActivate={bulkActions?.onActivate}
          onDeactivate={bulkActions?.onDeactivate}
          onDelete={bulkActions?.onDelete}
          activateLabel={bulkActions?.activateLabel}
          deactivateLabel={bulkActions?.deactivateLabel}
          deleteLabel={bulkActions?.deleteLabel}
        />
      </div>

      {items.length === 0 ? (
        <AdminEmpty
          title={emptyTitle || `No ${heading} yet`}
          message={emptyMessage}
          action={emptyAction}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-176 border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft/60">
                  {selectable && (
                    <th scope="col" className="w-12 px-4 py-3">
                      <IndeterminateCheckbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={toggleAll}
                        aria-label="Select all rows"
                        className={checkboxClass}
                      />
                    </th>
                  )}
                  {columns.map((col, index) => (
                    <th
                      key={col.key ?? index}
                      scope="col"
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-widest text-text-muted ${alignClass(col.align)
                        } ${col.headerClassName || ""}`}
                    >
                      {col.label ?? col.header ?? ""}
                    </th>
                  ))}
                  {rowActions && (
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-text-muted"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => {
                  const key = keyFor(item, index);
                  const isSelected = selected.has(key);
                  return (
                    <tr
                      key={key}
                      className={`border-b border-border/60 transition last:border-0 hover:bg-surface-soft ${isSelected ? "bg-primary-50/60" : ""
                        } ${getRowClassName?.(item) || ""}`}
                    >
                      {selectable && (
                        <td className="px-4 py-3 align-middle">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => toggleOne(key, event.target.checked)}
                            aria-label={`Select row ${key}`}
                            className={checkboxClass}
                          />
                        </td>
                      )}

                      {columns.map((col, colIndex) => (
                        <td
                          key={col.key ?? colIndex}
                          className={`px-4 py-3 align-middle ${alignClass(col.align)} ${col.className || ""
                            }`}
                        >
                          {col.render ? col.render(item) : item?.[col.key]}
                        </td>
                      ))}

                      {rowActions && (
                        <td className="px-4 py-3 align-middle">{rowActions(item)}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination && (
            <AdminPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onPageChange={onPaginationChange}
              onPageSizeChange={onPageSizeChange}
              className="border-t border-border px-4 py-3"
            />
          )}
        </div>
      )}
    </section>
  );
};