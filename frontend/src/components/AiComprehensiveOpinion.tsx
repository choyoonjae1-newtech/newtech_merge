interface AiComprehensiveOpinionProps {
  opinion: string | null | undefined;
}

export default function AiComprehensiveOpinion({ opinion }: AiComprehensiveOpinionProps) {
  if (!opinion) return null;

  const lines = opinion.split('\n').filter(line => line.trim());

  const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
      '입지': '#006FBD',
      '권리': '#051C48',
      '시세': '#20c997',
      '유사물건': '#FF8C00',
      '평단가': '#7C3AED',
      'LTV': '#EF5350',
    };
    return colors[tag] || '#666';
  };

  const parseLine = (line: string): { tag: string | null; text: string } => {
    const match = line.match(/^\[(.+?)\]\s*(.+)$/);
    if (match) {
      return { tag: match[1], text: match[2] };
    }
    return { tag: null, text: line };
  };

  return (
    <div className="info-card ai-comprehensive-card">
      <h3>AI 종합 의견</h3>
      <div className="ai-comprehensive-list">
        {lines.map((line, idx) => {
          const { tag, text } = parseLine(line);
          return (
            <div key={idx} className="ai-comprehensive-item">
              {tag && (
                <span
                  className="ai-comprehensive-tag"
                  style={{ backgroundColor: getTagColor(tag) }}
                >
                  {tag}
                </span>
              )}
              <span className="ai-comprehensive-text">{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
