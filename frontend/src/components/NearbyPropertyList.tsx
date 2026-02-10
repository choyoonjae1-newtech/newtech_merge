import type { NearbyPropertyTrends } from '@/types/loan';

interface NearbyPropertyListProps {
  data: NearbyPropertyTrends | null | undefined;
}

export default function NearbyPropertyList({ data }: NearbyPropertyListProps) {
  if (!data || data.similar_properties.length === 0) return null;

  const formatPrice = (value: number): string => {
    const eok = value / 100000000;
    if (eok >= 1) {
      return eok % 1 === 0 ? `${eok.toFixed(0)}억` : `${eok.toFixed(1)}억`;
    }
    return `${(value / 10000).toLocaleString()}만`;
  };

  return (
    <div className="info-card">
      <h3>인근 유사 물건지 목록</h3>
      <div className="info-content">
        <table className="rights-table">
          <thead>
            <tr>
              <th>시도</th>
              <th>시군구</th>
              <th>단지명</th>
              <th>년식</th>
              <th>세대수</th>
              <th>평형</th>
              <th>최근 거래가</th>
              <th>3개월 변동</th>
            </tr>
          </thead>
          <tbody>
            {data.similar_properties.map((prop, idx) => (
              <tr key={idx}>
                <td>{prop.sido}</td>
                <td>{prop.sigungu}</td>
                <td>{prop.name}</td>
                <td className="center">{prop.age}년</td>
                <td className="center">{prop.units.toLocaleString()}</td>
                <td className="center">{prop.area}평</td>
                <td className="center">{formatPrice(prop.recent_price)}</td>
                <td
                  className="center"
                  style={{ color: prop.price_change_rate >= 0 ? '#EF5350' : '#3498DB', fontWeight: 600 }}
                >
                  {prop.price_change_rate >= 0 ? '+' : ''}{(prop.price_change_rate * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
