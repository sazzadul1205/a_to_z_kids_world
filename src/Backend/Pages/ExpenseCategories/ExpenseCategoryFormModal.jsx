import { AdminDialog, AdminFormActions, FormField, FormError, fieldClass } from "../../admin-ui";

const icons = ["🧾", "🛒", "🏠", "🚚", "📦", "💰", "💳", "🏦", "🧮", "📊", "🎯", "🎁", "🏆", "📈", "🔧", "🌐", "⚡", "🔥", "💝", "⭐"];

const ExpenseCategoryFormModal = ({
  isOpen,
  onClose,
  editingId,
  draft,
  setDraft,
  fieldErrors,
  formError,
  busy,
  handleSubmit,
}) => {
  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? "Edit Expense Category" : "New Expense Category"}
      sizeClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {formError && <FormError message={formError} className="sm:col-span-2" />}

        <FormField label="Name" htmlFor="ec-name" required error={fieldErrors?.name}>
          <input
            id="ec-name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={draft.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={fieldClass}
            placeholder="e.g. Marketing, Rent, Utilities"
            autoFocus
          />
        </FormField>

        <FormField label="Description" htmlFor="ec-description" error={fieldErrors?.description}>
          <textarea
            id="ec-description"
            rows={2}
            maxLength={500}
            value={draft.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={fieldClass}
            placeholder="Optional description"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Color" htmlFor="ec-color" error={fieldErrors?.color}>
            <input
              id="ec-color"
              maxLength={40}
              value={draft.color}
              onChange={(e) => updateField("color", e.target.value)}
              placeholder="#3B82F6"
              className={fieldClass}
            />
          </FormField>

          <FormField label="Icon" htmlFor="ec-icon" error={fieldErrors?.icon}>
            <select
              id="ec-icon"
              value={draft.icon}
              onChange={(e) => updateField("icon", e.target.value)}
              className={fieldClass}
            >
              {icons.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="ec-isActive"
            type="checkbox"
            checked={draft.isActive !== false}
            onChange={(e) => updateField("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="ec-isActive" className="text-sm font-medium text-text">
            Active
          </label>
        </div>

        <FormField label="Sort order" htmlFor="ec-sort" error={fieldErrors?.sortOrder}>
          <input
            id="ec-sort"
            type="number"
            min="0"
            step="1"
            value={draft.sortOrder}
            onChange={(e) => updateField("sortOrder", e.target.value)}
            className={fieldClass}
          />
        </FormField>

        <AdminFormActions
          busy={busy}
          submitLabel={editingId ? "Save Changes" : "Create Category"}
          onCancel={onClose}
        />
      </form>
    </AdminDialog>
  );
};

export default ExpenseCategoryFormModal;
