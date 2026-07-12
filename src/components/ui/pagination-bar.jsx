import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Returns the page-number array to render (with "…" strings as ellipsis markers).
 */
function buildPages(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, "…", totalPages];
  }
  if (page >= totalPages - 3) {
    return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "…", page - 1, page, page + 1, "…", totalPages];
}

/**
 * PaginationBar — shared paginator component.
 *
 * @param {object} props
 * @param {number}   props.page        Current page (1-indexed).
 * @param {number}   props.totalPages  Total number of pages.
 * @param {number}   props.total       Total item count across all pages.
 * @param {number}   props.pageSize    Items per page (used for "Showing X–Y").
 * @param {function} props.onPage      Callback called with the new page number.
 * @param {boolean}  [props.compact]   Minimal UI for narrow panels (e.g. sidebar list).
 */
export function PaginationBar({ page, totalPages, total, pageSize, onPage, compact = false }) {
  if (!total || totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  /* ─ Shared nav-button helper ─ */
  const NavBtn = ({ disabled, onClick, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-medium transition
        ${disabled
          ? "text-muted-foreground/30 cursor-not-allowed"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
    >
      {children}
    </button>
  );

  /* ─── Compact variant (for the inbox list panel) ─── */
  if (compact) {
    return (
      <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-background shrink-0">
        <span className="text-[10px] text-muted-foreground">
          {from}–{to} of {total}
        </span>
        <div className="flex items-center gap-0.5">
          <NavBtn disabled={page === 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft size={12} />
          </NavBtn>
          <span className="text-[10px] font-medium text-foreground px-1 min-w-[36px] text-center">
            {page} / {totalPages}
          </span>
          <NavBtn disabled={page === totalPages} onClick={() => onPage(page + 1)}>
            <ChevronRight size={12} />
          </NavBtn>
        </div>
      </div>
    );
  }

  /* ─── Full variant (for wide admin tables) ─── */
  const pages = buildPages(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/20">
      <span className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{from}–{to}</span>
        {" "}of{" "}
        <span className="font-medium text-foreground">{total}</span>
        {" "}entries
      </span>

      <div className="flex items-center gap-0.5">
        <NavBtn disabled={page === 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft size={13} /> Prev
        </NavBtn>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`dot-${i}`} className="px-1.5 text-xs text-muted-foreground select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`w-7 h-7 rounded-md text-xs font-medium transition ${
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p}
            </button>
          )
        )}

        <NavBtn disabled={page === totalPages} onClick={() => onPage(page + 1)}>
          Next <ChevronRight size={13} />
        </NavBtn>
      </div>
    </div>
  );
}
