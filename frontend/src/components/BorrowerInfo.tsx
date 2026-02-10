import type { BorrowerData } from '@/types/loan';

interface BorrowerInfoProps {
  data: BorrowerData | null | undefined;
}

export default function BorrowerInfo({ data }: BorrowerInfoProps) {
  if (!data) return null;

  const formatAmount = (amount: number): string => {
    return `${(amount / 100000000).toFixed(0)}억원`;
  };

  return (
    <div className="info-card">
      <h3>차주 정보 조회 영역</h3>
      <div className="info-content">
        <div className="info-row">
          <span className="label">대부업체 명칭:</span>
          <span className="value">{data.company_name}</span>
        </div>
        <div className="info-row">
          <span className="label">사업자번호:</span>
          <span className="value">{data.business_number}</span>
        </div>

        <div className="financial-table-container">
          <h4>최근 3개년 재무 정보</h4>
          <table className="financial-table">
            <thead>
              <tr>
                <th>연도</th>
                <th>자산</th>
                <th>부채</th>
                <th>자본</th>
                <th>매출</th>
                <th>영업이익</th>
                <th>당기순이익</th>
              </tr>
            </thead>
            <tbody>
              {data.financial_data.map((yearData) => (
                <tr key={yearData.year}>
                  <td>{yearData.year}년</td>
                  <td>{formatAmount(yearData.assets)}</td>
                  <td>{formatAmount(yearData.liabilities)}</td>
                  <td>{formatAmount(yearData.equity)}</td>
                  <td>{formatAmount(yearData.revenue)}</td>
                  <td>{formatAmount(yearData.operating_profit)}</td>
                  <td>{formatAmount(yearData.net_income)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
