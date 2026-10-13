import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { expenseCategoriesApi } from "../../../Frontend/lib/api";
import { confirmDialog, toastSuccess, toastError } from "../../../Frontend/lib/swal";
import { usePagination } from "../../../Frontend/hooks/usePagination";
import {
  AdminError,
  AdminHeader,
  AdminLoader,
  AdminFormModal,
  AdminDataTable,
  AdminRowActions,
  FormField,
  FormFieldInput,
  FormFieldTextarea,
  FormFieldSelect,
  fieldClass,
  primaryButtonClass,
} from "../../admin-ui";

const emptyDraft = { name: "", description: "", color: "#3B82F6", icon: "🧾", isActive: true, sortOrder: 0 };

const icons = ["🧾", "🛒", "🏠", "🚚", "📦", "💰", "💳", "🏦", "🧮", "📊", "🎯", "🎁", "🏆", "📈", "🔧", "🌐", "⚡", "🔥", "💝", "⭐"];

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
  const { page, setPage, pageSize, totalPages, window: visibleCategories } = usePagination(categories);

  const closeForm = () => setFormOpen(false);

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

  const columns = [
    {
      key: "icon",
      render: (category) => (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ backgroundColor: `${category.color || "#CBD5E1"}20` }}
        >
          {category.icon || "🧾"}
        </span>
      ),
      className: "",
    },
    {
      key: "name",
      render: (category) => (
        <div>
          <p className="font-bold text-text">{category.name}</p>
          <p className="text-xs text-text-muted">
            {category.description || "No description"} · {category.sortOrder || 0}
          </p>
        </div>
      ),
      className: "flex-1 min-w-0",
    },
    {
      key: "isActive",
      render: (category) => (
        <span className={category.isActive !== false ? "text-xs text-primary-700" : "text-xs text-text-muted"}>
          {category.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
      className: "w-24",
    },
  ];

  const getRowKey = (category) => category._id;

  const rowActions = (category) => (
    <AdminRowActions
      onEdit={() => openEdit(category)}
      onDelete={() => handleDelete(category)}
      disabled={deleteMutation.isPending}
      editLabel="Edit"
      deleteLabel="Delete"
    />
  );

  const handlePageChange = (newPage) => setPage(newPage);

  return (
    <div className="space-y-8">
      <AdminHeader section="Accounting" title="Expense Categories">
        <button onClick={openCreate} className={primaryButtonClass}>
          <Plus className="h-4 w-4" /> New category
        </button>
      </AdminHeader>

      {error && <AdminError message={error.message} onRetry={refetch} />}

      <AdminDataTable
        title="Expense Categories"
        subtitle="Accounting"
        items={visibleCategories}
        columns={columns}
        status={status}
        error={error}
        onReload={refetch}
        emptyTitle="No expense categories yet"
        emptyMessage="Create the first one above."
        rowActions={rowActions}
        getRowKey={getRowKey}
        pagination={{ page, pageSize, total: categories.length, totalPages }}
        onPaginationChange={handlePageChange}
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit Expense Category" : "New Expense Category"}
        sizeClass="max-w-lg"
        busy={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        formError={formError}
        submitLabel={editingId ? "Save Changes" : "Create Category"}
      >
        <FormFieldInput
          label="Name"
          htmlFor="ec-name"
          required
          error={fieldErrors?.name}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          minLength={2}
          maxLength={100}
          placeholder="e.g. Marketing, Rent, Utilities"
          autoFocus
          className={fieldClass}
        />
        <FormFieldTextarea
          label="Description"
          htmlFor="ec-description"
          error={fieldErrors?.description}
          rows={2}
          maxLength={500}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Optional description"
          className={fieldClass}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormFieldInput
            label="Color"
            htmlFor="ec-color"
            error={fieldErrors?.color}
            maxLength={40}
            value={draft.color}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
            placeholder="#3B82F6"
            className={fieldClass}
          />
          <FormFieldSelect
            label="Icon"
            htmlFor="ec-icon"
            error={fieldErrors?.icon}
            value={draft.icon}
            onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
            className={fieldClass}
          >
            {icons.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </FormFieldSelect>
        </div>
        <FormField label="Active" className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <input
              id="ec-isActive"
              type="checkbox"
              checked={draft.isActive !== false}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="ec-isActive" className="text-sm font-medium text-text">
              Active
            </label>
          </div>
        </FormField>
        <FormFieldInput
          label="Sort order"
          htmlFor="ec-sort"
          error={fieldErrors?.sortOrder}
          type="number"
          min="0"
          step="1"
          value={draft.sortOrder}
          onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
          className={fieldClass}
        />
      </AdminFormModal>
    </div>
  );
};

export default ExpenseCategories;