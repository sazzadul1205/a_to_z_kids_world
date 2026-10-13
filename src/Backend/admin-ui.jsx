import { useId } from "react";
import { AlertTriangle, Loader2, PackageOpen, Save, X, CheckSquare, MinusSquare, ChevronLeft, ChevronRight, Trash2, Pencil, ImagePlus, UploadCloud } from "lucide-react";

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

const SELECT_ALL_ICONS = {
  false: CheckSquare,
  true: CheckSquare,
  indeterminate: MinusSquare,
};

export const AdminSelectAll = ({ checked, indeterminate, onChange, label = "Select all" }) => {
  const Icon = indeterminate ? SELECT_ALL_ICONS.indeterminate : checked ? SELECT_ALL_ICONS.true : SELECT_ALL_ICONS.false;
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text cursor-pointer hover:bg-primary-50 hover:border-primary-300">
      <input
        type="checkbox"
        checked={checked}
        indeterminate={indeterminate}
        onChange={onChange}
        className="h-4 w-4 rounded border-border"
      />
      <Icon className="h-4 w-4" />
      {label}
    </label>
  );
};

export const AdminBulkActions = ({ selectedCount, busy, onActivate, onDeactivate, onDelete, activateLabel = "Activate", deactivateLabel = "Hide", deleteLabel = "Delete" }) => {
  if (selectedCount === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-text-muted">
        {selectedCount} item{selectedCount === 1 ? "" : "s"} selected.
      </span>
      <button type="button" disabled={busy} onClick={onActivate} className={ghostButtonClass}>
        {activateLabel}
      </button>
      <button type="button" disabled={busy} onClick={onDeactivate} className={ghostButtonClass}>
        {deactivateLabel}
      </button>
      <button type="button" disabled={busy} onClick={onDelete} className={dangerButtonClass}>
        <Trash2 className="h-4 w-4" /> {deleteLabel}
      </button>
    </div>
  );
};

export const AdminRowActions = ({ onEdit, onDelete, onToggle, toggleLabel, toggleIcon: ToggleIcon, disabled, deleteLabel = "Delete", editLabel = "Edit" }) => (
  <div className="flex shrink-0 flex-wrap items-center gap-2">
    {onToggle && (
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        title={toggleLabel}
        className={ghostButtonClass}
      >
        <ToggleIcon className="h-4 w-4" /> {toggleLabel}
      </button>
    )}
    {onEdit && (
      <button type="button" onClick={onEdit} className={ghostButtonClass}>
        <Pencil className="h-4 w-4" /> {editLabel}
      </button>
    )}
    {onDelete && (
      <button type="button" disabled={disabled} onClick={onDelete} className={dangerButtonClass}>
        <Trash2 className="h-4 w-4" /> {deleteLabel}
      </button>
    )}
  </div>
);

export const ImageUploadZone = ({
  value,
  onUpload,
  uploading,
  isDragging,
  setIsDragging,
  fileInputRef,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  previewUrl,
  onClear,
  label = "Image",
  placeholder = "Drag an image here, or click to upload",
  inputId,
}) => {
  const generatedId = useId();
  const fileInputId = inputId || generatedId;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    onUpload(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileSelect = (e) => {
    onUpload(e.target.files?.[0]);
  };

  const handleClear = () => {
    if (onClear) onClear();
  };

  return (
    <FormField label={label} className="sm:col-span-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed p-3 transition ${
          isDragging ? "border-primary-400 bg-primary-50" : "border-border bg-surface-soft"
        }`}
      >
        <input
          id={fileInputId}
          type="file"
          ref={fileInputRef}
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
        <label htmlFor={fileInputId} className="flex cursor-pointer flex-col items-center gap-2 flex-1 min-w-[200px]">
          {previewUrl && value ? (
            <img src={previewUrl} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <ImagePlus className="h-8 w-8 text-text-muted" />
          )}
          <span className="text-xs text-text-muted">{uploading ? "Uploading..." : placeholder}</span>
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={ghostButtonClass}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {(previewUrl && value) && (
        <button type="button" onClick={handleClear} className={ghostButtonClass}>
          Clear
        </button>
      )}
    </FormField>
  );
};

const PAGE_SIZES = [10, 25, 50, 100];

export const AdminPagination = ({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange, className = "" }) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="text-sm text-text-muted">
        Showing {start}–{end} of {total}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-medium text-text outline-none focus:border-primary-400"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={ghostButtonClass}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-text">{page} / {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={ghostButtonClass}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const AdminDataTable = ({
  title,
  subtitle,
  items,
  columns,
  status = "idle",
  error,
  onReload,
  emptyTitle,
  emptyMessage,
  selection,
  onSelectionChange,
  bulkActions,
  rowActions,
  getRowKey,
  getRowClassName,
  pagination,
  onPaginationChange,
  onPageSizeChange,
  headerActions,
  loadingLabel = "Loading...",
}) => {
  const { page, pageSize, total, totalPages } = pagination || {};
  const selected = selection?.selected || new Set();
  const onSelect = onSelectionChange || selection?.onSelect;

  const handleSelectAll = () => {
    if (selected.size === items.length) {
      onSelect?.(new Set());
    } else {
      onSelect?.(new Set(items.map(getRowKey)));
    }
  };

  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0 && selected.size < items.length;

  if (status === "loading" || status === "pending") {
    return <AdminLoader label={loadingLabel} />;
  }

  if (error) {
    return <AdminError message={error.message} onRetry={onReload} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">
            {subtitle || "Data"}
          </p>
          <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">{title}</h1>
        </div>
        <div className="flex items-center gap-3">{headerActions}</div>
      </div>

      {items.length === 0 && (
        <AdminEmpty title={emptyTitle || "No items yet"} message={emptyMessage} />
      )}

      {items.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-text">
              All {title.toLowerCase()} <span className="text-text-muted">({items.length})</span>
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

          <AdminSelectAll
            checked={allSelected}
            indeterminate={someSelected}
            onChange={handleSelectAll}
          />

          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const key = getRowKey(item);
              const isSelected = selected.has(key);
              const rowClassName = getRowClassName?.(item);
              const actions = rowActions?.(item);

              return (
                <div
                  key={key}
                  className={`flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3 ${
                    rowClassName || ""
                  } ${isSelected ? "ring-2 ring-primary-200" : ""}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(key);
                        else next.delete(key);
                        onSelect?.(next);
                      }}
                      aria-label={`Select ${columns[0]?.render?.(item) || key}`}
                      className="h-4 w-4 rounded border-border"
                    />
                    {columns.map((col, i) =>
                      col.render ? (
                        <div key={col.key || i} className={col.className}>
                          {col.render(item)}
                        </div>
                      ) : (
                        <div key={col.key || i} className={col.className}>
                          {item[col.key]}
                        </div>
                      )
                    )}
                  </div>
                  {actions && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {actions}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {pagination && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={onPaginationChange}
              onPageSizeChange={onPageSizeChange}
              className="mt-4"
            />
          )}
        </section>
      )}
    </div>
  );
};

export const AdminFormModal = ({
  isOpen,
  onClose,
  title,
  children,
  sizeClass = "max-w-md",
  scrollable = false,
  submitLabel,
  cancelLabel = "Cancel",
  busy,
  onSubmit,
  formError,
}) => {
  if (!isOpen) return null;

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      sizeClass={sizeClass}
      scrollable={scrollable}
    >
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {children}
        {formError && <FormError message={formError} className="sm:col-span-2" />}
        <AdminFormActions
          busy={busy}
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
          onCancel={onClose}
        />
      </form>
    </AdminDialog>
  );
};

export const FormFieldInput = ({ label, htmlFor, required, error, children, className = "", ...props }) => (
  <FormField label={label} htmlFor={htmlFor} required={required} error={error} className={className}>
    {children}
    <input {...props} />
  </FormField>
);

export const FormFieldSelect = ({ label, htmlFor, required, error, children, className = "", ...props }) => (
  <FormField label={label} htmlFor={htmlFor} required={required} error={error} className={className}>
    {children}
    <select {...props} />
  </FormField>
);

export const FormFieldTextarea = ({ label, htmlFor, required, error, children, className = "", ...props }) => (
  <FormField label={label} htmlFor={htmlFor} required={required} error={error} className={className}>
    {children}
    <textarea {...props} />
  </FormField>
);
