import { useEffect, useRef } from "react";
import { Printer, X } from "lucide-react";
import { formatBDT } from "../../lib/currency";

const THERMAL_WIDTH = 320;

export function ThermalReceipt({ sale, onClose, onPrint }) {
  const receiptRef = useRef(null);

  useEffect(() => {
    if (onPrint) {
      setTimeout(() => onPrint(), 100);
    }
  }, [onPrint]);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank", "width=400,height=600");
      printWindow.document.write(`
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
          ${receiptRef.current.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }
  };

  const companyName = "A to Z Kids World";
  const companyAddress = "Dhaka, Bangladesh";
  const companyPhone = "+880 1XXX XXXXXX";

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      ref={receiptRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="thermal-receipt-title"
    >
      <div
        className="w-full max-w-[360px] bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{ width: `${THERMAL_WIDTH}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 no-print">
          <h2 id="thermal-receipt-title" className="font-bold text-gray-800 text-sm">
            POS Thermal Receipt (80mm)
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
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

        <div className="p-4" style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", lineHeight: "1.4" }}>
          <div className="center mb-3">
            <p className="bold text-[14px]">{companyName}</p>
            <p className="text-[11px] text-gray-600">{companyAddress}</p>
            <p className="text-[11px] text-gray-600">{companyPhone}</p>
          </div>

          <div className="line" />

          <div className="mb-3">
            <p className="text-[11px]"><span className="bold">Sale #:</span> {sale.saleNumber || sale.id?.slice(-8).toUpperCase()}</p>
            <p className="text-[11px]"><span className="bold">Date:</span> {formatDate(sale.createdAt || sale.date)}</p>
            <p className="text-[11px]"><span className="bold">Cashier:</span> {sale.cashier || "POS User"}</p>
            {sale.customerName && (
              <p className="text-[11px]"><span className="bold">Customer:</span> {sale.customerName}</p>
            )}
            {sale.customerPhone && (
              <p className="text-[11px]"><span className="bold">Phone:</span> {sale.customerPhone}</p>
            )}
            <p className="text-[11px]"><span className="bold">Payment:</span> {sale.paymentMethod || "Cash"}</p>
          </div>

          <div className="line" />

          <div className="items mb-3">
            <div className="flex justify-between text-[11px] bold mb-1">
              <span className="item-name">Item</span>
              <span className="item-qty-price">Qty × Price</span>
            </div>
            {sale.items?.map((item, index) => (
              <div key={index} className="item-row">
                <span className="item-name text-[11px]">{item.name}</span>
                <span className="item-qty-price text-[11px]">
                  {item.quantity} × {formatBDT(item.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="line" />

          <div className="mb-2">
            <div className="row text-[12px]">
              <span>Subtotal</span>
              <span className="bold">{formatBDT(sale.subtotal || sale.total)}</span>
            </div>
            {sale.discount && sale.discount > 0 && (
              <div className="row text-[12px] text-red-600">
                <span>Discount</span>
                <span className="bold">-{formatBDT(sale.discount)}</span>
              </div>
            )}
            {sale.tax && sale.tax > 0 && (
              <div className="row text-[12px]">
                <span>Tax</span>
                <span className="bold">{formatBDT(sale.tax)}</span>
              </div>
            )}
            <div className="row text-[13px] bold mt-1">
              <span>TOTAL</span>
              <span>{formatBDT(sale.total)}</span>
            </div>
            {sale.amountPaid && sale.amountPaid !== sale.total && (
              <div className="row text-[12px] mt-1">
                <span>Paid</span>
                <span className="bold">{formatBDT(sale.amountPaid)}</span>
              </div>
            )}
            {sale.change && sale.change > 0 && (
              <div className="row text-[12px] text-green-600">
                <span>Change</span>
                <span className="bold">{formatBDT(sale.change)}</span>
              </div>
            )}
          </div>

          <div className="line" />

          <div className="center text-[11px] text-gray-600 mt-3">
            <p className="bold">Thank you for shopping with us!</p>
            <p className="mt-1">Goods sold are not returnable</p>
            <p className="mt-1">without receipt within 7 days</p>
          </div>

          <div className="center mt-3 text-[10px] text-gray-500">
            <p>Powered by A to Z Kids World POS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function A4Receipt({ sale, onClose, onPrint }) {
  const receiptRef = useRef(null);

  useEffect(() => {
    if (onPrint) {
      setTimeout(() => onPrint(), 100);
    }
  }, [onPrint]);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank", "width=800,height=1000");
      printWindow.document.write(`
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
          ${receiptRef.current.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }
  };

  const companyName = "A to Z Kids World";
  const companyAddress = "Dhaka, Bangladesh";
  const companyPhone = "+880 1XXX XXXXXX";
  const companyEmail = "info@atozkidsworld.com";

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      ref={receiptRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="a4-receipt-title"
    >
      <div
        className="w-full max-w-[210mm] bg-white shadow-2xl rounded-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 no-print rounded-t-xl">
          <h2 id="a4-receipt-title" className="font-bold text-gray-800">
            A4 Receipt
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-8 md:p-12" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <header className="header">
            <div className="company-name">{companyName}</div>
            <div className="company-info">
              <p>{companyAddress}</p>
              <p>Tel: {companyPhone} | Email: {companyEmail}</p>
            </div>
          </header>

          <div className="sale-info">
            <div>
              <p><span className="label">Sale Number:</span> <span className="value">{sale.saleNumber || sale.id?.slice(-8).toUpperCase()}</span></p>
              <p><span className="label">Date:</span> <span className="value">{formatDate(sale.createdAt || sale.date)}</span></p>
            </div>
            <div>
              <p><span className="label">Cashier:</span> <span className="value">{sale.cashier || "POS User"}</span></p>
              <p><span className="label">Payment Method:</span> <span className="value">{sale.paymentMethod || "Cash"}</span></p>
            </div>
            {sale.customerName && (
              <div>
                <p><span className="label">Customer:</span> <span className="value">{sale.customerName}</span></p>
                <p><span className="label">Phone:</span> <span className="value">{sale.customerPhone || "N/A"}</span></p>
              </div>
            )}
          </div>

          <table className="items-table" role="table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Item</th>
                <th className="text-center" style={{ width: "12%" }}>Qty</th>
                <th className="text-right" style={{ width: "18%" }}>Unit Price</th>
                <th className="text-right" style={{ width: "20%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">{formatBDT(item.price)}</td>
                  <td className="text-right font-medium">{formatBDT(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div className="row">
              <span>Subtotal</span>
              <span>{formatBDT(sale.subtotal || sale.total)}</span>
            </div>
            {sale.discount && sale.discount > 0 && (
              <div className="row text-red-600">
                <span>Discount</span>
                <span>-{formatBDT(sale.discount)}</span>
              </div>
            )}
            {sale.tax && sale.tax > 0 && (
              <div className="row">
                <span>Tax</span>
                <span>{formatBDT(sale.tax)}</span>
              </div>
            )}
            <div className="row total">
              <span>TOTAL</span>
              <span>{formatBDT(sale.total)}</span>
            </div>
            {sale.amountPaid && sale.amountPaid !== sale.total && (
              <div className="row">
                <span>Amount Paid</span>
                <span>{formatBDT(sale.amountPaid)}</span>
              </div>
            )}
            {sale.change && sale.change > 0 && (
              <div className="row text-green-600">
                <span>Change</span>
                <span>{formatBDT(sale.change)}</span>
              </div>
            )}
          </div>

          <footer className="footer">
            <p className="thank-you">Thank you for shopping with us!</p>
            <p className="policy">Goods sold are not returnable without receipt within 7 days</p>
            <p className="policy mt-4">Powered by A to Z Kids World POS</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function ReceiptModal({ sale, format = "thermal", onClose, onPrint }) {
  if (format === "a4") {
    return <A4Receipt sale={sale} onClose={onClose} onPrint={onPrint} />;
  }
  return <ThermalReceipt sale={sale} onClose={onClose} onPrint={onPrint} />;
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

import { useState } from "react";