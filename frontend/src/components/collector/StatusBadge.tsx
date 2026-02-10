import React from "react"

interface StatusBadgeProps {
  status: string
  label?: string
}

const STATUS_LABELS: Record<string, string> = {
  success: "성공",
  active: "활성",
  running: "실행중",
  pending: "대기",
  failed: "실패",
  error: "오류",
  paused: "일시정지",
  partial: "부분완료",
  cancelled: "취소",
  retry: "재시도",
  skipped: "건너뜀",
  disabled: "비활성",
  sold: "매도",
  removed: "삭제",
  unknown: "알수없음",
}

function normalizeStatus(status: string): string {
  const s = status.toLowerCase()
  if (s === "success" || s === "active") return "success"
  if (s === "running") return "running"
  if (s === "failed" || s === "error") return "failed"
  if (s === "pending" || s === "disabled") return "pending"
  if (s === "paused" || s === "partial") return "paused"
  if (s === "cancelled") return "cancelled"
  if (s === "retry" || s === "skipped") return "retry"
  return "pending"
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const cssClass = `status-${normalizeStatus(status)}`
  const displayLabel = label ?? STATUS_LABELS[status.toLowerCase()] ?? status

  return <span className={`status-badge ${cssClass}`}>{displayLabel}</span>
}

export default StatusBadge
