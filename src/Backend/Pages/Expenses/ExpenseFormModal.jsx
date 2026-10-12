import { AdminDialog, AdminFormActions, FormField, FormError, fieldClass } from "../../admin-ui";

const ExpenseFormModal = ({
  isOpen,
  onClose,
  editingId,
  draft,
  setDraft,
  fieldErrors,
  formError,
  busy,
  categories,
  paymentMethods,
  handleSubmit,
  submitLabel,
}) => {
  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? "Edit Expense" : "New Expense"}
      sizeClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <FormField label="Amount (BDT)" htmlFor="ex-amount" required error={fieldErrors?.amount}>
          <input
            id="ex-amount"
            type="number"
            min="0"
            step="0.01"
            value={draft.amount}
            onChange={(e) => updateField("amount", e.target.value)}
            className={fieldClass}
            required
          />
        </FormField>

        <FormField label="Category" htmlFor="ex-category" required error={fieldErrors?.categoryId}>
          <select
            id="ex-category"
            value={draft.categoryId}
            onChange={(e) => updateField("categoryId", e.target.value)}
            className={fieldClass}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date" htmlFor="ex-date" required error={fieldErrors?.date}>
            <input
              id="ex-date"
              type="date"
              value={draft.date}
              onChange={(e) => updateField("date", e.target.value)}
              className={fieldClass}
              required
            />
          </FormField>

          <FormField label="Payment method" htmlFor="ex-payment" error={fieldErrors?.paymentMethod}>
            <select
              id="ex-payment"
              value={draft.paymentMethod}
              onChange={(e) => updateField("paymentMethod", e.target.value)}
              className={fieldClass}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Notes" htmlFor="ex-notes">
          <textarea
            id="ex-notes"
            rows={2}
            maxLength={500}
            value={draft.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className={fieldClass}
            placeholder="Optional"
          />
        </FormField>

        {formError && <FormError message={formError} className="sm:col-span-2" />}

        <AdminFormActions
          busy={busy}
          submitLabel={submitLabel || (editingId ? "Save Changes" : "Create Expense")}
          onCancel={onClose}
        />
      </form>
    </AdminDialog>
  );
};

export default ExpenseFormModal;
