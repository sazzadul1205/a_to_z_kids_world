import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Tag } from "lucide-react";
import { expensesApi, expenseCategoriesApi } from "../../../Frontend/lib/api";
import { formatBDT } from "../../../Frontend/lib/currency";
import { confirmDialog, toastSuccess, toastError } from "../../../Frontend/lib/swal";
import { usePagination } from "../../../Frontend/hooks/usePagination";
import {
  AdminError,
  AdminHeader,
  AdminLoader,
  AdminFormModal,
  AdminDataTable,
  AdminRowActions,
  StatusPill,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
  fieldClass,
  primaryButtonClass,
} from "../../admin-ui";

const PAYMENT_METHODS = ["cash", "bank", "card", "other"];
const emptyDraft = { amount: "", categoryId: "", date: "", paymentMethod: "cash", notes: "" };

const Expenses = () => {
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);

  const { data, status, error } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => expensesApi.list(),
    staleTime: 0,
  });

  const { data: categories } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expenseCategoriesApi.list(),
    staleTime: 60000,
  });

  const expenses = data?.expenses || data || [];
  const { page, setPage, pageSize, totalPages, window: visibleExpenses } = usePagination(expenses);
  const client = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (newData) => expensesApi.create(newData),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["expenses"] }); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...rest }) => expensesApi.update(id, rest),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["expenses"] }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => expensesApi.remove(id),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["expenses"] }); },
  });

  const closeForm = () => setFormOpen(false);

  const openCreate = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setFormError(null);
    setFieldErrors(null);
    setFormOpen(true);
  };

  const openEdit = (expense) => {
    setDraft({
      amount: String(expense.amount),
      categoryId: String(expense.categoryId || ""),
      date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
      paymentMethod: expense.paymentMethod || "cash",
      notes: expense.notes || "",
    });
    setEditingId(expense._id);
    setFormError(null);
    setFieldErrors(null);
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors(null);

    const payload = {
      amount: Number(draft.amount),
      categoryId: draft.categoryId,
      date: draft.date,
      paymentMethod: draft.paymentMethod,
      notes: draft.notes.trim(),
    };

    try {
      if (editingId) await updateMutation.mutateAsync({ id: editingId, ...payload });
      else await createMutation.mutateAsync(payload);
      toastSuccess("Expense saved");
      setFormOpen(false);
      client.invalidateQueries({ queryKey: ["expenses"] });
    } catch (err) {
      setFormError(err.message);
      setFieldErrors(err.errors || null);
    }
  };

  const handleDelete = async (expense) => {
    const confirmed = await confirmDialog({
      title: `Delete "${expense.category?.name || "expense"}"?`,
      text: "This cannot be undone.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(expense._id);
      toastSuccess("Expense deleted");
    } catch (err) {
      toastError(err.message);
    }
  };

  if (status === "loading") return <AdminLoader label="Loading expenses..." />;

  const columns = [
    {
      key: "category",
      render: (expense) => (
        <div className="flex items-center gap-4">
          <Tag className="h-4 w-4 text-text-muted" />
          <div>
            <p className="font-bold text-text">{expense.category?.name || "Uncategorized"}</p>
            <p className="text-xs text-text-muted">
              {expense.vendor || ""} · {new Date(expense.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ),
      className: "flex-1 min-w-0",
    },
    {
      key: "amount",
      render: (expense) => (
        <span className="font-semibold text-text">{formatBDT(expense.amount || 0)}</span>
      ),
      className: "w-40 text-right",
    },
    {
      key: "paymentMethod",
      render: (expense) => <StatusPill value={expense.paymentMethod || "cash"} />,
      className: "w-32",
    },
  ];

  const getRowKey = (expense) => expense._id;

  const rowActions = (expense) => (
    <AdminRowActions
      onEdit={() => openEdit(expense)}
      onDelete={() => handleDelete(expense)}
      disabled={deleteMutation.isPending}
      editLabel="Edit"
      deleteLabel="Delete"
    />
  );

  const handlePageChange = (newPage) => setPage(newPage);

  return (
    <div className="space-y-8">
      <AdminHeader section="Accounting" title="Expenses">
        <button onClick={openCreate} className={primaryButtonClass}>
          <Plus className="h-4 w-4" /> New expense
        </button>
      </AdminHeader>

      {error && <AdminError message={error.message} />}

      <AdminDataTable
        title="Expenses"
        subtitle="Accounting"
        items={visibleExpenses}
        columns={columns}
        status={status}
        error={error}
        onReload={() => client.invalidateQueries({ queryKey: ["expenses"] })}
        emptyTitle="No expenses yet"
        emptyMessage="Create one above."
        rowActions={rowActions}
        getRowKey={getRowKey}
        pagination={{ page, pageSize, total: expenses.length, totalPages }}
        onPaginationChange={handlePageChange}
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit Expense" : "New Expense"}
        sizeClass="max-w-lg"
        busy={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        formError={formError}
        submitLabel={editingId ? "Save Changes" : "Create Expense"}
      >
        <FormFieldInput
          label="Amount (BDT)"
          htmlFor="ex-amount"
          required
          error={fieldErrors?.amount}
          type="number"
          min="0"
          step="0.01"
          value={draft.amount}
          onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
          className={fieldClass}
        />
        <FormFieldSelect
          label="Category"
          htmlFor="ex-category"
          required
          error={fieldErrors?.categoryId}
          value={draft.categoryId}
          onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
          className={fieldClass}
        >
          <option value="">Select a category</option>
          {(categories || []).map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </FormFieldSelect>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormFieldInput
            label="Date"
            htmlFor="ex-date"
            required
            error={fieldErrors?.date}
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            className={fieldClass}
          />
          <FormFieldSelect
            label="Payment method"
            htmlFor="ex-payment"
            error={fieldErrors?.paymentMethod}
            value={draft.paymentMethod}
            onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value })}
            className={fieldClass}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </option>
            ))}
          </FormFieldSelect>
        </div>
        <FormFieldTextarea
          label="Notes"
          htmlFor="ex-notes"
          rows={2}
          maxLength={500}
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder="Optional"
          className={fieldClass}
        />
      </AdminFormModal>
    </div>
  );
};

export default Expenses;