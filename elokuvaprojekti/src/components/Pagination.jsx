import React from "react";
import "./style/Pagination.css"

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = []

  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, currentPage + 2)

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

    return (
        <div className="pagination-container">
            <button
                className="back-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <span>&lt; Back</span>
            </button>

            {startPage > 1 && (
                <>
                    <button className="num-button" onClick={() => onPageChange(1)}>1</button>
                    {startPage > 2 && <span>...</span>}
                </>
            )}

            {pageNumbers.map((num) => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    className={`num-button ${num === currentPage ? "active" : ""}`}
                >
                    {num}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span>...</span>}
                    <button className="num-button" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                </>
            )}

            <button
                className="next-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <span>Next &gt;</span>
            </button>
        </div>
    )
}
