import { AdminDialog, AdminFormActions, FormField, FormError, fieldClass } from "../../admin-ui";

const StockAdjustModal = ({
  isOpen,
  onClose,
  onSubmit,
  busy,
  qty,
  onQtyChange,
  reason,
  onReasonChange,
  error,
}) => {
  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Stock"
      sizeClass="max-w-md"
    >
      <p className="mt-1 text-sm text-text-muted">
        Use positive numbers to add stock and negative numbers to remove it
        (e.g. damaged goods or a supplier return).
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <FormField
          label="Adjustment (units)"
          htmlFor="stock-adjust-qty"
          required
        >
          <input
            id="stock-adjust-qty"
            type="number"
            step="1"
            value={qty}
            onChange={(e) => onQtyChange(e.target.value)}
            placeholder="+5 or -2"
            className={fieldClass}
          />
        </FormField>

        <FormField
          label="Reason"
          htmlFor="stock-adjust-reason"
          required
        >
          <input
            id="stock-adjust-reason"
            maxLength={200}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Stock take, damaged goods, supplier return..."
            className={fieldClass}
          />
        </FormField>

        {error && <FormError message={error} />}

        <AdminFormActions
          busy={busy}
          submitLabel="Apply Adjustment"
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </form>
    </AdminDialog>
  );
};

export default StockAdjustModal;