import { useState } from "react";
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
   Database,
} from "lucide-react";
import { confirmDialog, toastError, toastSuccess } from "../../../Frontend/lib/swal";
import {
  useBackupsQuery,
  useBackupMutations,
} from "../../../Frontend/hooks/useAdminQueries";
import {
  AdminEmpty,
  AdminError,
  AdminLoader,
  AdminHeader,
  primaryButtonClass,
  ghostButtonClass,
  dangerButtonClass,
} from "../../admin-ui";

const STATUS_COLORS = {
  success: "bg-primary-100 text-primary-900",
  error: "bg-primary-100 text-primary-900",
  pending: "bg-accent-100 text-accent-900",
  warning: "bg-accent-100 text-accent-900",
};

const STATUS_ICONS = {
  success: CheckCircle,
  error: AlertTriangle,
  pending: Clock,
  warning: AlertTriangle,
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (isoString) => {
  if (!isoString) return "-";
  try {
    return new Date(isoString).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const BackupRestore = () => {
  const { data: backups, isLoading, error, refetch } = useBackupsQuery();
  const { create: createBackup, restore: restoreBackup, remove: deleteBackup } = useBackupMutations();

  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [restoreLog, setRestoreLog] = useState(null);

  const handleCreateBackup = async () => {
    const confirmed = await confirmDialog({
      title: "Create Backup?",
      text: "This will export all current data (products, orders, users, etc.) to a timestamped file.",
      confirmText: "Create Backup",
    });
    if (!confirmed) return;

    setCreating(true);
    try {
      await createBackup.mutateAsync();
      toastSuccess("Backup created successfully!");
      setRestoreLog(null);
    } catch (err) {
      toastError(err.message || "Failed to create backup");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (backup) => {
    const confirmed = await confirmDialog({
      title: "Restore Backup?",
      text: `This will replace all current data with the backup from ${formatDate(backup.createdAt)}. This action cannot be undone.`,
      confirmText: "Restore Now",
      danger: true,
    });
    if (!confirmed) return;

    setRestoring(backup.filename);
    try {
      const result = await restoreBackup.mutateAsync({
        filename: backup.filename,
        options: { clearFirst: true, skipCollections: ["users"] },
      });
      toastSuccess("Data restored successfully! Refresh the page to see changes.");
      setRestoreLog(result.restoreLog);
      refetch();
    } catch (err) {
      toastError(err.message || "Failed to restore backup");
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (backup) => {
    const confirmed = await confirmDialog({
      title: "Delete Backup?",
      text: `Delete backup file "${backup.filename}"? This cannot be undone.`,
      confirmText: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    setDeleting(backup.filename);
    try {
      await deleteBackup.mutateAsync(backup.filename);
      toastSuccess("Backup deleted");
    } catch (err) {
      toastError(err.message || "Failed to delete backup");
    } finally {
      setDeleting(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    setRestoreLog(null);
  };

  const collectionIcons = {
    products: Package,
    categories: Package,
    orders: FileText,
    users: Database,
    reviews: Database,
    settings: Database,
  };

  if (isLoading) return <AdminLoader label="Loading backups..." />;
  if (error) return <AdminError message={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      <AdminHeader
        section="System"
        title="Backup & Restore"
        subtitle="Export and restore application data"
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCreateBackup}
          disabled={creating}
          className={`${primaryButtonClass} flex items-center gap-2`}
        >
          {creating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {creating ? "Creating..." : "Create Backup"}
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          className={ghostButtonClass}
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {restoreLog && (
        <div className="rounded-2xl border border-primary-300 bg-primary-50 p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary-800">
            Restore Results
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(restoreLog).map(([collection, info]) => {
              const Icon = collectionIcons[collection] || Database;
              const status = info.error ? "error" : info.restored > 0 ? "success" : "pending";
              const StatusIcon = STATUS_ICONS[status];
              return (
                <div key={collection} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
                  <div className={`rounded-lg p-1.5 ${STATUS_COLORS[status]}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <Icon className="h-4 w-4 text-text-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text">{collection}</p>
                    <p className="text-xs text-text-muted">
                      {info.error ? info.error : `${info.restored} restored`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">Available Backups</h2>

        {!backups || backups.length === 0 ? (
          <AdminEmpty
            title="No backups found"
            message="Create your first backup above to protect your data."
          />
        ) : (
          <div className="mt-4 space-y-3">
            {backups.map((backup) => {
              return (
                <div
                  key={backup.filename}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-fill/10">
                      <Download className="h-5 w-5 text-brand-fill" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text">{backup.filename}</p>
                      <p className="truncate text-sm text-text-muted">
                        Created: {formatDate(backup.createdAt || backup.modifiedAt)}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        Size: {formatBytes(backup.size)} ·
                        Collections: {Object.keys(backup.metadata?.collections || {}).length}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestore(backup)}
                      disabled={restoring === backup.filename}
                      className={primaryButtonClass}
                      title="Restore this backup"
                    >
                      {restoring === backup.filename ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {restoring === backup.filename ? "Restoring..." : "Restore"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(backup)}
                      disabled={deleting === backup.filename}
                      className={dangerButtonClass}
                      title="Delete this backup"
                    >
                      {deleting === backup.filename ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">How It Works</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-primary-100 p-2 text-primary-700">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-text">Create Backup</p>
              <p className="text-sm text-text-muted">
                Exports all collections (products, categories, orders, users, reviews, settings)
                to a timestamped JSON file stored in the data/backups directory.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-primary-100 p-2 text-primary-700">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-text">Restore</p>
              <p className="text-sm text-text-muted">
                Replaces all data with the backup content. The users collection is preserved
                to avoid locking out admins. Review the restore log for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
