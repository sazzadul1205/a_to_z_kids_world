import { useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useCatalog } from "../../context/catalog/useCatalog";
import { useCategoryMutations } from "../../hooks/useAdminQueries";
import { iconForCategoryName } from "../../lib/presentation";
import {
  AdminEmpty,
  AdminError,
  AdminLoader,
  dangerButtonClass,
  fieldClass,
  ghostButtonClass,
  labelClass,
  primaryButtonClass,
} from "./admin-ui";

const emptyDraft = { name: "", description: "", icon: "" };

const CategoriesAdmin = () => {
  const { categories, products, status, error, reload } = useCatalog();
  const { create, update, remove } = useCategoryMutations();
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);

  const busy = create.isPending || update.isPending || remove.isPending;

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
    };

    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      resetForm();
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

    if (!window.confirm(warning)) return;

    setFormError(null);
    try {
      await remove.mutateAsync(category._id);
      if (editingId === category._id) resetForm();
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (status === "loading") return <AdminLoader label="Loading categories..." />;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Catalogue</p>
        <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Categories</h1>
      </header>

      {error && <AdminError message={error.message} onRetry={reload} />}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">
          {editingId ? "Edit category" : "New category"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className={labelClass}>Name</span>
            <input
              required
              minLength={2}
              maxLength={100}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={fieldClass}
            />
            {fieldErrors?.name && (
              <span className="mt-1 block text-xs font-semibold text-primary-700">
                {fieldErrors.name}
              </span>
            )}
          </label>

          <label className="block">
            <span className={labelClass}>Icon or emoji</span>
            <input
              maxLength={500}
              value={draft.icon}
              onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
              placeholder="🧱"
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Description</span>
            <input
              maxLength={500}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className={fieldClass}
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 lg:col-span-3">
            <button type="submit" disabled={busy} className={primaryButtonClass}>
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Save changes" : "Create category"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className={ghostButtonClass}>
                <X className="h-4 w-4" /> Cancel
              </button>
            )}
            {formError && (
              <p className="text-sm font-semibold text-primary-700">{formError}</p>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">
          All categories <span className="text-text-muted">({categories.length})</span>
        </h2>

        <div className="mt-4 space-y-3">
          {categories.length === 0 ? (
            <AdminEmpty title="No categories yet" message="Create the first one above." />
          ) : (
            categories.map((category) => {
              const Icon = iconForCategoryName(category.name);
              const inUse = productCountByCategory.get(String(category._id)) || 0;
              return (
                <div
                  key={category._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-soft px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-100 text-secondary-900">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text">
                        {category.name} <span className="text-base">{category.icon}</span>
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {category.description || "No description"} · {inUse} product
                        {inUse === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(category._id);
                        setDraft({
                          name: category.name,
                          description: category.description || "",
                          icon: category.icon || "",
                        });
                        setFormError(null);
                        setFieldErrors(null);
                      }}
                      className={ghostButtonClass}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(category)}
                      className={dangerButtonClass}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoriesAdmin;