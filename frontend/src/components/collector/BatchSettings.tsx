import React, { useState } from "react"
import { useBatches, useRunBatch, useUpdateBatchSchedule } from "@/hooks/useBatches"
import { useRunStatus } from "@/hooks/useComplexes"
import StatusBadge from "./StatusBadge"

const SIDO_LIST: { code: string; name: string }[] = [
  { code: "11", name: "서울특별시" },
  { code: "26", name: "부산광역시" },
  { code: "27", name: "대구광역시" },
  { code: "28", name: "인천광역시" },
  { code: "29", name: "광주광역시" },
  { code: "30", name: "대전광역시" },
  { code: "31", name: "울산광역시" },
  { code: "36", name: "세종특별자치시" },
  { code: "41", name: "경기도" },
  { code: "42", name: "강원특별자치도" },
  { code: "43", name: "충청북도" },
  { code: "44", name: "충청남도" },
  { code: "45", name: "전라북도" },
  { code: "46", name: "전라남도" },
  { code: "47", name: "경상북도" },
  { code: "48", name: "경상남도" },
]

interface BatchInfo {
  sido_code: string
  complex_count: number
  last_run_status: string | null
  last_run_at: string | null
  cron_schedule: string | null
}

interface RunAlert {
  type: "success" | "error" | "running"
  message: string
  runId?: number
}

const BatchSettings: React.FC = () => {
  const { data: batches, isLoading, isError } = useBatches()
  const runBatch = useRunBatch()
  const updateSchedule = useUpdateBatchSchedule()

  const [editingCron, setEditingCron] = useState<Record<string, string>>({})
  const [alerts, setAlerts] = useState<Record<string, RunAlert>>({})
  const [activeRunId, setActiveRunId] = useState<number | null>(null)

  const runStatus = useRunStatus(activeRunId)

  // 실행 상태 폴링 결과 반영
  React.useEffect(() => {
    if (!runStatus.data || !activeRunId) return
    const rs = runStatus.data
    if (rs.status === "success" || rs.status === "partial" || rs.status === "failed") {
      // 어느 sido의 run인지 찾기
      for (const [code, alert] of Object.entries(alerts)) {
        if (alert.runId === activeRunId && alert.type === "running") {
          const statusText = rs.status === "success"
            ? "완료" : rs.status === "partial" ? "부분 완료" : "실패"
          setAlerts((prev) => ({
            ...prev,
            [code]: {
              type: rs.status === "failed" ? "error" : "success",
              message: `수집 ${statusText} (성공: ${rs.success_count}, 실패: ${rs.failed_count})`,
              runId: activeRunId,
            },
          }))
          break
        }
      }
      setActiveRunId(null)
    }
  }, [runStatus.data, activeRunId, alerts])

  const batchMap: Record<string, BatchInfo> = {}
  if (batches && Array.isArray(batches)) {
    for (const b of batches as BatchInfo[]) {
      batchMap[b.sido_code] = b
    }
  }

  const handleRun = (sidoCode: string, sidoName: string) => {
    runBatch.mutate(sidoCode, {
      onSuccess: (data) => {
        setAlerts((prev) => ({
          ...prev,
          [sidoCode]: {
            type: "running",
            message: `${sidoName} ${data.complex_count}개 단지 수집 시작됨 (Run #${data.run_id})`,
            runId: data.run_id,
          },
        }))
        setActiveRunId(data.run_id)
      },
      onError: (err: Error) => {
        setAlerts((prev) => ({
          ...prev,
          [sidoCode]: {
            type: "error",
            message: `수집 요청 실패: ${err.message}`,
          },
        }))
      },
    })
  }

  const handleCronChange = (sidoCode: string, value: string) => {
    setEditingCron((prev) => ({ ...prev, [sidoCode]: value }))
  }

  const handleCronSave = (sidoCode: string) => {
    const value = editingCron[sidoCode]
    if (value === undefined) return
    updateSchedule.mutate(
      { sidoCode, cronSchedule: value.trim() || null },
      {
        onSuccess: () => {
          setEditingCron((prev) => {
            const next = { ...prev }
            delete next[sidoCode]
            return next
          })
        },
      }
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    const d = new Date(dateStr)
    return d.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="collector-loading">
        <div className="spinner" />
        <p>배치 설정 불러오는 중...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="collector-error">
        <p>배치 설정을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="collector-card-header" style={{ marginBottom: 20 }}>
        <h3>지역별 배치 수집 설정</h3>
      </div>

      <div className="batch-grid">
        {SIDO_LIST.map(({ code, name }) => {
          const info = batchMap[code]
          const complexCount = info?.complex_count ?? 0
          const lastStatus = info?.last_run_status ?? null
          const lastRunAt = info?.last_run_at ?? null
          const currentCron = info?.cron_schedule ?? ""
          const isEditingThis = editingCron[code] !== undefined

          return (
            <div className="batch-card" key={code}>
              <div className="batch-card-header">
                <span className="batch-card-name">{name}</span>
                <span className="batch-card-count">{complexCount}개 단지</span>
              </div>

              <div className="batch-card-info">
                <div className="batch-card-row">
                  <span className="batch-card-label">최근 수집</span>
                  <span className="batch-card-value">
                    {lastStatus ? <StatusBadge status={lastStatus} /> : "-"}
                  </span>
                </div>
                <div className="batch-card-row">
                  <span className="batch-card-label">수집일시</span>
                  <span className="batch-card-value">{formatDate(lastRunAt)}</span>
                </div>
                <div className="batch-card-row">
                  <span className="batch-card-label">스케줄</span>
                  <span className="batch-card-value" style={{ fontFamily: "monospace", fontSize: 11 }}>
                    {currentCron || "미설정"}
                  </span>
                </div>
              </div>

              {isEditingThis ? (
                <div style={{ marginBottom: 10 }}>
                  <input
                    className="batch-cron-input"
                    type="text"
                    value={editingCron[code]}
                    onChange={(e) => handleCronChange(code, e.target.value)}
                    placeholder="0 2 * * * (cron 표현식)"
                  />
                  <div className="collector-btn-group" style={{ marginTop: 6 }}>
                    <button
                      className="collector-btn collector-btn-sm collector-btn-primary"
                      onClick={() => handleCronSave(code)}
                      disabled={updateSchedule.isPending}
                    >
                      저장
                    </button>
                    <button
                      className="collector-btn collector-btn-sm collector-btn-ghost"
                      onClick={() =>
                        setEditingCron((prev) => {
                          const next = { ...prev }
                          delete next[code]
                          return next
                        })
                      }
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {alerts[code] && (
                    <div
                      className={`batch-alert batch-alert-${alerts[code].type}`}
                      style={{ marginBottom: 8 }}
                    >
                      <span className="batch-alert-text">{alerts[code].message}</span>
                      {alerts[code].type !== "running" && (
                        <button
                          className="batch-alert-close"
                          onClick={() =>
                            setAlerts((prev) => {
                              const next = { ...prev }
                              delete next[code]
                              return next
                            })
                          }
                        >
                          &times;
                        </button>
                      )}
                      {alerts[code].type === "running" && (
                        <span className="batch-alert-spinner" />
                      )}
                    </div>
                  )}

                  <div className="batch-card-actions">
                    <button
                      className="collector-btn collector-btn-sm collector-btn-primary"
                      onClick={() => handleRun(code, name)}
                      disabled={runBatch.isPending || complexCount === 0 || alerts[code]?.type === "running"}
                    >
                      {alerts[code]?.type === "running" ? "수집 중..." : "수집 시작"}
                    </button>
                    <button
                      className="collector-btn collector-btn-sm collector-btn-outline"
                      onClick={() => handleCronChange(code, currentCron)}
                    >
                      스케줄
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BatchSettings
