import { useState, useEffect } from "react";
import { Save, Eye, Plus, X, Copy } from "lucide-react";
import { templatesApi } from "../../../Frontend/lib/api";
import { confirmDialog, toastSuccess, toastError } from "../../../Frontend/lib/swal";
import {
  AdminError,
  AdminLoader,
  AdminHeader,
  AdminFormModal,
  AdminDataTable,
  AdminRowActions,
  FormField,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
  fieldClass,
  primaryButtonClass,
  ghostButtonClass,
} from "../../admin-ui";

const TEMPLATE_TYPES = [
  { value: "pos-thermal", label: "POS Thermal (80mm)" },
  { value: "a4-standard", label: "A4 Standard" },
];

const emptyDraft = {
  name: "",
  header_html: "",
  footer_html: "",
  body_template: "",
  css_styles: "",
  is_active: true,
};

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [busy, setBusy] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadTemplates = async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await templatesApi.list();
      setTemplates(data);
      setStatus("idle");
    } catch (err) {
      setError(err);
      setStatus("error");
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadTemplates();
    }, 0);
  }, []);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setFormError(null);
    setFieldErrors(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setFormError(null);
    setFieldErrors(null);
    setIsFormOpen(true);
  };

  const openEdit = (template) => {
    setEditingId(template._id);
    setDraft({
      name: template.name,
      header_html: template.header_html,
      footer_html: template.footer_html,
      body_template: template.body_template,
      css_styles: template.css_styles,
      is_active: template.is_active,
    });
    setFormError(null);
    setFieldErrors(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors(null);
    setBusy(true);

    try {
      const payload = {
        name: draft.name,
        header_html: draft.header_html,
        footer_html: draft.footer_html,
        body_template: draft.body_template,
        css_styles: draft.css_styles,
        is_active: draft.is_active,
      };

      if (editingId) {
        await templatesApi.update(editingId, payload);
        toastSuccess("Template updated");
      } else {
        await templatesApi.create(payload);
        toastSuccess("Template created");
      }
      closeForm();
      loadTemplates();
    } catch (err) {
      setFormError(err.message);
      setFieldErrors(err.errors || null);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (template) => {
    const confirmed = await confirmDialog({
      title: `Delete "${template.name}"?`,
      text: "This cannot be undone.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await templatesApi.remove(template._id);
      toastSuccess("Template deleted");
      loadTemplates();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handlePreview = async () => {
    setBusy(true);
    try {
      const sampleData = getSampleData();
      const html = await templatesApi.preview(draft.name, sampleData);
      setPreviewHtml(html);
      setPreviewOpen(true);
    } catch (err) {
      toastError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading") return <AdminLoader label="Loading templates..." />;

  const columns = [
    {
      key: "name",
      render: (t) => (
        <div className="min-w-0">
          <p className="truncate font-bold text-text">{t.name}</p>
          <p className="truncate text-xs text-text-muted">
            v{t.version} · {t.is_active ? "Active" : "Inactive"}
          </p>
        </div>
      ),
      className: "flex-1 min-w-0",
    },
    {
      key: "updated_at",
      render: (t) => (
        <span className="text-xs text-text-muted">
          {t.updated_at ? new Date(t.updated_at).toLocaleString() : "—"}
        </span>
      ),
      className: "w-48",
    },
  ];

  const getRowKey = (t) => t._id;

  const rowActions = (t) => (
    <AdminRowActions
      onEdit={() => openEdit(t)}
      onDelete={() => handleDelete(t)}
      disabled={busy}
      editLabel="Edit"
      deleteLabel="Delete"
    />
  );

  return (
    <div className="space-y-8">
      <AdminHeader section="Settings" title="Receipt Templates">
        <button onClick={openCreate} className={primaryButtonClass}>
          <Plus className="h-4 w-4" /> New template
        </button>
      </AdminHeader>

      {error && <AdminError message={error.message} onRetry={loadTemplates} />}

      <AdminDataTable
        title="Templates"
        items={templates}
        columns={columns}
        status={status}
        error={error}
        onReload={loadTemplates}
        emptyTitle="No templates yet"
        emptyMessage="Create your first receipt template above."
        rowActions={rowActions}
        getRowKey={getRowKey}
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? "Edit Template" : "New Template"}
        sizeClass="max-w-4xl"
        scrollable
        busy={busy}
        onSubmit={handleSubmit}
        formError={formError}
        submitLabel={editingId ? "Save Changes" : "Create Template"}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormFieldInput
            label="Template Name (ID)"
            htmlFor="tpl-name"
            required
            error={fieldErrors?.name}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            disabled={editingId}
            placeholder="e.g. pos-thermal, a4-standard"
            className={fieldClass}
          />
          <FormFieldSelect
            label="Type"
            htmlFor="tpl-type"
            error={fieldErrors?.name}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className={fieldClass}
          >
            {TEMPLATE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </FormFieldSelect>
          <FormField label="Active" className="sm:col-span-2">
            <div className="flex items-center gap-3">
              <input
                id="tpl-active"
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="tpl-active" className="text-sm font-medium text-text">
                Active
              </label>
            </div>
          </FormField>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-text mb-3">Header HTML</h3>
          <FormFieldTextarea
            label="Header"
            htmlFor="tpl-header"
            error={fieldErrors?.header_html}
            value={draft.header_html}
            onChange={(e) => setDraft({ ...draft, header_html: e.target.value })}
            rows={8}
            placeholder="Header HTML (e.g., logo, company name, address)"
            className={`${fieldClass} font-mono text-sm`}
          />
          <p className="mt-1 text-xs text-text-muted">
            Available variables: &#123;&#123;companyName&#125;&#125;, &#123;&#123;companyAddress&#125;&#125;, &#123;&#123;companyPhone&#125;&#125;, &#123;&#123;companyEmail&#125;&#125;
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-text mb-3">Footer HTML</h3>
          <FormFieldTextarea
            label="Footer"
            htmlFor="tpl-footer"
            error={fieldErrors?.footer_html}
            value={draft.footer_html}
            onChange={(e) => setDraft({ ...draft, footer_html: e.target.value })}
            rows={6}
            placeholder="Footer HTML (e.g., thank you message, policies)"
            className={`${fieldClass} font-mono text-sm`}
          />
          <p className="mt-1 text-xs text-text-muted">
            Available variables: Same as header
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-text mb-3">Body Template (Fixed - Developer Only)</h3>
          <FormFieldTextarea
            label="Body"
            htmlFor="tpl-body"
            error={fieldErrors?.body_template}
            value={draft.body_template}
            onChange={(e) => setDraft({ ...draft, body_template: e.target.value })}
            rows={10}
            placeholder="Body template with Handlebars expressions"
            className={`${fieldClass} font-mono text-sm`}
            readOnly={!editingId}
          />
          {!editingId && (
            <p className="mt-1 text-xs text-text-muted">
              Body template cannot be modified via API. Create a new template variant instead.
            </p>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-text mb-3">CSS Styles</h3>
          <FormFieldTextarea
            label="Styles"
            htmlFor="tpl-css"
            error={fieldErrors?.css_styles}
            value={draft.css_styles}
            onChange={(e) => setDraft({ ...draft, css_styles: e.target.value })}
            rows={12}
            placeholder="CSS styles for the receipt"
            className={`${fieldClass} font-mono text-sm`}
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button type="button" onClick={handlePreview} disabled={busy} className={ghostButtonClass}>
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            <Save className="h-4 w-4" />
            {busy ? "Saving..." : (editingId ? "Save Changes" : "Create Template")}
          </button>
          <button type="button" onClick={closeForm} className={ghostButtonClass}>
            Cancel
          </button>
        </div>
      </AdminFormModal>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-black text-text">Preview</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => navigator.clipboard.writeText(previewHtml)} className={ghostButtonClass}>
                  <Copy className="h-4 w-4" /> Copy HTML
                </button>
                <button onClick={() => setPreviewOpen(false)} className={ghostButtonClass}>
                  <X className="h-4 w-4" /> Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto border rounded-lg">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-[70vh] border-0"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getSampleData() {
  return {
    saleNumber: "POS-20261013-001",
    id: "abc12345",
    createdAt: new Date().toISOString(),
    cashier: "John Doe",
    customerName: "Jane Smith",
    customerPhone: "+880 1712 345678",
    customerEmail: "jane@example.com",
    customerAddress: "123 Main St, Dhaka",
    paymentMethod: "Cash",
    items: [
      { name: "LEGO Classic Brick Set", quantity: 2, price: 1500 },
      { name: "Barbie Dreamhouse", quantity: 1, price: 8500 },
      { name: "Hot Wheels 10-Pack", quantity: 3, price: 450 },
    ],
    subtotal: 13350,
    discount: 1000,
    discountType: "fixed",
    discountValue: 1000,
    tax: 0,
    total: 12350,
    amountPaid: 12350,
    change: 0,
    balance: 0,
    debtRepayment: 0,
  };
}

export default Templates;