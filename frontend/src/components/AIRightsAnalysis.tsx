interface AIRightsAnalysisProps {
  analysis: string | null | undefined;
}

export default function AIRightsAnalysis({ analysis }: AIRightsAnalysisProps) {
  if (!analysis) return null;

  return (
    <div className="ai-card">
      <h3>AI 권리 분석 결과</h3>
      <div className="ai-content">
        <pre>{analysis}</pre>
      </div>
    </div>
  );
}
