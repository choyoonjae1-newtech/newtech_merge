import React, { useState } from "react"
import { useRun, useRunTasks } from "@/hooks/useRuns"
import StatusBadge from "./StatusBadge"
import Pagination from "./Pagination"
import RunStatsChart from "./RunStatsChart"
import type { CrawlTask } from "@/types/run"
import "./collector.css"

interface RunDetailProps {
  runId: number
  onBack: () => void
}

const TASK_PAGE_SIZE = 30

const RunDetail: React.FC<RunDetailProps> = ({ runId, onBack }) => {
  const [taskPage, setTaskPage] = useState(1)
  const [taskStatusFilter, setTaskStatusFilter] = useState("")

  const { data: run, isLoading: runLoading, isError: runError } = useRun(runId)
  const { data: tasks, isLoading: tasksLoading } = useRunTasks(runId, {
    skip: (taskPage - 1) * TASK_PAGE_SIZE,
    limit: TASK_PAGE_SIZE,
    status_filter: taskStatusFilter || undefined,
  })

  const formatDatetime = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString("ko-KR", {
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

  if (runLoading) {
    return (
      <div className="collector-loading">
        <div className="spinner" />
        <p>불러오는 중...</p>
      </div>
    )
  }

  if (runError || !run) {
    return (
      <div className="collector-error">
        <p>실행 정보를 불러올 수 없습니다.</p>
        <button className="collector-btn collector-btn-outline" onClick={onBack}>
          목록으로
        </button>
      </div>
    )
  }

  const taskList: CrawlTask[] = Array.isArray(tasks) ? tasks : []
  const totalTasks = run.total_tasks
  const taskTotalPages = Math.max(1, Math.ceil(totalTasks / TASK_PAGE_SIZE))

  const progressPercent =
    run.total_tasks > 0
      ? Math.round(((run.success_count + run.failed_count + run.skipped_count) / run.total_tasks) * 100)
      : 0

  return (
    <div>
      <div className="collector-back-row">
        <button className="collector-back-btn" onClick={onBack}>
          &larr; 실행 목록으로
        </button>
      </div>

      <div className="collector-card">
        <div className="collector-card-header">
          <h3>실행 #{run.id}</h3>
          <StatusBadge status={run.status} />
        </div>

        <div className="run-summary-stats">
          <div className="run-stat-box">
            <div className="run-stat-value text-blue">{run.total_tasks}</div>
            <div className="run-stat-label">전체 태스크</div>
          </div>
          <div className="run-stat-box">
            <div className="run-stat-value text-green">{run.success_count}</div>
            <div className="run-stat-label">성공</div>
          </div>
          <div className="run-stat-box">
            <div className="run-stat-value text-red">{run.failed_count}</div>
            <div className="run-stat-label">실패</div>
          </div>
          <div className="run-stat-box">
            <div className="run-stat-value text-orange">{run.skipped_count}</div>
            <div className="run-stat-label">건너뜀</div>
          </div>
        </div>

        <div className="collector-info-grid">
          <div className="collector-info-item">
            <span className="collector-info-label">Job ID</span>
            <span className="collector-info-value">{run.job_id ?? "-"}</span>
          </div>
          <div className="collector-info-item">
            <span className="collector-info-label">시작 시간</span>
            <span className="collector-info-value">{formatDatetime(run.started_at)}</span>
          </div>
          <div className="collector-info-item">
            <span className="collector-info-label">종료 시간</span>
            <span className="collector-info-value">{formatDatetime(run.finished_at)}</span>
          </div>
          <div className="collector-info-item">
            <span className="collector-info-label">소요 시간</span>
            <span className="collector-info-value">
              {formatDuration(run.started_at, run.finished_at)}
            </span>
          </div>
          <div className="collector-info-item">
            <span className="collector-info-label">대상</span>
            <span className="collector-info-value">{run.target_summary ?? "-"}</span>
          </div>
          <div className="collector-info-item">
            <span className="collector-info-label">진행률</span>
            <span className="collector-info-value">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Stats Chart */}
      <RunStatsChart run={run} />

      {/* Task List */}
      <div className="collector-card">
        <div className="collector-card-header">
          <h3>태스크 목록</h3>
          <select
            className="collector-select"
            value={taskStatusFilter}
            onChange={(e) => {
              setTaskStatusFilter(e.target.value)
              setTaskPage(1)
            }}
          >
            <option value="">전체 상태</option>
            <option value="pending">대기</option>
            <option value="running">실행중</option>
            <option value="success">성공</option>
            <option value="failed">실패</option>
            <option value="retry">재시도</option>
            <option value="skipped">건너뜀</option>
          </select>
        </div>

        {tasksLoading ? (
          <div className="collector-loading">
            <div className="spinner" />
            <p>태스크 불러오는 중...</p>
          </div>
        ) : taskList.length === 0 ? (
          <div className="collector-empty">태스크가 없습니다.</div>
        ) : (
          <>
            <div className="collector-table-wrapper">
              <table className="collector-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>ID</th>
                    <th>태스크 키</th>
                    <th style={{ width: 80 }}>상태</th>
                    <th style={{ width: 140 }}>시작시간</th>
                    <th style={{ width: 80 }}>소요시간</th>
                    <th style={{ width: 50 }}>재시도</th>
                    <th style={{ width: 70 }}>수집건수</th>
                    <th style={{ width: 70 }}>저장건수</th>
                    <th>오류</th>
                  </tr>
                </thead>
                <tbody>
                  {taskList.map((task) => (
                    <tr key={task.id}>
                      <td className="center">{task.id}</td>
                      <td>{task.task_key}</td>
                      <td className="center">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="center nowrap">{formatDatetime(task.started_at)}</td>
                      <td className="center">
                        <span className="duration-text">
                          {formatDuration(task.started_at, task.finished_at)}
                        </span>
                      </td>
                      <td className="center">{task.retry_count}</td>
                      <td className="center">{task.items_collected}</td>
                      <td className="center">{task.items_saved}</td>
                      <td>
                        {task.error_message ? (
                          <div>
                            {task.error_type && (
                              <span style={{ fontWeight: 600, fontSize: 12, color: "#C62828" }}>
                                [{task.error_type}]
                              </span>
                            )}
                            <div className="task-error-msg">{task.error_message}</div>
                          </div>
                        ) : (
                          <span style={{ color: "#999" }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={taskPage}
              totalPages={taskTotalPages}
              onPageChange={setTaskPage}
              totalItems={totalTasks}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default RunDetail
