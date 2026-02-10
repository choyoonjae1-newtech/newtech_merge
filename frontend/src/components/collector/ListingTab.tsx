import React, { useState } from "react"
import { useListings } from "@/hooks/useData"
import StatusBadge from "./StatusBadge"
import Pagination from "./Pagination"
import type { Listing } from "@/types/data"

interface ListingTabProps {
  complexId: number
}

const PAGE_SIZE = 30

const ListingTab: React.FC<ListingTabProps> = ({ complexId }) => {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")

  const { data, isLoading } = useListings({
    complex_id: complexId,
    status: statusFilter || undefined,
    skip: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  })

  const listings: Listing[] = Array.isArray(data) ? data : (data as any)?.items ?? []
  const total: number = Array.isArray(data)
    ? listings.length
    : (data as any)?.total ?? listings.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const formatPrice = (v: number) => {
    if (v >= 10000) return `${(v / 10000).toFixed(1)}억`
    return `${v.toLocaleString()}만`
  }

  return (
    <div>
      <div className="collector-toolbar" style={{ marginBottom: 12 }}>
        <div className="collector-toolbar-left">
          <select
            className="collector-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="">전체 상태</option>
            <option value="active">활성</option>
            <option value="sold">매도</option>
            <option value="removed">삭제</option>
            <option value="unknown">알수없음</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="collector-loading">
          <div className="spinner" />
          <p>매물 데이터 불러오는 중...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="collector-empty">매물 데이터가 없습니다.</div>
      ) : (
        <>
          <div className="collector-table-wrapper">
            <table className="collector-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>ID</th>
                  <th>매물 ID</th>
                  <th>호가</th>
                  <th>전용면적</th>
                  <th>층</th>
                  <th style={{ width: 80 }}>상태</th>
                  <th>수집일</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td className="center">{l.id}</td>
                    <td className="center">{l.source_listing_id}</td>
                    <td className="right" style={{ fontWeight: 600 }}>
                      {formatPrice(l.ask_price)}
                    </td>
                    <td className="center">
                      {l.exclusive_m2 != null ? `${l.exclusive_m2}m2` : "-"}
                    </td>
                    <td className="center">{l.floor ?? "-"}</td>
                    <td className="center">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="center nowrap">
                      {l.fetched_at
                        ? new Date(l.fetched_at).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
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

export default ListingTab
