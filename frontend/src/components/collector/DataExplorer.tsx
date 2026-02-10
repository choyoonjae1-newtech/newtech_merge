import React, { useState } from "react"
import { useComplexes, useSigunguList } from "@/hooks/useComplexes"
import PriceTab from "./PriceTab"
import TransactionTab from "./TransactionTab"
import ListingTab from "./ListingTab"
import type { Complex } from "@/types/complex"
import "./collector.css"

type DataSubTab = "prices" | "transactions" | "listings"

const SIDO_LIST = [
  { code: "11", name: "서울" }, { code: "26", name: "부산" }, { code: "27", name: "대구" },
  { code: "28", name: "인천" }, { code: "29", name: "광주" }, { code: "30", name: "대전" },
  { code: "31", name: "울산" }, { code: "36", name: "세종" }, { code: "41", name: "경기" },
  { code: "42", name: "강원" }, { code: "43", name: "충북" }, { code: "44", name: "충남" },
  { code: "45", name: "전북" }, { code: "46", name: "전남" }, { code: "47", name: "경북" },
  { code: "48", name: "경남" }, { code: "50", name: "제주" },
]

const DataExplorer: React.FC = () => {
  const [subTab, setSubTab] = useState<DataSubTab>("prices")
  const [selectedComplexId, setSelectedComplexId] = useState<number | null>(null)
  const [selectedSido, setSelectedSido] = useState("")
  const [selectedSigungu, setSelectedSigungu] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  // 시군구 목록 (시도 선택 시 KB API에서 로드)
  const { data: sigunguList, isLoading: sigunguLoading } = useSigunguList(selectedSido)

  // 선택된 지역코드 또는 검색어로 단지 조회
  const regionFilter = selectedSigungu || selectedSido || undefined
  const { data } = useComplexes({
    search: debouncedSearch || undefined,
    region_code: regionFilter,
    limit: 200,
    is_active: true,
  })

  const complexes: Complex[] = data?.items ?? []

  const handleSearchChange = (value: string) => {
    setSearch(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
    }, 400)
  }

  const handleSidoSelect = (code: string) => {
    setSelectedSido(code)
    setSelectedSigungu("")
    setSelectedComplexId(null)
  }

  const handleSigunguSelect = (code: string) => {
    setSelectedSigungu(code)
    setSelectedComplexId(null)
  }

  const handleComplexSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedComplexId(val ? Number(val) : null)
  }

  const handleClearRegion = () => {
    setSelectedSido("")
    setSelectedSigungu("")
    setSelectedComplexId(null)
  }

  const selectedComplex = complexes.find((c) => c.id === selectedComplexId) ?? null
  const selectedSidoName = SIDO_LIST.find((s) => s.code === selectedSido)?.name ?? ""
  const selectedSigunguName = sigunguList?.find((s) => s.code === selectedSigungu)?.name ?? ""

  const tabs: { key: DataSubTab; label: string }[] = [
    { key: "prices", label: "KB 시세" },
    { key: "transactions", label: "실거래가" },
    { key: "listings", label: "매물" },
  ]

  return (
    <div>
      {/* 지역 선택 */}
      <div className="collector-card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>지역 선택</label>
          {selectedSido && (
            <button
              className="collector-btn collector-btn-sm collector-btn-outline"
              onClick={handleClearRegion}
              style={{ fontSize: 12 }}
            >
              초기화
            </button>
          )}
        </div>

        {/* 시/도 버튼 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: selectedSido ? 12 : 0 }}>
          {SIDO_LIST.map((s) => (
            <button
              key={s.code}
              className={`collector-btn collector-btn-sm ${selectedSido === s.code ? "collector-btn-primary" : "collector-btn-outline"}`}
              onClick={() => handleSidoSelect(s.code)}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* 시/군/구 버튼 */}
        {selectedSido && (
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 8 }}>
              {selectedSidoName} 시/군/구
            </label>
            {sigunguLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <div className="spinner" style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: "#666" }}>시군구 목록 불러오는 중...</span>
              </div>
            ) : sigunguList && sigunguList.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sigunguList.map((sg) => (
                  <button
                    key={sg.code}
                    className={`collector-btn collector-btn-sm ${selectedSigungu === sg.code ? "collector-btn-primary" : "collector-btn-outline"}`}
                    onClick={() => handleSigunguSelect(sg.code)}
                  >
                    {sg.name}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#999" }}>시군구 목록을 불러올 수 없습니다.</p>
            )}
          </div>
        )}

        {/* 선택 경로 표시 */}
        {selectedSido && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#006FBD", fontWeight: 500 }}>
            {selectedSidoName}
            {selectedSigunguName && ` > ${selectedSigunguName}`}
            {` — ${complexes.length}개 단지`}
          </div>
        )}
      </div>

      {/* 단지 선택 */}
      <div className="collector-card" style={{ marginBottom: 20 }}>
        <div className="data-explorer-selector">
          <label>단지 선택</label>
          <input
            className="collector-search-input"
            type="text"
            placeholder="단지명 검색..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ maxWidth: 240 }}
          />
          <select
            className="collector-select"
            value={selectedComplexId ?? ""}
            onChange={handleComplexSelect}
            style={{ flex: 1, maxWidth: 400 }}
          >
            <option value="">-- 단지를 선택하세요 ({complexes.length}개) --</option>
            {complexes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.address})
              </option>
            ))}
          </select>
        </div>

        {selectedComplex && (
          <div style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
            선택: <strong style={{ color: "#333" }}>{selectedComplex.name}</strong>
            {" - "}
            {selectedComplex.address}
            {selectedComplex.region_code && ` (${selectedComplex.region_code})`}
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      {selectedComplexId && (
        <>
          <div className="collector-subtabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`collector-subtab ${subTab === t.key ? "active" : ""}`}
                onClick={() => setSubTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="collector-card">
            {subTab === "prices" && (
              <PriceTab complexId={selectedComplexId} areas={selectedComplex?.areas ?? []} />
            )}
            {subTab === "transactions" && <TransactionTab complexId={selectedComplexId} />}
            {subTab === "listings" && <ListingTab complexId={selectedComplexId} />}
          </div>
        </>
      )}

      {!selectedComplexId && (
        <div className="collector-empty">
          {selectedSido
            ? "위 목록에서 단지를 선택하면 시세 데이터를 확인할 수 있습니다."
            : "시/도 → 시/군/구를 선택하거나 단지명을 검색하여 데이터를 탐색하세요."}
        </div>
      )}
    </div>
  )
}

export default DataExplorer
