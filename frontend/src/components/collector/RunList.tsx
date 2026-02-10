import React, { useState } from "react"
import { useRuns } from "@/hooks/useRuns"
import StatusBadge from "./StatusBadge"
import Pagination from "./Pagination"
import RunDetail from "./RunDetail"
import type { CrawlRun } from "@/types/run"
import "./collector.css"

const PAGE_SIZE = 20

const RunList: React.FC = () => {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)

  const { data, isLoading, isError } = useRuns({
    skip: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    status_filter: statusFilter || undefined,
  })

  const runs: CrawlRun[] = Array.isArray(data) ? data : (data as any)?.items ?? []
  const total: number = Array.isArray(data) ? runs.length : (data as any)?.total ?? runs.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const formatDatetime = (dateStr: string | null) => {
    if (!dateStr) return "-"
    const d = new Date(dateStr)
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start) return "-"
    const s = new Date(start).getTime()
    const e = end ? new Date(end).getTime() : Date.now()
    const diffSec = Math.floor((e - s) / 1000)
    if (diffSec < 60) return `${diffSec}초`
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 ${diffSec % 60}초`
    const h = Math.floor(diffSec / 3600)
    const m = Math.floor((diffSec % 3600) / 60)
    return `${h}시간 ${m}분`
  }

  if (selectedRunId !== null) {
    return <RunDetail runId={selectedRunId} onBack={() => setSelectedRunId(null)} />
  }

  return (
    <div>
      <div className="collector-toolbar">
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
            <option value="pending">대기</option>
            <option value="running">실행중</option>
            <option value="success">성공</option>
            <option value="partial">부분완료</option>
            <option value="failed">실패</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
      </div>

      {isError && (
        <div className="collector-error">
          <p>수집 실행 이력을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      )}

      {isLoading ? (
        <div className="collector-loading">
          <div className="spinner" />
          <p>불러오는 중...</p>
        </div>
      ) : runs.length === 0 ? (
        <div className="collector-empty">수집 실행 이력이 없습니다.</div>
      ) : (
        <>
          <div className="collector-table-wrapper">
            <table className="collector-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>대상</th>
                  <th style={{ width: 90 }}>상태</th>
                  <th style={{ width: 160 }}>시작시간</th>
                  <th style={{ width: 100 }}>소요시간</th>
                  <th style={{ width: 80 }}>전체</th>
                  <th style={{ width: 80 }}>성공</th>
                  <th style={{ width: 80 }}>실패</th>
                  <th style={{ width: 80 }}>건너뜀</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    className="clickable"
                    onClick={() => setSelectedRunId(run.id)}
                  >
                    <td className="center">{run.id}</td>
                    <td>{run.target_summary || (run.job_id ? `Job #${run.job_id}` : "-")}</td>
                    <td className="center">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="center nowrap">{formatDatetime(run.started_at)}</td>
                    <td className="center">
                      <span className="duration-text">
                        {formatDuration(run.started_at, run.finished_at)}
                      </span>
                    </td>
                    <td className="center">{run.total_tasks}</td>
                    <td className="center" style={{ color: "#20c997", fontWeight: 600 }}>
                      {run.success_count}
                    </td>
                    <td className="center" style={{ color: "#EF5350", fontWeight: 600 }}>
                      {run.failed_count}
                    </td>
                    <td className="center" style={{ color: "#999" }}>
                      {run.skipped_count}
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

export default RunList
