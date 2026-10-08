import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { resolveImageUrl, uploadsApi } from "../../lib/api";
import { useCatalog } from "../../context/catalog/useCatalog";
import { useProductMutations } from "../../hooks/useAdminQueries";
import { formatBDT } from "../../lib/currency";
import { confirmDialog } from "../../lib/swal";
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

const emptyDraft = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  image: "",
  age: "",
  includes: "",
};

const fromProduct = (product) => ({
  name: product.name,
  description: product.description || "",
  price: String(product.price),
  stock: String(product.stock),
  categoryId: String(product.categoryId || ""),
  image: product.rawImage || "",
  age: product.age || "",
  includes: product.includes || "",
});

const ProductsAdmin = () => {
  const { products, categories, status, error, reload } = useCatalog();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const fileInputRef = useRef(null);

  const { create, update, remove } = useProductMutations();

  // Uploading does not touch the catalogue, so it invalidates nothing; it only
  // needs to report whether it is in flight.
  const upload = useMutation({ mutationFn: (file) => uploadsApi.image(file) });

  const busy = create.isPending || update.isPending || remove.isPending;
  const uploading = upload.isPending;

  // The backend requires a categoryId, so fall back to the first one rather
  // than waiting for the draft to be filled in.
  const effectiveCategoryId =
    draft.categoryId || (categories.length > 0 ? String(categories[0]._id) : "");

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setFormError(null);
    setFieldErrors(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft({
      ...emptyDraft,
      categoryId: categories.length > 0 ? String(categories[0]._id) : "",
    });
    setFormError(null);
    setFieldErrors(null);
    setIsFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setDraft(fromProduct(product));
    setFormError(null);
    setFieldErrors(null);
    setIsFormOpen(true);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setFormError(null);
    try {
      const result = await upload.mutateAsync(file);
      setDraft((current) => ({ ...current, image: result.url }));
    } catch (err) {
      setFormError(`Upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors(null);

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      stock: Number(draft.stock),
      categoryId: effectiveCategoryId,
      image: draft.image.trim(),
      details: {
        ...(draft.age.trim() ? { age: draft.age.trim() } : {}),
        ...(draft.includes.trim() ? { includes: draft.includes.trim() } : {}),
      },
    };

    try {
      if (editingId) await update.mutateAsync({ id: editingId, ...payload });
      else await create.mutateAsync(payload);
      closeForm();
    } catch (err) {
      setFormError(err.message);
      setFieldErrors(err.errors || null);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = await confirmDialog({
      title: `Delete "${product.name}"?`,
      text: "This cannot be undone.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await remove.mutateAsync(product._id);
      if (editingId === product._id) closeForm();
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (status === "loading") return <AdminLoader label="Loading products..." />;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Catalogue</p>
          <h1 className="mt-1 text-3xl font-black text-text sm:text-4xl">Products</h1>
        </div>
        <button type="button" onClick={openCreate} disabled={categories.length === 0} className={primaryButtonClass}>
          <Plus className="h-4 w-4" /> New product
        </button>
      </header>

      {error && <AdminError message={error.message} onRetry={reload} />}
      {categories.length === 0 && (
        <p className="rounded-2xl border border-accent-300 bg-accent-50 px-5 py-4 text-sm font-semibold text-accent-900">
          Create a category first — every product must belong to one.
        </p>
      )}
      {formError && !isFormOpen && (
        <p className="rounded-2xl border border-primary-300 bg-primary-50 px-5 py-4 text-sm font-semibold text-primary-900">
          {formError}
        </p>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-black text-text">
          All products <span className="text-text-muted">({products.length})</span>
        </h2>

        <div className="mt-4 space-y-3">
          {products.length === 0 ? (
            <AdminEmpty title="No products yet" message="Add the first discovery to the shop." />
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={product.image}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text">{product.name}</p>
                    <p className="truncate text-xs text-text-muted">
                      {product.category || "Uncategorised"} · {formatBDT(product.price)} ·{" "}
                      <span className={product.stock <= 0 ? "font-bold text-primary-700" : ""}>
                        {product.stock} in stock
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => openEdit(product)} className={ghostButtonClass}>
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(product)}
                    className={dangerButtonClass}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-text">
                {editingId ? "Edit product" : "New product"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                className="rounded-full p-2 text-text-muted transition hover:bg-primary-50 hover:text-primary-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={labelClass}>Name</span>
                <input
                  required
                  minLength={2}
                  maxLength={150}
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

              <label className="block sm:col-span-2">
                <span className={labelClass}>Description</span>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>Price (BDT)</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  className={fieldClass}
                />
                {fieldErrors?.price && (
                  <span className="mt-1 block text-xs font-semibold text-primary-700">
                    {fieldErrors.price}
                  </span>
                )}
              </label>

              <label className="block">
                <span className={labelClass}>Stock</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={draft.stock}
                  onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                  className={fieldClass}
                />
                {fieldErrors?.stock && (
                  <span className="mt-1 block text-xs font-semibold text-primary-700">
                    {fieldErrors.stock}
                  </span>
                )}
              </label>

              <label className="block">
                <span className={labelClass}>Category</span>
                <select
                  required
                  value={effectiveCategoryId}
                  onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                  className={fieldClass}
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Age range</span>
                <input
                  maxLength={100}
                  value={draft.age}
                  onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                  placeholder="Ages 4–8"
                  className={fieldClass}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className={labelClass}>What's in the box</span>
                <input
                  maxLength={200}
                  value={draft.includes}
                  onChange={(e) => setDraft({ ...draft, includes: e.target.value })}
                  placeholder="42 colourful wooden pieces"
                  className={fieldClass}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className={labelClass}>Image</span>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    value={draft.image}
                    onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                    placeholder="/uploads/your-image.webp or https://..."
                    className={`${fieldClass} min-w-48 flex-1`}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={ghostButtonClass}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
                <span className="mt-1 block text-xs text-text-muted">
                  JPEG, PNG, WebP, GIF or AVIF up to 5 MB. Uploads are converted to WebP.
                </span>
              </label>

              {draft.image && (
                <img
                  src={resolveImageUrl(draft.image)}
                  alt=""
                  className="h-32 w-full rounded-xl object-cover sm:col-span-2"
                />
              )}

              {formError && (
                <p className="rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-900 sm:col-span-2">
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button type="submit" disabled={busy || uploading} className={primaryButtonClass}>
                  <Save className="h-4 w-4" />
                  {editingId ? "Save changes" : "Create product"}
                </button>
                <button type="button" onClick={closeForm} className={ghostButtonClass}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;