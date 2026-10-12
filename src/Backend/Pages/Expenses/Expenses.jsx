import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Tag } from "lucide-react";
import { expensesApi, expenseCategoriesApi } from "../../../Frontend/lib/api";
import { formatBDT } from "../../../Frontend/lib/currency";
import { confirmDialog, toastSuccess, toastError } from "../../../Frontend/lib/swal";
import Pagination from "../../../Frontend/Components/Pagination";
import { usePagination } from "../../../Frontend/hooks/usePagination";
import { AdminEmpty, AdminError, AdminHeader, AdminLoader, StatusPill, dangerButtonClass, ghostButtonClass, primaryButtonClass } from "../../admin-ui";
import ExpenseFormModal from "./ExpenseFormModal";

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
  const { page, setPage, pageSize, total, totalPages, window: visibleExpenses } = usePagination(expenses);
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

  const closeForm = () => setFormOpen(false);

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

  return (
    <div className="space-y-8">
      <AdminHeader section="Accounting" title="Expenses">
        <button onClick={openCreate} className={primaryButtonClass}>
          <Plus className="h-4 w-4" /> New expense
        </button>
      </AdminHeader>

      {error && <AdminError message={error.message} />}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">
          Recent expenses <span className="text-text-muted">({total || 0})</span>
        </h2>
        <div className="mt-4 space-y-3">
          {expenses.length === 0 ? (
            <AdminEmpty title="No expenses yet" message="Create one above." />
          ) : (
            visibleExpenses.map((expense) => (
              <div
                key={expense._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <Tag className="h-4 w-4 text-text-muted" />
                  <div>
                    <p className="font-bold text-text">{expense.category?.name || "Uncategorized"}</p>
                    <p className="text-xs text-text-muted">
                      {expense.vendor || ""} · {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-text">{formatBDT(expense.amount || 0)}</span>
                  <StatusPill value={expense.paymentMethod || "cash"} />
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openEdit(expense)} className={ghostButtonClass}>
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(expense)} disabled={deleteMutation.isPending} className={dangerButtonClass}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          className="mt-4"
        />
      </section>

      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        editingId={editingId}
        draft={draft}
        setDraft={setDraft}
        setFormError={setFormError}
        setFieldErrors={setFieldErrors}
        fieldErrors={fieldErrors}
        formError={formError}
        busy={createMutation.isPending || updateMutation.isPending}
        categories={categories || []}
        paymentMethods={PAYMENT_METHODS}
        handleSubmit={handleSubmit}
        submitLabel={editingId ? "Save Changes" : "Create Expense"}
      />
    </div>
  );
};

export default Expenses;
