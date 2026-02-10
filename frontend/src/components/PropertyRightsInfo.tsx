import type { PropertyRightsData } from '@/types/loan';

interface PropertyRightsInfoProps {
  data: PropertyRightsData | null | undefined;
  onViewPDF: () => void;
}

export default function PropertyRightsInfo({ data, onViewPDF }: PropertyRightsInfoProps) {
  if (!data) return null;

  return (
    <div className="info-card rights-highlight">
      <div className="card-header">
        <h3>담보 물건 권리 정보 조회 영역</h3>
        <button className="pdf-view-btn" onClick={onViewPDF}>
          등기부등본 원본 보기
        </button>
      </div>
      <div className="info-content">
        <div className="info-row">
          <span className="label">갑구:</span>
          <span className="value">{data.gap_section}</span>
        </div>
        <div className="info-row">
          <span className="label">을구:</span>
          <span className="value">{data.eul_section}</span>
        </div>
        {data.seizure && (
          <div className="info-row">
            <span className="label">가압류:</span>
            <span className="value warning">{data.seizure}</span>
          </div>
        )}
        <div className="info-row">
          <span className="label">선순위:</span>
          <span className="value">{data.priority_rank}순위</span>
        </div>
      </div>
    </div>
  );
}
