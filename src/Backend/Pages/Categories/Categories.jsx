import { useState } from "react";
import { Plus } from "lucide-react";
import { useCatalog } from "../../../Frontend/context/catalog/useCatalog";
import { useCategoryMutations } from "../../../Frontend/hooks/useAdminQueries";
import { iconForCategoryName } from "../../../Frontend/lib/presentation";
import { confirmDialog, toastSuccess } from "../../../Frontend/lib/swal";
import { usePagination } from "../../../Frontend/hooks/usePagination";
import {
  AdminError,
  AdminLoader,
  AdminFormModal,
  AdminDataTable,
  AdminRowActions,
  FormField,
  FormFieldInput,
  FormFieldTextarea,
  fieldClass,
  primaryButtonClass,
} from "../../admin-ui";

const emptyDraft = { name: "", description: "", icon: "", isActive: true, sortOrder: 0 };

const Categories = () => {
  const { categories, products, status, error, reload } = useCatalog();
  const { create, update, remove } = useCategoryMutations();
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const busy = create.isPending || update.isPending || remove.isPending;
  const { page, setPage, pageSize, totalPages, window: visibleCategories } =
    usePagination(categories);

  const productCountByCategory = new Map();
  for (const product of products) {
    const key = String(product.categoryId);
    productCountByCategory.set(key, (productCountByCategory.get(key) || 0) + 1);
  }

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setFormError(null);
    setFieldErrors(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setFormError(null);
    setFieldErrors(null);
    setIsFormOpen(true);
  };

  const openEdit = (category) => {
    setEditingId(category._id);
    setDraft({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
    });
    setFormError(null);
    setFieldErrors(null);
    setIsFormOpen(true);
  };

  // The mutations invalidate the catalogue, so a successful write needs no
  // explicit refetch here.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors(null);

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      icon: draft.icon.trim(),
      isActive: draft.isActive,
      sortOrder: draft.sortOrder,
    };

    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      closeForm();
      toastSuccess("Category saved");
    } catch (err) {
      setFormError(err.message);
      setFieldErrors(err.errors || null);
    }
  };

  const handleDelete = async (category) => {
    const inUse = productCountByCategory.get(String(category._id)) || 0;
    const warning =
      inUse > 0
        ? ` "${category.name}" is still used by ${inUse} product${inUse === 1 ? "" : "s"}. They will keep a dangling category reference. Continue?`
        : ` Delete "${category.name}"?`;

    const confirmed = await confirmDialog({
      title: warning,
      text: "This cannot be undone.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;

    setFormError(null);
    try {
      await remove.mutateAsync(category._id);
      if (editingId === category._id) resetForm();
      toastSuccess("Category deleted");
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (status === "loading") return <AdminLoader label="Loading categories..." />;

  const columns = [
    {
      key: "icon",
      render: (category) => {
        const Icon = iconForCategoryName(category.name);
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-100 text-secondary-900">
            <Icon className="h-4 w-4" />
          </span>
        );
      },
      className: "",
    },
    {
      key: "name",
      render: (category) => {
        const inUse = productCountByCategory.get(String(category._id)) || 0;
        return (
          <div className="min-w-0">
            <p className="truncate font-bold text-text">
              {category.name} <span className="text-base">{category.icon}</span>
            </p>
            <p className="truncate text-xs text-text-muted">
              {category.description || "No description"} · {inUse} product
              {inUse === 1 ? "" : "s"}
            </p>
          </div>
        );
      },
      className: "flex-1 min-w-0",
    },
    {
      key: "isActive",
      render: (category) => (
        <span className={category.isActive === false ? "text-primary-700" : "text-secondary-1000"}>
          {category.isActive === false ? "Hidden" : "Active"}
        </span>
      ),
      className: "w-24",
    },
    {
      key: "sortOrder",
      render: (category) => <span className="text-text-muted">{category.sortOrder || 0}</span>,
      className: "w-20 text-right",
    },
  ];

  const getRowKey = (category) => category._id;

  const rowActions = (category) => (
    <AdminRowActions
      onEdit={() => openEdit(category)}
      onDelete={() => handleDelete(category)}
      disabled={busy}
      editLabel="Edit"
      deleteLabel="Delete"
    />
  );

  const handlePageChange = (newPage) => setPage(newPage);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Catalogue</p>
        <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Categories</h1>
      </header>

      {error && <AdminError message={error.message} onRetry={reload} />}

      <AdminDataTable
        title="Categories"
        subtitle="Catalogue"
        items={visibleCategories}
        columns={columns}
        status={status}
        error={error}
        onReload={reload}
        emptyTitle="No categories yet"
        emptyMessage="Create the first one above."
        rowActions={rowActions}
        getRowKey={getRowKey}
        pagination={{ page, pageSize, total: categories.length, totalPages }}
        onPaginationChange={handlePageChange}
        headerActions={
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            <Plus className="h-4 w-4" /> New category
          </button>
        }
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit category" : "New category"}
        sizeClass="max-w-lg"
        busy={busy}
        onSubmit={handleSubmit}
        formError={formError}
        submitLabel={editingId ? "Save changes" : "Create category"}
      >
        <FormFieldInput
          label="Name"
          htmlFor="cat-name"
          required
          error={fieldErrors?.name}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          minLength={2}
          maxLength={100}
          className={fieldClass}
        />
        <FormFieldInput
          label="Icon or emoji"
          htmlFor="cat-icon"
          error={fieldErrors?.icon}
          value={draft.icon}
          onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
          maxLength={500}
          placeholder="🧱"
          className={fieldClass}
        />
        <FormFieldTextarea
          label="Description"
          htmlFor="cat-description"
          error={fieldErrors?.description}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          maxLength={500}
          className={fieldClass}
        />
        <FormFieldInput
          label="Sort order"
          htmlFor="cat-sort"
          error={fieldErrors?.sortOrder}
          type="number"
          min="0"
          step="1"
          value={draft.sortOrder}
          onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
          className={fieldClass}
        />
        <FormField label="Active" className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <input
              id="cat-active"
              type="checkbox"
              checked={draft.isActive !== false}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="cat-active" className="text-sm font-medium text-text">
              Active
            </label>
          </div>
        </FormField>
      </AdminFormModal>
    </div>
  );
};

export default Categories;