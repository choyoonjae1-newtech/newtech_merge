import type { RightsAnalysisDetail } from '@/types/loan';

interface AIRightsAnalysisProps {
  analysis: RightsAnalysisDetail | null | undefined;
}

export default function AIRightsAnalysis({ analysis }: AIRightsAnalysisProps) {
  if (!analysis) return null;

  const sections = [
    { label: '갑구 (소유권)', content: analysis.gap_summary },
    { label: '을구 (제한물권)', content: analysis.eul_summary },
    { label: '가압류/가처분', content: analysis.seizure_summary },
    { label: '선순위 검토', content: analysis.priority_summary },
  ];

  return (
    <div className="ai-card">
      <h3>AI 권리 분석 결과</h3>
      <div className="ai-content">
        {sections.map((section, idx) => (
          <div key={idx} className="ai-rights-section">
            <div className="ai-rights-label">{section.label}</div>
            <p className="ai-rights-text">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
