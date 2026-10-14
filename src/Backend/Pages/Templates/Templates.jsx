import { useState, useEffect } from "react";
import { Save, Eye, X, Copy } from "lucide-react";
import { templatesApi } from "../../../Frontend/lib/api";
import { toastSuccess, toastError } from "../../../Frontend/lib/swal";
import {
  AdminError,
  AdminLoader,
  AdminHeader,
  AdminFormModal,
  AdminDataTable,
  AdminRowActions,
  FormFieldInput,
  FormFieldTextarea,
  fieldClass,
  primaryButtonClass,
  ghostButtonClass,
} from "../../admin-ui";

const TEMPLATE_TYPES = [
  { value: "pos-thermal", label: "POS Thermal (80mm)" },
  { value: "a4-standard", label: "A4 Standard" },
];

const templateLabel = (name) =>
  TEMPLATE_TYPES.find((type) => type.value === name)?.label || name;

const emptyDraft = {
  header_html: "",
  footer_html: "",
  body_template: "",
  css_styles: "",
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
      setTemplates(data.filter((template) =>
        TEMPLATE_TYPES.some((type) => type.value === template.name),
      ));
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

  const openEdit = (template) => {
    setEditingId(template._id);
    setDraft({
      header_html: template.header_html,
      footer_html: template.footer_html,
      body_template: template.body_template,
      css_styles: template.css_styles,
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
        header_html: draft.header_html,
        footer_html: draft.footer_html,
        css_styles: draft.css_styles,
      };

      await templatesApi.update(editingId, payload);
      toastSuccess("Template updated");
      closeForm();
      loadTemplates();
    } catch (err) {
      setFormError(err.message);
      setFieldErrors(err.errors || null);
    } finally {
      setBusy(false);
    }
  };

  const handlePreview = async () => {
    setBusy(true);
    try {
      const sampleData = getSampleData();
      const template = templates.find((item) => item._id === editingId);
      const html = await templatesApi.preview(template?.name, sampleData);
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
          <p className="truncate font-bold text-text">{templateLabel(t.name)}</p>
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
      disabled={busy}
      editLabel="Edit"
    />
  );

  return (
    <div className="space-y-8">
      <AdminHeader section="Settings" title="Receipt Formats" />

      {error && <AdminError message={error.message} onRetry={loadTemplates} />}

      <AdminDataTable
        title="Templates"
        items={templates}
        columns={columns}
        status={status}
        error={error}
        onReload={loadTemplates}
        emptyTitle="Receipt formats are not available"
        emptyMessage="The POS Machine and A4 receipt formats could not be loaded."
        rowActions={rowActions}
        getRowKey={getRowKey}
      />

      <AdminFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={`Edit ${templateLabel(templates.find((item) => item._id === editingId)?.name || "")}`}
        sizeClass="max-w-4xl"
        scrollable
        busy={busy}
        onSubmit={handleSubmit}
        formError={formError}
        submitLabel="Save Changes"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormFieldInput
            label="Receipt format"
            htmlFor="tpl-type"
            value={templateLabel(templates.find((item) => item._id === editingId)?.name || "")}
            readOnly
            className={fieldClass}
          />
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
          <h3 className="text-lg font-semibold text-text mb-3">Receipt fields (fixed)</h3>
          <FormFieldTextarea
            label="Body"
            htmlFor="tpl-body"
            error={fieldErrors?.body_template}
            value={draft.body_template}
            rows={10}
            className={`${fieldClass} font-mono text-sm`}
            readOnly
          />
          <p className="mt-1 text-xs text-text-muted">
            Each receipt has a fixed set of fields. The header, footer, and layout styling can be customized below.
          </p>
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
            {busy ? "Saving..." : "Save Changes"}
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