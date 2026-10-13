import { useEffect, useState } from "react";
import { Printer, X, AlertTriangle } from "lucide-react";
import { templatesApi } from "../../lib/api";

const THERMAL_WIDTH = 320;

const FALLBACK_THERMAL_HTML = (sale) => `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt</title>
  <style>
    @media print {
      @page { margin: 0; size: 80mm auto; }
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4; width: 320px; margin: 0 auto; padding: 16px; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin: 4px 0; }
    .items { font-size: 11px; }
    .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
    .item-name { width: 65%; word-break: break-word; }
    .item-qty-price { width: 35%; text-align: right; }
  </style>
</head>
<body>
  <div class="center mb-3">
    <p class="bold text-[14px]">A to Z Kids World</p>
    <p class="text-[11px] text-gray-600">Dhaka, Bangladesh</p>
    <p class="text-[11px] text-gray-600">+880 1XXX XXXXXX</p>
  </div>
  <div class="line" />
  <div class="mb-3">
    <p class="text-[11px]"><span class="bold">Sale #:</span> ${sale.saleNumber || sale.id?.slice(-8).toUpperCase()}</p>
    <p class="text-[11px]"><span class="bold">Date:</span> ${new Date(sale.createdAt || sale.date).toLocaleString("en-GB", {day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
    <p class="text-[11px]"><span class="bold">Cashier:</span> ${sale.cashier || "POS User"}</p>
    ${sale.customerName ? `<p class="text-[11px]"><span class="bold">Customer:</span> ${sale.customerName}</p>` : ""}
    ${sale.customerPhone ? `<p class="text-[11px]"><span class="bold">Phone:</span> ${sale.customerPhone}</p>` : ""}
    ${sale.customerEmail ? `<p class="text-[11px]"><span class="bold">Email:</span> ${sale.customerEmail}</p>` : ""}
    ${sale.customerAddress ? `<p class="text-[11px]"><span class="bold">Address:</span> ${sale.customerAddress}</p>` : ""}
    <p class="text-[11px]"><span class="bold">Payment:</span> ${sale.paymentMethod || "Cash"}</p>
    ${sale.discount && sale.discount > 0 ? `<p class="text-[11px] text-red-600"><span class="bold">Discount:</span> -৳${sale.discount.toLocaleString("en-BD",{minimumFractionDigits:2})} ${sale.discountType === "percentage" ? `(${sale.discountValue}%)` : ""}</p>` : ""}
    ${sale.balance > 0 ? `<p class="text-[11px] text-accent-700"><span class="bold">Balance:</span> ৳${sale.balance.toLocaleString("en-BD",{minimumFractionDigits:2})}</p>` : ""}
  </div>
  <div class="line" />
  <div class="items mb-3">
    <div class="flex justify-between text-[11px] bold mb-1">
      <span class="item-name">Item</span>
      <span class="item-qty-price">Qty × Price</span>
    </div>
    ${sale.items?.map(item => `
      <div class="item-row">
        <span class="item-name text-[11px]">${item.name}</span>
        <span class="item-qty-price text-[11px]">${item.quantity} × ৳${item.price.toLocaleString("en-BD",{minimumFractionDigits:2})}</span>
      </div>
    `).join("") || ""}
  </div>
  <div class="line" />
  <div class="mb-2">
    <div class="row text-[12px]"><span>Subtotal</span><span class="bold">৳${(sale.subtotal || sale.total).toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>
    ${sale.discount && sale.discount > 0 ? `<div class="row text-[12px] text-red-600"><span>Discount ${sale.discountType === "percentage" ? `(${sale.discountValue}%)` : ""}</span><span class="bold">-৳${sale.discount.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
    ${sale.tax && sale.tax > 0 ? `<div class="row text-[12px]"><span>Tax</span><span class="bold">৳${sale.tax.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
    <div class="row text-[13px] bold mt-1"><span>TOTAL</span><span>৳${sale.total.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>
    ${sale.amountPaid && sale.amountPaid !== sale.total ? `<div class="row text-[12px] mt-1"><span>Paid</span><span class="bold">৳${sale.amountPaid.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
    ${sale.change && sale.change > 0 ? `<div class="row text-[12px] text-green-600"><span>Change</span><span class="bold">৳${sale.change.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
    ${sale.balance && sale.balance > 0 ? `<div class="row text-[12px] text-accent-700"><span>Balance (Due)</span><span class="bold">৳${sale.balance.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
    ${sale.debtRepayment && sale.debtRepayment > 0 ? `<div class="row text-[12px] text-green-700"><span>Debt Paid</span><span class="bold">-৳${sale.debtRepayment.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
  </div>
  <div class="line" />
  <div class="center text-[11px] text-gray-600 mt-3">
    <p class="bold">Thank you for shopping with us!</p>
    <p class="mt-1">Goods sold are not returnable</p>
    <p class="mt-1">without receipt within 7 days</p>
  </div>
  <div class="center mt-3 text-[10px] text-gray-500">
    <p>Powered by A to Z Kids World POS</p>
  </div>
</body>
</html>
`;

const FALLBACK_A4_HTML = (sale) => `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${sale.saleNumber || sale.id?.slice(-8).toUpperCase()}</title>
  <style>
    @media print {
      @page { margin: 20mm; size: A4; }
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    body { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 14px; line-height: 1.5; color: #1a1a1a; max-width: 210mm; margin: 0 auto; padding: 20mm; }
    .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 24px; }
    .company-name { font-size: 28px; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; }
    .company-info { font-size: 13px; color: #666; line-height: 1.6; }
    .sale-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; font-size: 13px; }
    .sale-info .label { font-weight: 600; color: #666; }
    .sale-info .value { font-weight: 500; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .items-table th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #1a1a1a; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .items-table td { padding: 10px 8px; border-bottom: 1px solid #eee; }
    .items-table tr:last-child td { border-bottom: 2px solid #1a1a1a; }
    .items-table .text-right { text-align: right; }
    .items-table .text-center { text-align: center; }
    .totals { width: 300px; margin-left: auto; font-size: 13px; }
    .totals .row { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals .row.total { font-size: 16px; font-weight: 800; border-top: 2px solid #1a1a1a; padding-top: 12px; margin-top: 8px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
    .footer .thank-you { font-weight: 700; font-size: 16px; color: #1a1a1a; margin-bottom: 8px; }
    .policy { font-size: 11px; color: #999; margin-top: 16px; }
  </style>
</head>
<body>
  <header class="header">
    <div class="company-name">A to Z Kids World</div>
    <div class="company-info">
      <p>Dhaka, Bangladesh</p>
      <p>Tel: +880 1XXX XXXXXX | Email: info@atozkidsworld.com</p>
    </div>
  </header>
  <div class="sale-info">
    <div>
      <p><span class="label">Sale Number:</span> <span class="value">${sale.saleNumber || sale.id?.slice(-8).toUpperCase()}</span></p>
      <p><span class="label">Date:</span> <span class="value">${new Date(sale.createdAt || sale.date).toLocaleString("en-GB", {day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}</span></p>
    </div>
    <div>
      <p><span class="label">Cashier:</span> <span class="value">${sale.cashier || "POS User"}</span></p>
      <p><span class="label">Payment Method:</span> <span class="value">${sale.paymentMethod || "Cash"}</span></p>
    </div>
    ${sale.customerName ? `
    <div>
      <p><span class="label">Customer:</span> <span class="value">${sale.customerName}</span></p>
      <p><span class="label">Phone:</span> <span class="value">${sale.customerPhone || "N/A"}</span></p>
      ${sale.customerEmail ? `<p><span class="label">Email:</span> <span class="value">${sale.customerEmail}</span></p>` : ""}
      ${sale.customerAddress ? `<p><span class="label">Address:</span> <span class="value">${sale.customerAddress}</span></p>` : ""}
    </div>` : ""}
  </div>
  <table class="items-table" role="table">
    <thead>
      <tr>
        <th style="width: 50%">Item</th>
        <th class="text-center" style="width: 12%">Qty</th>
        <th class="text-right" style="width: 18%">Unit Price</th>
        <th class="text-right" style="width: 20%">Total</th>
      </tr>
    </thead>
    <tbody>
      ${sale.items?.map(item => `
        <tr>
          <td>${item.name}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">৳${item.price.toLocaleString("en-BD",{minimumFractionDigits:2})}</td>
          <td class="text-right font-medium">৳${(item.price * item.quantity).toLocaleString("en-BD",{minimumFractionDigits:2})}</td>
        </tr>
      `).join("") || ""}
    </tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Subtotal</span><span>৳${(sale.subtotal || sale.total).toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>
    ${sale.discount && sale.discount > 0 ? `<div class="row text-red-600"><span>Discount ${sale.discountType === "percentage" ? `(${sale.discountValue}%)` : ""}</span><span>-৳${sale.discount.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
    ${sale.tax && sale.tax > 0 ? `<div class="row"><span>Tax</span><span>৳${sale.tax.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
    <div class="row total"><span>TOTAL</span><span>৳${sale.total.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>
    ${sale.amountPaid && sale.amountPaid !== sale.total ? `<div class="row"><span>Amount Paid</span><span>৳${sale.amountPaid.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
    ${sale.balance && sale.balance > 0 ? `<div class="row text-accent-600"><span>Balance (Due)</span><span class="font-bold">৳${sale.balance.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
    ${sale.debtRepayment && sale.debtRepayment > 0 ? `<div class="row text-green-600"><span>Debt Repayment</span><span class="font-bold">-৳${sale.debtRepayment.toLocaleString("en-BD",{minimumFractionDigits:2})}</span></div>` : ""}
  </div>
  <footer class="footer">
    <p class="thank-you">Thank you for shopping with us!</p>
    <p class="policy">Goods sold are not returnable without receipt within 7 days</p>
    <p class="policy mt-4">Powered by A to Z Kids World POS</p>
  </footer>
</body>
</html>
`;

function getTemplateType(format) {
  return format === "a4" ? "a4-standard" : "pos-thermal";
}

function getFallbackHtml(format, sale) {
  return format === "a4" ? FALLBACK_A4_HTML(sale) : FALLBACK_THERMAL_HTML(sale);
}

function printHtml(html, format) {
  const width = format === "a4" ? 800 : 400;
  const height = format === "a4" ? 1000 : 600;
  const printWindow = window.open("", "_blank", `width=${width},height=${height}`);
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.onafterprint = () => printWindow.close();
}

export function ReceiptModal({ sale, format = "thermal", onClose, onPrint }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const templateType = getTemplateType(format);
        const html = await templatesApi.getCompiled(templateType, sale);
        setHtml(html);
      } catch (err) {
        console.warn("Failed to fetch template from backend, using fallback:", err);
        setHtml(getFallbackHtml(format, sale));
        setError("Using fallback template (backend unavailable)");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();

    if (onPrint) {
      const timer = setTimeout(() => onPrint(), 100);
      return () => clearTimeout(timer);
    }
  }, [sale, format, onPrint]);

  const handlePrint = () => {
    if (html) {
      printHtml(html, format);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-90 bg-white shadow-2xl rounded-lg overflow-hidden p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading receipt template...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={format === "a4" ? "a4-receipt-title" : "thermal-receipt-title"}
    >
      <div
        className={format === "a4" 
          ? "w-full max-w-[210mm] bg-white shadow-2xl rounded-xl my-8" 
          : "w-full max-w-90 bg-white shadow-2xl rounded-lg overflow-hidden"
        }
        style={format !== "a4" ? { width: `${THERMAL_WIDTH}px` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 no-print ${format === "a4" ? "rounded-t-xl" : ""}`}>
          <h2 id={format === "a4" ? "a4-receipt-title" : "thermal-receipt-title"} className="font-bold text-gray-800">
            {format === "a4" ? "A4 Receipt" : "POS Thermal Receipt (80mm)"}
          </h2>
          <div className="flex items-center gap-2">
            {error && (
              <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-amber-800 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-3 w-3" />
                {error}
              </span>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className={format === "a4" ? "p-8 md:p-12" : "p-4"}
          style={{
            fontFamily: format === "a4" ? "'Segoe UI', system-ui, sans-serif" : "'Courier New', monospace",
            fontSize: format === "a4" ? "14px" : "12px",
            lineHeight: format === "a4" ? "1.5" : "1.4",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export function ReceiptButton({ sale, format = "thermal", children, className = "" }) {
  const [showReceipt, setShowReceipt] = useState(false);

  const handlePrint = () => {
    setShowReceipt(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePrint}
        className={`inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 ${className}`}
      >
        <Printer className="h-4 w-4" />
        {children || (format === "a4" ? "Print A4 Receipt" : "Print Thermal Receipt")}
      </button>
      {showReceipt && (
        <ReceiptModal
          sale={sale}
          format={format}
          onClose={() => setShowReceipt(false)}
          onPrint={() => {}}
        />
      )}
    </>
  );
}