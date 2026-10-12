import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { expenseCategoriesApi } from "../../../Frontend/lib/api";
import { confirmDialog, toastSuccess, toastError } from "../../../Frontend/lib/swal";
import Pagination from "../../../Frontend/Components/Pagination";
import { usePagination } from "../../../Frontend/hooks/usePagination";
import {
  AdminEmpty,
  AdminError,
  AdminHeader,
  AdminLoader,
  primaryButtonClass,
} from "../../admin-ui";
import ExpenseCategoryFormModal from "./ExpenseCategoryFormModal";

const emptyDraft = { name: "", description: "", color: "#3B82F6", icon: "🧾", isActive: true, sortOrder: 0 };

const ExpenseCategories = () => {
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);

  const client = useQueryClient();

  const { data, status, error, refetch } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expenseCategoriesApi.list(),
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: (newData) => expenseCategoriesApi.create(newData),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["expense-categories"] }); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...rest }) => expenseCategoriesApi.update(id, rest),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["expense-categories"] }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => expenseCategoriesApi.remove(id),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["expense-categories"] }); },
  });

  const categories = Array.isArray(data) ? data : (data?.expenseCategories || data || []);
  const { page, setPage, pageSize, total, totalPages, window: visibleCategories } = usePagination(categories);

  const openCreate = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setFormError(null);
    setFieldErrors(null);
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setDraft({
      name: category.name,
      description: category.description || "",
      color: category.color || "#3B82F6",
      icon: category.icon || "🧾",
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
    });
    setEditingId(category._id);
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
      name: draft.name.trim(),
      description: draft.description.trim(),
      color: draft.color,
      icon: draft.icon,
      isActive: draft.isActive,
      sortOrder: Number(draft.sortOrder) || 0,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        toastSuccess("Category updated");
      } else {
        await createMutation.mutateAsync(payload);
        toastSuccess("Category created");
      }
      setFormOpen(false);
      client.invalidateQueries({ queryKey: ["expense-categories"] });
    } catch (err) {
      setFormError(err.message);
      setFieldErrors(err.errors || null);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = await confirmDialog({
      title: `Delete "${category.name}"?`,
      text: "This cannot be undone.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(category._id);
      toastSuccess("Category deleted");
    } catch (err) {
      toastError(err.message);
    }
  };

  if (status === "loading") return <AdminLoader label="Loading expense categories..." />;

  return (
    <div className="space-y-8">
      <AdminHeader section="Accounting" title="Expense Categories">
        <button onClick={openCreate} className={primaryButtonClass}>
          <Plus className="h-4 w-4" /> New category
        </button>
      </AdminHeader>

      {error && <AdminError message={error.message} onRetry={refetch} />}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">
          All expense categories <span className="text-text-muted">({total || 0})</span>
        </h2>
        <div className="mt-4 space-y-3">
          {categories.length === 0 ? (
            <AdminEmpty title="No expense categories yet" message="Create the first one above." />
          ) : (
            visibleCategories.map((category) => (
              <div
                key={category._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: `${category.color || "#CBD5E1"}20` }}
                  >
                    {category.icon || "🧾"}
                  </span>
                  <div>
                    <p className="font-bold text-text">{category.name}</p>
                    <p className="text-xs text-text-muted">
                      {category.description || "No description"} · {category.sortOrder || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={category.isActive !== false ? "text-xs text-primary-700" : "text-xs text-text-muted"}>
                    {category.isActive !== false ? "Active" : "Inactive"}
                  </span>
                  <button type="button" onClick={() => openEdit(category)} className="p-1 text-text-muted hover:text-text">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(category)} className="p-1 text-text-muted hover:text-primary-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
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

      <ExpenseCategoryFormModal
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
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default ExpenseCategories;
