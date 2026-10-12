import { Loader2, Save, ImagePlus } from "lucide-react";
import { resolveImageUrl } from "../../../Frontend/lib/api";
import {
  AdminDialog,
  FormError,
  FormField,
  fieldClass,
  primaryButtonClass,
  ghostButtonClass,
} from "../../admin-ui";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const ProductFormModal = ({
  isOpen,
  onClose,
  editingId,
  draft,
  setDraft,
  fieldErrors,
  formError,
  busy,
  uploading,
  isDragging,
  setIsDragging,
  fileInputRef,
  categories,
  effectiveCategoryId,
  uploadFile,
  handleSubmit,
}) => {
  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? "Edit product" : "New product"}
      sizeClass="max-w-3xl"
      scrollable
    >
      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {formError && <FormError message={formError} className="sm:col-span-2" />}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Name" htmlFor="pf-name" required error={fieldErrors?.name}>
            <input
              id="pf-name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={fieldClass}
            />
          </FormField>

          <FormField label="SKU" htmlFor="pf-sku" error={fieldErrors?.sku}>
            <input
              id="pf-sku"
              maxLength={50}
              value={draft.sku}
              onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
              className={fieldClass}
            />
          </FormField>

          <FormField label="Price (BDT)" htmlFor="pf-price" required error={fieldErrors?.price}>
            <input
              id="pf-price"
              type="number"
              min="0"
              step="0.01"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              className={fieldClass}
              required
            />
          </FormField>

          <FormField label="Buy Price (BDT)" htmlFor="pf-buyPrice" error={fieldErrors?.buyPrice}>
            <input
              id="pf-buyPrice"
              type="number"
              min="0"
              step="0.01"
              value={draft.buyPrice}
              onChange={(e) => setDraft({ ...draft, buyPrice: e.target.value })}
              className={fieldClass}
            />
          </FormField>

          <FormField label="Stock" htmlFor="pf-stock" required error={fieldErrors?.stock}>
            <input
              id="pf-stock"
              type="number"
              min="0"
              value={draft.stock}
              onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
              className={fieldClass}
              required
            />
          </FormField>

          <FormField label="Category" htmlFor="pf-categoryId" error={fieldErrors?.categoryId}>
            <select
              id="pf-categoryId"
              value={draft.categoryId}
              onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
              className={fieldClass}
            >
              <option value={effectiveCategoryId}>Default</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Age" htmlFor="pf-age" error={fieldErrors?.age}>
            <input
              id="pf-age"
              maxLength={50}
              value={draft.age}
              onChange={(e) => setDraft({ ...draft, age: e.target.value })}
              placeholder='e.g. "3+" or "6 months - 3 years"'
              className={fieldClass}
            />
          </FormField>

          <FormField label="Includes" htmlFor="pf-includes" error={fieldErrors?.includes}>
            <input
              id="pf-includes"
              maxLength={200}
              value={draft.includes}
              onChange={(e) => setDraft({ ...draft, includes: e.target.value })}
              className={fieldClass}
            />
          </FormField>

          <FormField label="Description" htmlFor="pf-description" className="sm:col-span-2" error={fieldErrors?.description}>
            <textarea
              id="pf-description"
              rows={3}
              maxLength={1000}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className={fieldClass}
            />
          </FormField>

          <FormField label="Image" htmlFor="pf-image" className="sm:col-span-2">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                uploadFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex min-h-[80px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-soft p-4 text-center transition ${isDragging ? "border-primary-400 bg-primary-50" : ""}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={(e) => uploadFile(e.target.files?.[0])}
                className="hidden"
                id="pf-image-input"
              />
              <label htmlFor="pf-image-input" className="flex cursor-pointer flex-col items-center gap-2">
                {draft.image ? (
                  <img
                    src={resolveImageUrl(draft.image)}
                    alt={draft.name || "product"}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <ImagePlus className="h-8 w-8 text-text-muted" />
                )}
                <span className="text-xs text-text-muted">
                  {uploading ? "Uploading..." : "Click or drop to upload"}
                </span>
              </label>
            </div>
            {draft.image && (
              <button
                type="button"
                onClick={() => setDraft({ ...draft, image: "" })}
                className={ghostButtonClass}
              >
                Clear
              </button>
            )}
          </FormField>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <input
            id="pf-active"
            type="checkbox"
            checked={draft.isActive !== false}
            onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          <label htmlFor="pf-active" className="text-sm font-medium text-text">
            Active
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={ghostButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editingId ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
};

export default ProductFormModal;
