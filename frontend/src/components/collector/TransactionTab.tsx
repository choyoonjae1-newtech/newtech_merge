import React, { useState } from "react"
import { useTransactions } from "@/hooks/useData"
import Pagination from "./Pagination"
import type { Transaction } from "@/types/data"

interface TransactionTabProps {
  complexId: number
}

const PAGE_SIZE = 30

const TransactionTab: React.FC<TransactionTabProps> = ({ complexId }) => {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useTransactions({
    complex_id: complexId,
    skip: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  })

  const transactions: Transaction[] = Array.isArray(data)
    ? data
    : (data as any)?.items ?? []
  const total: number = Array.isArray(data)
    ? transactions.length
    : (data as any)?.total ?? transactions.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const formatPrice = (v: number) => {
    if (v >= 10000) return `${(v / 10000).toFixed(1)}억`
    return `${v.toLocaleString()}만`
  }

  return (
    <div>
      {isLoading ? (
        <div className="collector-loading">
          <div className="spinner" />
          <p>거래 데이터 불러오는 중...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="collector-empty">실거래가 데이터가 없습니다.</div>
      ) : (
        <>
          <div className="collector-table-wrapper">
            <table className="collector-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>ID</th>
                  <th>계약일</th>
                  <th>거래가</th>
                  <th>전용면적</th>
                  <th>층</th>
                  <th>출처</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="center">{t.id}</td>
                    <td className="center">{t.contract_date}</td>
                    <td className="right" style={{ fontWeight: 600 }}>
                      {formatPrice(t.price)}
                    </td>
                    <td className="center">{t.exclusive_m2}m2</td>
                    <td className="center">{t.floor ?? "-"}</td>
                    <td className="center">{t.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={total}
          />
        </>
      )}
    </div>
  )
}

export default TransactionTab
