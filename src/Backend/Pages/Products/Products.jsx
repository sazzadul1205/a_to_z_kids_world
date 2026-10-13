import { useMemo, useRef, useState } from "react";
import { EyeOff, Eye, Plus, UploadCloud, PackagePlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { resolveImageUrl, uploadsApi } from "../../../Frontend/lib/api";
import { useCatalog } from "../../../Frontend/context/catalog/useCatalog";
import { useProductMutations } from "../../../Frontend/hooks/useAdminQueries";
import { formatBDT } from "../../../Frontend/lib/currency";
import { confirmDialog, toastError, toastSuccess } from "../../../Frontend/lib/swal";
import { usePagination } from "../../../Frontend/hooks/usePagination";
import {
  AdminError,
  AdminLoader,
  AdminFormModal,
  AdminDataTable,
  AdminSelectAll,
  AdminRowActions,
  ImageUploadZone,
  FormError,
  FormField,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
  fieldClass,
  ghostButtonClass,
  primaryButtonClass,
} from "../../admin-ui";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const emptyDraft = {
  name: "",
  description: "",
  price: "",
  buyPrice: "",
  stock: "",
  categoryId: "",
  image: "",
  age: "",
  includes: "",
  sku: "",
  isActive: true,
};

const fromProduct = (product) => ({
  name: product.name,
  description: product.description || "",
  price: String(product.price),
  buyPrice: String(product.buyPrice ?? ""),
  stock: String(product.stock),
  categoryId: String(product.categoryId || ""),
  image: product.rawImage || "",
  age: product.age || "",
  includes: product.includes || "",
  sku: product.sku || "",
  isActive: product.isActive !== false,
});

const Products = () => {
  const { products, categories, status, error, reload } = useCatalog();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [stockAdjustId, setStockAdjustId] = useState(null);
  const [stockAdjustQty, setStockAdjustQty] = useState("");
  const [stockAdjustReason, setStockAdjustReason] = useState("");
  const [stockAdjustError, setStockAdjustError] = useState(null);

  const {
    create,
    update,
    remove,
    toggleActive,
    bulkDelete,
    bulkSetFlag,
    adjustStock,
  } = useProductMutations();

  const upload = useMutation({ mutationFn: (file) => uploadsApi.image(file) });

  const busy =
    create.isPending ||
    update.isPending ||
    remove.isPending ||
    toggleActive.isPending ||
    bulkDelete.isPending ||
    bulkSetFlag.isPending ||
    adjustStock.isPending;
  const uploading = upload.isPending;

  const effectiveCategoryId =
    draft.categoryId || (categories.length > 0 ? String(categories[0]._id) : "");

  const orderedProducts = useMemo(
    () =>
      [...products].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [products],
  );

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

  const { page, setPage, pageSize, totalPages, window: visibleProducts } =
    usePagination(orderedProducts);

  const uploadFile = async (file) => {
    if (!file) return;

    setFormError(null);
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setFormError("Only JPEG, PNG, WebP, GIF or AVIF images can be uploaded.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Images must be 5 MB or smaller.");
      return;
    }

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
      sku: draft.sku.trim().toUpperCase(),
      price: Number(draft.price),
      buyPrice: Number(draft.buyPrice),
      stock: Number(draft.stock),
      categoryId: effectiveCategoryId,
      image: draft.image.trim(),
      details: {
        ...(draft.age.trim() ? { age: draft.age.trim() } : {}),
        ...(draft.includes.trim() ? { includes: draft.includes.trim() } : {}),
      },
      isActive: draft.isActive,
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

  const handleToggleActive = async (product) => {
    try {
      await toggleActive.mutateAsync(product._id);
      toastSuccess(
        product.isActive === false
          ? `${product.name} is now live in the shop.`
          : `${product.name} is hidden from the shop.`,
      );
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const confirmed = await confirmDialog({
      title: `Delete ${ids.length} product${ids.length === 1 ? "" : "s"}?`,
      text: "This cannot be undone.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await bulkDelete.mutateAsync(ids);
      setSelected(new Set());
      toastSuccess(`${ids.length} product${ids.length === 1 ? "" : "s"} deleted.`);
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleBulkActivate = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    try {
      await bulkSetFlag.mutateAsync({ ids, flag: "isActive", value: true });
      setSelected(new Set());
      toastSuccess(`${ids.length} product${ids.length === 1 ? "" : "s"} activated.`);
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const confirmed = await confirmDialog({
      title: `Hide ${ids.length} product${ids.length === 1 ? "" : "s"} from the shop?`,
      text: "They stay in the catalogue and can be reactivated later.",
      confirmText: "Hide",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await bulkSetFlag.mutateAsync({ ids, flag: "isActive", value: false });
      setSelected(new Set());
      toastSuccess(`${ids.length} product${ids.length === 1 ? "" : "s"} hidden.`);
    } catch (err) {
      toastError(err.message);
    }
  };

  const openStockAdjust = (product) => {
    setStockAdjustId(product._id);
    setStockAdjustQty("");
    setStockAdjustReason("");
    setStockAdjustError(null);
  };

  const handleStockAdjust = async (event) => {
    event.preventDefault();
    setStockAdjustError(null);

    const adjustment = Number(stockAdjustQty);
    if (!Number.isInteger(adjustment)) {
      setStockAdjustError("Adjustment must be a whole number");
      return;
    }
    if (!stockAdjustReason.trim()) {
      setStockAdjustError("Reason is required");
      return;
    }

    try {
      await adjustStock.mutateAsync({
        id: stockAdjustId,
        adjustment,
        reason: stockAdjustReason.trim(),
      });
      setStockAdjustId(null);
      setStockAdjustQty("");
      setStockAdjustReason("");
      toastSuccess("Stock adjusted successfully");
    } catch (err) {
      setStockAdjustError(err.message);
    }
  };

  if (status === "loading") return <AdminLoader label="Loading products..." />;

  const columns = [
    {
      key: "image",
      render: (product) => (
        <img
          src={product.image}
          alt=""
          className={`h-12 w-12 shrink-0 rounded-lg object-cover ${
            product.isActive === false ? "grayscale" : ""
          }`}
        />
      ),
      className: "",
    },
    {
      key: "name",
      render: (product) => (
        <div className="min-w-0">
          <p className="truncate font-bold text-text">
            {product.name}
            {product.isActive === false && (
              <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 align-middle text-xs font-bold uppercase tracking-wide text-primary-900">
                Hidden
              </span>
            )}
          </p>
          <p className="truncate text-xs text-text-muted">
            {product.category || "Uncategorised"} · {formatBDT(product.price)} ·{" "}
            <span className={product.stock <= 0 ? "font-bold text-primary-700" : ""}>
              {product.stock} in stock
            </span>
          </p>
          <p className="truncate text-xs text-text-muted">
            {product.isActive === false ? (
              <span className="text-primary-700">Hidden from shop</span>
            ) : (
              <span className="text-secondary-1000">Live in shop</span>
            )}
          </p>
        </div>
      ),
      className: "flex-1 min-w-0",
    },
  ];

  const getRowKey = (product) => product._id;

  const getRowClassName = (product) =>
    product.isActive === false ? "opacity-60" : "";

  const rowActions = (product) => (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <AdminRowActions
        onEdit={() => openEdit(product)}
        onDelete={() => handleDelete(product)}
        onToggle={handleToggleActive}
        toggleLabel={product.isActive === false ? "Activate product" : "Hide product"}
        toggleIcon={product.isActive === false ? Eye : EyeOff}
        disabled={busy}
        editLabel="Edit"
        deleteLabel="Delete"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => openStockAdjust(product)}
        className={ghostButtonClass}
      >
        <PackagePlus className="h-4 w-4" /> Stock
      </button>
    </div>
  );

  const handleSelectAll = () => {
    if (selected.size === orderedProducts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orderedProducts.map((p) => p._id)));
    }
  };

  const allSelected = orderedProducts.length > 0 && selected.size === orderedProducts.length;
  const someSelected = selected.size > 0 && selected.size < orderedProducts.length;

  const handlePageChange = (newPage) => setPage(newPage);
  const handlePageSizeChange = () => {
    setPage(1);
  };

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

      <AdminDataTable
        title="Products"
        subtitle="Catalogue"
        items={visibleProducts}
        columns={columns}
        status={status}
        error={error}
        onReload={reload}
        emptyTitle="No products yet"
        emptyMessage="Add the first discovery to the shop."
        selection={{ selected, onSelect: setSelected }}
        onSelectionChange={setSelected}
        bulkActions={{
          busy,
          onActivate: handleBulkActivate,
          onDeactivate: handleBulkDeactivate,
          onDelete: handleBulkDelete,
          activateLabel: "Activate",
          deactivateLabel: "Hide",
          deleteLabel: "Delete",
        }}
        rowActions={rowActions}
        getRowKey={getRowKey}
        getRowClassName={getRowClassName}
        pagination={{ page, pageSize, total: orderedProducts.length, totalPages }}
        onPaginationChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        headerActions={
          <AdminSelectAll
            checked={allSelected}
            indeterminate={someSelected}
            onChange={handleSelectAll}
          />
        }
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit product" : "New product"}
        sizeClass="max-w-3xl"
        scrollable
        busy={busy || uploading}
        onSubmit={handleSubmit}
        formError={formError}
        submitLabel={editingId ? "Save changes" : "Create product"}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormFieldInput
            label="Name"
            htmlFor="pf-name"
            required
            error={fieldErrors?.name}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            minLength={2}
            maxLength={150}
            className={fieldClass}
          />
          <FormFieldInput
            label="SKU"
            htmlFor="pf-sku"
            error={fieldErrors?.sku}
            value={draft.sku}
            onChange={(e) => setDraft({ ...draft, sku: e.target.value.toUpperCase() })}
            maxLength={50}
            placeholder="TOY-001"
            className={fieldClass}
          />
          <FormFieldInput
            label="Price (BDT)"
            htmlFor="pf-price"
            required
            error={fieldErrors?.price}
            type="number"
            min="0"
            step="0.01"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            className={fieldClass}
          />
          <FormFieldInput
            label="Buy Price (BDT)"
            htmlFor="pf-buyPrice"
            error={fieldErrors?.buyPrice}
            type="number"
            min="0"
            step="0.01"
            value={draft.buyPrice}
            onChange={(e) => setDraft({ ...draft, buyPrice: e.target.value })}
            className={fieldClass}
          />
          <FormFieldInput
            label="Stock"
            htmlFor="pf-stock"
            required
            error={fieldErrors?.stock}
            type="number"
            min="0"
            step="1"
            value={draft.stock}
            onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
            className={fieldClass}
          />
          <FormFieldSelect
            label="Category"
            htmlFor="pf-categoryId"
            required
            error={fieldErrors?.categoryId}
            value={effectiveCategoryId}
            onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
            className={fieldClass}
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </FormFieldSelect>
          <FormFieldInput
            label="Age range"
            htmlFor="pf-age"
            error={fieldErrors?.age}
            maxLength={100}
            value={draft.age}
            onChange={(e) => setDraft({ ...draft, age: e.target.value })}
            placeholder="Ages 4–8"
            className={fieldClass}
          />
          <FormFieldInput
            label="What's in the box"
            htmlFor="pf-includes"
            error={fieldErrors?.includes}
            maxLength={200}
            value={draft.includes}
            onChange={(e) => setDraft({ ...draft, includes: e.target.value })}
            placeholder="42 colourful wooden pieces"
            className={fieldClass}
          />
          <FormFieldTextarea
            label="Description"
            htmlFor="pf-description"
            className="sm:col-span-2"
            error={fieldErrors?.description}
            rows={3}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className={fieldClass}
          />
          <FormField label="Image" className="sm:col-span-2">
            <ImageUploadZone
              value={draft.image}
              onUpload={uploadFile}
              uploading={uploading}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              fileInputRef={fileInputRef}
              acceptedTypes={ACCEPTED_IMAGE_TYPES}
              previewUrl={draft.image ? resolveImageUrl(draft.image) : null}
              onClear={() => setDraft({ ...draft, image: "" })}
              label="Image"
              placeholder="Drag an image here, or click to upload"
            />
            <span className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
              <UploadCloud className="h-3.5 w-3.5 shrink-0" />
              Drag an image onto the box above, or use the picker. JPEG, PNG,
              WebP, GIF or AVIF up to 5 MB. Uploads are converted to WebP.
            </span>
          </FormField>
          <FormField label="Active" className="sm:col-span-2">
            <div className="flex items-center gap-3">
              <input
                id="pf-active"
                type="checkbox"
                checked={draft.isActive !== false}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="pf-active" className="text-sm font-medium text-text">
                Active
              </label>
            </div>
          </FormField>
        </div>
      </AdminFormModal>

      {stockAdjustId && (
        <AdminFormModal
          isOpen={true}
          onClose={() => setStockAdjustId(null)}
          title="Adjust Stock"
          sizeClass="max-w-md"
          busy={adjustStock.isPending}
          onSubmit={handleStockAdjust}
          submitLabel="Apply Adjustment"
        >
          <p className="text-sm text-text-muted">
            Adjust stock level for the selected product. Use positive numbers to add stock,
            negative numbers to remove stock (e.g., damaged goods).
          </p>
          <FormFieldInput
            label="Adjustment (units)"
            htmlFor="stock-adjust-qty"
            required
            type="number"
            step="1"
            value={stockAdjustQty}
            onChange={(e) => setStockAdjustQty(e.target.value)}
            placeholder="+5 or -2"
            className={fieldClass}
          />
          <FormFieldInput
            label="Reason"
            htmlFor="stock-adjust-reason"
            required
            maxLength={200}
            value={stockAdjustReason}
            onChange={(e) => setStockAdjustReason(e.target.value)}
            placeholder="Stock take, damaged goods, supplier return, etc."
            className={fieldClass}
          />
          {stockAdjustError && <FormError message={stockAdjustError} />}
        </AdminFormModal>
      )}
    </div>
  );
};

export default Products;