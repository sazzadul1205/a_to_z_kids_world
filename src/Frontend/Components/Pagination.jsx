import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const range = () => {
    const delta = 1;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    const items = [];
    if (left > 1) items.push(1);
    if (left > 2) items.push(-1);
    for (let i = left; i <= right; i += 1) items.push(i);
    if (right < totalPages - 1) items.push(-2);
    if (right < totalPages) items.push(totalPages);
    return items;
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <p className="text-xs font-semibold text-text-muted">
        Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
      </p>
      <nav aria-label="Pagination" className="inline-flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-border bg-surface p-2 text-text transition hover:border-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {range().map((n) =>
          n < 0 ? (
            <span key={n} className="px-2 text-text-muted">...</span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPageChange(n)}
              aria-current={n === page}
              className={`min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm font-bold transition ${
                n === page
                  ? "bg-brand-fill text-ink-on-brand"
                  : "border border-border bg-surface text-text hover:border-primary-300"
              }`}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-border bg-surface p-2 text-text transition hover:border-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
