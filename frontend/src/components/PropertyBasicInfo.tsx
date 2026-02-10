import type { PropertyBasicData } from '@/types/loan';

interface PropertyBasicInfoProps {
  data: PropertyBasicData | null | undefined;
}

export default function PropertyBasicInfo({ data }: PropertyBasicInfoProps) {
  if (!data) return null;

  return (
    <div className="info-card">
      <h3>담보 물건 기초 정보 조회 영역</h3>
      <div className="info-content">
        <div className="info-row">
          <span className="label">주소:</span>
          <span className="value">{data.address}</span>
        </div>
        <div className="info-row">
          <span className="label">세대수:</span>
          <span className="value">{data.units}세대</span>
        </div>
        <div className="info-row">
          <span className="label">복도타입:</span>
          <span className="value">{data.corridor_type}</span>
        </div>
        <div className="info-row">
          <span className="label">연식:</span>
          <span className="value">약 {data.age}년</span>
        </div>
        <div className="info-row">
          <span className="label">전용면적:</span>
          <span className="value">{data.area}평</span>
        </div>
        <div className="info-row">
          <span className="label">입지점수:</span>
          <span className="value">{data.location_score}/100</span>
        </div>
      </div>
    </div>
  );
}
