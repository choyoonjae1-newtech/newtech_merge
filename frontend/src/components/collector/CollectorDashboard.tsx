import React, { useState } from "react"
import ComplexList from "./ComplexList"
import ComplexDetail from "./ComplexDetail"
import BatchSettings from "./BatchSettings"
import "./collector.css"

type DashboardSubTab = "complexes" | "batch"

const CollectorDashboard: React.FC = () => {
  const [subTab, setSubTab] = useState<DashboardSubTab>("complexes")
  const [selectedComplexId, setSelectedComplexId] = useState<number | null>(null)

  const handleSelectComplex = (id: number) => {
    setSelectedComplexId(id)
  }

  const handleBackToList = () => {
    setSelectedComplexId(null)
  }

  // If a complex is selected, show detail view
  if (selectedComplexId !== null) {
    return <ComplexDetail complexId={selectedComplexId} onBack={handleBackToList} />
  }

  return (
    <div>
      <div className="collector-subtabs">
        <button
          className={`collector-subtab ${subTab === "complexes" ? "active" : ""}`}
          onClick={() => setSubTab("complexes")}
        >
          단지 관리
        </button>
        <button
          className={`collector-subtab ${subTab === "batch" ? "active" : ""}`}
          onClick={() => setSubTab("batch")}
        >
          배치 설정
        </button>
      </div>

      {subTab === "complexes" && <ComplexList onSelectComplex={handleSelectComplex} />}
      {subTab === "batch" && <BatchSettings />}
    </div>
  )
}

export default CollectorDashboard
