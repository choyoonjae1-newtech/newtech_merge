import {
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { CreditDataWithHistory } from '@/types/loan';

interface PriceChartsProps {
  data: CreditDataWithHistory | null | undefined;
  loanDuration?: number;
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  price: number;
}

interface JbDataPoint {
  date: string;
  dateLabel: string;
  jbPrice?: number;
  predictedPrice?: number;
  type: string;
}

export default function PriceCharts({ data, loanDuration = 12 }: PriceChartsProps) {
  if (!data) return null;

  const formatPrice = (value: number): string => {
    return `${(value / 100000000).toFixed(1)}억`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatYearMonth = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const kbData: ChartDataPoint[] = data.kb_price.history.map(point => ({
    date: point.date,
    dateLabel: formatDate(point.date),
    price: point.price
  }));

  const molitData: ChartDataPoint[] = data.molit_transactions.history.map(point => ({
    date: point.date,
    dateLabel: formatDate(point.date),
    price: point.price
  }));

  const naverData: ChartDataPoint[] = data.naver_listings.history.map(point => ({
    date: point.date,
    dateLabel: formatDate(point.date),
    price: point.price
  }));

  // JB 적정 시세 계산
  const buildJbFairPriceData = () => {
    const kbHistory = data.kb_price.history;
    const molitHistory = data.molit_transactions.history;
    const naverHistory = data.naver_listings.history;

    // 각 소스의 평균 가격 계산
    const kbAvg = kbHistory.reduce((sum, p) => sum + p.price, 0) / kbHistory.length;
    const molitAvg = molitHistory.reduce((sum, p) => sum + p.price, 0) / molitHistory.length;
    const naverAvg = naverHistory.reduce((sum, p) => sum + p.price, 0) / naverHistory.length;

    // 월별로 JB 적정 시세 계산 (KB*0.3 + 실거래가*0.6 + 매매호가*0.1)
    // KB는 월별 데이터가 있으므로 기준으로 사용
    const historicalData: JbDataPoint[] = kbHistory.map((kbPoint, idx) => {
      const kbPrice = kbPoint.price;
      // 같은 시기의 실거래가/호가가 없으면 평균 사용
      const molitPrice = molitHistory[idx]?.price || molitAvg;
      const naverPrice = naverHistory[idx]?.price || naverAvg;
      const jbPrice = Math.round(kbPrice * 0.3 + molitPrice * 0.6 + naverPrice * 0.1);

      return {
        date: kbPoint.date,
        dateLabel: formatYearMonth(kbPoint.date),
        jbPrice,
        type: 'actual'
      };
    });

    // 최신 JB 적정 시세
    const latestJbPrice = historicalData[historicalData.length - 1]?.jbPrice || 0;

    // 최근 매매호가 vs 실거래가 비교 -> 추세 결정
    const latestNaverPrice = naverHistory[naverHistory.length - 1]?.price || naverAvg;
    const latestMolitPrice = molitHistory[molitHistory.length - 1]?.price || molitAvg;
    const isUptrend = latestNaverPrice > latestMolitPrice;
    const annualRate = isUptrend ? 0.05 : -0.05;
    const monthlyRate = annualRate / 12;

    // 예측 데이터 생성 (대출기간만큼)
    const lastDate = new Date(kbHistory[kbHistory.length - 1].date);
    const predictionData: JbDataPoint[] = [];

    // 실측 마지막 포인트를 예측 시작점에도 추가 (연결을 위해)
    for (let m = 1; m <= loanDuration; m++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + m);
      const predictedPrice = Math.round(latestJbPrice * Math.pow(1 + monthlyRate, m));

      predictionData.push({
        date: futureDate.toISOString().split('T')[0],
        dateLabel: formatYearMonth(futureDate.toISOString().split('T')[0]),
        predictedPrice: predictedPrice,
        type: 'predicted'
      });
    }

    // 실측 마지막 점에 predictedPrice도 넣어 이음새 연결
    const lastHistorical = { ...historicalData[historicalData.length - 1], predictedPrice: latestJbPrice };
    historicalData[historicalData.length - 1] = lastHistorical;

    // 3개월 간격으로 샘플링 (너무 촘촘하지 않게)
    const sampledPrediction = predictionData.filter((_, idx) => idx % 3 === 0 || idx === predictionData.length - 1);

    const combined = [...historicalData, ...sampledPrediction];

    return { combined, isUptrend, latestJbPrice, annualRate };
  };

  const { combined: jbData, isUptrend, latestJbPrice } = buildJbFairPriceData();

  // 3개 차트 공통 Y축 범위 (KB, 실거래가, 매매호가)
  const allPrices = [
    ...kbData.map(d => d.price),
    ...molitData.map(d => d.price),
    ...naverData.map(d => d.price),
  ];
  const priceMin = Math.min(...allPrices);
  const priceMax = Math.max(...allPrices);
  const priceMargin = Math.max(Math.round((priceMax - priceMin) * 0.15), 50000000);
  const sharedYMin = Math.max(0, Math.floor((priceMin - priceMargin) / 100000000) * 100000000);
  const sharedYMax = Math.ceil((priceMax + priceMargin) / 100000000) * 100000000;

  // JB 적정 시세 차트 Y축 오토스케일
  const jbPrices = jbData.map(d => d.jbPrice ?? d.predictedPrice ?? 0).filter(v => v > 0);
  const jbMin = Math.min(...jbPrices);
  const jbMax = Math.max(...jbPrices);
  const jbMargin = Math.max(Math.round((jbMax - jbMin) * 0.15), 50000000);
  const jbYMin = Math.max(0, Math.floor((jbMin - jbMargin) / 100000000) * 100000000);
  const jbYMax = Math.ceil((jbMax + jbMargin) / 100000000) * 100000000;

  const JbTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{d.date}</p>
          {d.jbPrice && <p className="tooltip-value" style={{ color: '#FF8C00' }}>JB 적정시세: {formatPrice(d.jbPrice)}</p>}
          {d.predictedPrice && d.type === 'predicted' && (
            <p className="tooltip-value" style={{ color: isUptrend ? '#E74C3C' : '#3498DB' }}>
              예측: {formatPrice(d.predictedPrice)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{dataPoint.date}</p>
          <p className="tooltip-value">{formatPrice(dataPoint.price)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="price-charts-grid">
        <div className="chart-box">
          <h4>KB 시세 (추정가)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={kbData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10 }}
                interval={Math.floor(kbData.length / 4)}
              />
              <YAxis
                domain={[sharedYMin, sharedYMax]}
                tickFormatter={formatPrice}
                tick={{ fontSize: 10 }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#006FBD"
                strokeWidth={2}
                dot={false}
                name="KB시세"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h4>국토교통부 실거래가</h4>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10 }}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                dataKey="price"
                domain={[sharedYMin, sharedYMax]}
                tickFormatter={formatPrice}
                tick={{ fontSize: 10 }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={molitData}
                fill="#7DCCE5"
                name="실거래가"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h4>네이버페이 부동산 매매호가</h4>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10 }}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                dataKey="price"
                domain={[sharedYMin, sharedYMax]}
                tickFormatter={formatPrice}
                tick={{ fontSize: 10 }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={naverData}
                fill="#051C48"
                name="매매호가"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* JB 적정 시세 산출 그래프 */}
      <div className="chart-box jb-fair-price-chart">
        <div className="jb-chart-header">
          <h4>JB 적정 시세 산출</h4>
          <div className="jb-chart-info">
            <span className="jb-formula">KB시세×0.3 + 실거래가×0.6 + 매매호가×0.1</span>
            <span className="jb-current-price">현재 적정시세: <strong>{formatPrice(latestJbPrice)}</strong></span>
            <span className={`jb-trend ${isUptrend ? 'up' : 'down'}`}>
              {isUptrend ? '▲ 상승추세 (연 5%)' : '▼ 하락추세 (연 5%)'}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={jbData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10 }}
              interval={Math.floor(jbData.length / 6)}
            />
            <YAxis
              domain={[jbYMin, jbYMax]}
              tickFormatter={formatPrice}
              tick={{ fontSize: 10 }}
              width={65}
            />
            <Tooltip content={<JbTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
            />
            <Line
              type="monotone"
              dataKey="jbPrice"
              stroke="#FF8C00"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#FF8C00' }}
              name="JB 적정시세"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predictedPrice"
              stroke={isUptrend ? '#E74C3C' : '#3498DB'}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: isUptrend ? '#E74C3C' : '#3498DB', strokeDasharray: '' }}
              name={`예측 (${loanDuration}개월, ${isUptrend ? '+' : '-'}5%/년)`}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
