import React from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)

    if (currentPage > 3) {
      pages.push("...")
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push("...")
    }

    pages.push(totalPages)

    return pages
  }

  return (
    <div className="collector-pagination">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &lsaquo;
      </button>

      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} style={{ padding: "0 6px", color: "#999" }}>
            ...
          </span>
        ) : (
          <button
            key={page}
            className={currentPage === page ? "active" : ""}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </button>
        )
      )}

      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        &rsaquo;
      </button>

      {totalItems !== undefined && (
        <span className="collector-pagination-info">
          총 {totalItems.toLocaleString()}건
        </span>
      )}
    </div>
  )
}

export default Pagination
