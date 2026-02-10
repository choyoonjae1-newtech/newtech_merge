interface AIMarketAnalysisProps {
  analysis: string | null | undefined;
}

export default function AIMarketAnalysis({ analysis }: AIMarketAnalysisProps) {
  if (!analysis) return null;

  return (
    <div className="ai-card">
      <h3>AI 시세 분석 결과</h3>
      <div className="ai-content">
        <pre>{analysis}</pre>
      </div>
    </div>
  );
}
