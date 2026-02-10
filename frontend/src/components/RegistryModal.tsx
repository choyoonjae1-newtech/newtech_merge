import type { RegistryModalData } from '@/types/loan';

interface RegistryModalProps {
  data: RegistryModalData | null | undefined;
  onClose: () => void;
}

export default function RegistryModal({ data, onClose }: RegistryModalProps) {
  if (!data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content registry-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>등기부등본</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="registry-document">
            <div className="registry-title">
              <h3>부동산 등기부등본 (말소사항 포함)</h3>
              <p className="registry-address">{data.address}</p>
            </div>

            <div className="registry-section">
              <h4 className="section-title">【갑 구】 (소유권에 관한 사항)</h4>
              <table className="registry-table">
                <thead>
                  <tr>
                    <th>순위번호</th>
                    <th>등기목적</th>
                    <th>접수</th>
                    <th>권리자 및 기타사항</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>소유권보존</td>
                    <td>2015년 3월 12일<br/>제12345호</td>
                    <td>소유자: {data.owner || '주식회사 은마건설'}<br/>주소: 서울시 강남구</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>소유권이전</td>
                    <td>{data.gap_section.match(/\d{4}\.\d{2}\.\d{2}/)?.[0] || '2020.03.15'}<br/>제23456호</td>
                    <td>원인: 매매<br/>소유자: 홍길동<br/>주민등록번호: 801234-1******</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="registry-section">
              <h4 className="section-title">【을 구】 (소유권 이외의 권리에 관한 사항)</h4>
              <table className="registry-table">
                <thead>
                  <tr>
                    <th>순위번호</th>
                    <th>등기목적</th>
                    <th>접수</th>
                    <th>권리자 및 기타사항</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>근저당권설정</td>
                    <td>2020년 3월 20일<br/>제34567호</td>
                    <td>
                      <strong>{data.eul_section}</strong><br/>
                      채무자: 홍길동<br/>
                      근저당권자: {data.eul_section.match(/[가-힣]+은행/)?.[0] || 'KB국민은행'}<br/>
                      채권최고액: {data.eul_section.match(/\d+억/)?.[0] || '6억'}원
                    </td>
                  </tr>
                  {data.seizure && (
                    <tr className="warning-row">
                      <td>2</td>
                      <td>가압류</td>
                      <td>2023년 8월 15일<br/>제45678호</td>
                      <td className="warning">
                        <strong>가압류 1건 존재</strong><br/>
                        채권자: ○○건설 주식회사<br/>
                        채권금액: 5000만원
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="registry-footer">
              <p>위 등기사항은 등기부의 일부를 발급한 것으로서 등기부의 전부가 아닙니다.</p>
              <p>발급일자: {new Date().toLocaleDateString('ko-KR')}</p>
              <p>발급번호: {Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}</p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}
