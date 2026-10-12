import { useState } from "react";

export const DEFAULT_PAGE_SIZE = 12;

// Hook: tracks the current page and slices any array into a window.
export function usePagination(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const window = items.slice(start, start + pageSize);

  // Reset to page 1 whenever the backing list shrinks below the current page.
  if (page > totalPages) {
    setPage(1);
  }

  return {
    page,
    setPage,
    pageSize,
    total: items.length,
    totalPages,
    window,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
