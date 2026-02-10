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
        <div className="rights-section">
          <h4 className="rights-section-title">1. 소유지분현황 (갑구)</h4>
          {data.ownership_entries.length > 0 ? (
            <table className="rights-table">
              <thead>
                <tr>
                  <th>등기명의인</th>
                  <th>(주민)등록번호</th>
                  <th>최종지분</th>
                  <th>주소</th>
                  <th>순위번호</th>
                </tr>
              </thead>
              <tbody>
                {data.ownership_entries.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{entry.name}</td>
                    <td>{entry.reg_number}</td>
                    <td>{entry.share}</td>
                    <td>{entry.address}</td>
                    <td className="center">{entry.rank_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="rights-empty">기록사항 없음</p>
          )}
        </div>

        <div className="rights-section">
          <h4 className="rights-section-title">2. 소유지분을 제외한 소유권에 관한 사항 (갑구)</h4>
          {data.ownership_other_entries.length > 0 ? (
            <table className="rights-table">
              <thead>
                <tr>
                  <th>순위번호</th>
                  <th>등기목적</th>
                  <th>접수정보</th>
                  <th>주요등기사항</th>
                </tr>
              </thead>
              <tbody>
                {data.ownership_other_entries.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="center">{entry.rank_number}</td>
                    <td>{entry.purpose}</td>
                    <td className="nowrap">{entry.receipt_info}</td>
                    <td style={{ whiteSpace: 'pre-line' }}>{entry.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="rights-empty">- 기록사항 없음</p>
          )}
        </div>

        <div className="rights-section">
          <h4 className="rights-section-title">3. (근)저당권 및 전세권 등 (을구)</h4>
          {data.mortgage_entries.length > 0 ? (
            <table className="rights-table">
              <thead>
                <tr>
                  <th>순위번호</th>
                  <th>등기목적</th>
                  <th>접수정보</th>
                  <th>주요등기사항</th>
                  <th>대상소유자</th>
                </tr>
              </thead>
              <tbody>
                {data.mortgage_entries.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="center">{entry.rank_number}</td>
                    <td>{entry.purpose}</td>
                    <td className="nowrap" style={{ whiteSpace: 'pre-line' }}>{entry.receipt_info}</td>
                    <td style={{ whiteSpace: 'pre-line' }}>{entry.main_details}</td>
                    <td>{entry.target_owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="rights-empty">- 기록사항 없음</p>
          )}
        </div>
      </div>
    </div>
  );
}
