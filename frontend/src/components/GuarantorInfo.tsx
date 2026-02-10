import type { GuarantorData } from '@/types/loan';

interface GuarantorInfoProps {
  data: GuarantorData | null | undefined;
}

export default function GuarantorInfo({ data }: GuarantorInfoProps) {
  if (!data) return null;

  return (
    <div className="info-card">
      <h3>연대보증인(대표자) 정보 조회 영역</h3>
      <div className="info-content">
        <div className="info-row">
          <span className="label">이름:</span>
          <span className="value">{data.name}</span>
        </div>
        <div className="info-row">
          <span className="label">신용점수:</span>
          <span className="value">{data.credit_score}점</span>
        </div>
        <div className="info-row">
          <span className="label">직접채무:</span>
          <span className="value">{(data.direct_debt / 100000000).toFixed(1)}억원</span>
        </div>
        <div className="info-row">
          <span className="label">보증채무:</span>
          <span className="value">{(data.guarantee_debt / 100000000).toFixed(1)}억원</span>
        </div>
      </div>
    </div>
  );
}
