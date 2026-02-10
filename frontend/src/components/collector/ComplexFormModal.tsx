import React, { useState, useEffect } from "react"
import { useCreateComplex, useUpdateComplex } from "@/hooks/useComplexes"
import type { Complex, ComplexCreate, PriorityLevel } from "@/types/complex"

interface ComplexFormModalProps {
  complex?: Complex | null
  onClose: () => void
}

const EMPTY_FORM: ComplexCreate = {
  name: "",
  address: "",
  region_code: "",
  kb_complex_id: "",
  priority: "normal",
  is_active: true,
  collect_listings: false,
}

const ComplexFormModal: React.FC<ComplexFormModalProps> = ({ complex, onClose }) => {
  const [form, setForm] = useState<ComplexCreate>(EMPTY_FORM)
  const createMutation = useCreateComplex()
  const updateMutation = useUpdateComplex()

  const isEdit = !!complex

  useEffect(() => {
    if (complex) {
      setForm({
        name: complex.name,
        address: complex.address,
        region_code: complex.region_code ?? "",
        kb_complex_id: complex.kb_complex_id ?? "",
        priority: complex.priority,
        is_active: complex.is_active,
        collect_listings: complex.collect_listings,
      })
    }
  }, [complex])

  const handleChange = (field: keyof ComplexCreate, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim()) return

    try {
      if (isEdit && complex) {
        await updateMutation.mutateAsync({ id: complex.id, data: form })
      } else {
        await createMutation.mutateAsync(form)
      }
      onClose()
    } catch {
      // error handled by react-query
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="collector-modal-overlay" onClick={onClose}>
      <div className="collector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="collector-modal-header">
          <h2>{isEdit ? "단지 수정" : "단지 등록"}</h2>
          <button className="collector-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="collector-modal-body">
          <div className="collector-form-group">
            <label>단지명 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="예: 래미안 퍼스트"
            />
          </div>

          <div className="collector-form-group">
            <label>주소 *</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="예: 서울특별시 강남구 개포동 123"
            />
          </div>

          <div className="collector-form-row">
            <div className="collector-form-group">
              <label>지역코드</label>
              <input
                type="text"
                value={form.region_code ?? ""}
                onChange={(e) => handleChange("region_code", e.target.value)}
                placeholder="예: 1168000000"
              />
            </div>
            <div className="collector-form-group">
              <label>KB 단지 ID</label>
              <input
                type="text"
                value={form.kb_complex_id ?? ""}
                onChange={(e) => handleChange("kb_complex_id", e.target.value)}
                placeholder="예: 12345"
              />
            </div>
          </div>

          <div className="collector-form-group">
            <label>우선순위</label>
            <select
              value={form.priority}
              onChange={(e) => handleChange("priority", e.target.value as PriorityLevel)}
            >
              <option value="high">높음 (High)</option>
              <option value="normal">보통 (Normal)</option>
              <option value="low">낮음 (Low)</option>
            </select>
          </div>

          <div className="collector-checkbox-group">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active ?? true}
              onChange={(e) => handleChange("is_active", e.target.checked)}
            />
            <label htmlFor="is_active">수집 활성화</label>
          </div>

          <div className="collector-checkbox-group">
            <input
              type="checkbox"
              id="collect_listings"
              checked={form.collect_listings ?? false}
              onChange={(e) => handleChange("collect_listings", e.target.checked)}
            />
            <label htmlFor="collect_listings">매물 수집 포함</label>
          </div>
        </div>

        <div className="collector-modal-footer">
          <button
            className="collector-btn collector-btn-ghost"
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </button>
          <button
            className="collector-btn collector-btn-primary"
            onClick={handleSubmit}
            disabled={isPending || !form.name.trim() || !form.address.trim()}
          >
            {isPending ? "저장중..." : isEdit ? "수정" : "등록"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ComplexFormModal
