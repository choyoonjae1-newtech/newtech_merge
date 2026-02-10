import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { NearbyPropertyTrends } from '@/types/loan';

interface NearbyPropertyMapProps {
  data: NearbyPropertyTrends | null | undefined;
  targetAddress: string;
}

export default function NearbyPropertyMap({ data, targetAddress }: NearbyPropertyMapProps) {
  if (!data) return null;

  const formatPrice = (value: number): string => `${(value / 100000000).toFixed(1)}억`;
  const formatRate = (rate: number): string => {
    const pct = (rate * 100).toFixed(1);
    return rate >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const center: [number, number] = [data.target_lat, data.target_lng];

  return (
    <div className="info-card">
      <h3>인근 유사 물건지 동향</h3>
      <div className="nearby-map-container" style={{ height: '360px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* 대상 물건 - 빨간 점 */}
          <CircleMarker
            center={center}
            radius={10}
            pathOptions={{ color: '#EF5350', fillColor: '#EF5350', fillOpacity: 0.85, weight: 2 }}
          >
            <Tooltip direction="top">
              <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                <strong>대상 물건</strong><br/>
                {targetAddress}
              </div>
            </Tooltip>
          </CircleMarker>
          {/* 유사 물건 5개 - 파란 점 */}
          {data.similar_properties.map((prop, idx) => (
            <CircleMarker
              key={idx}
              center={[prop.lat, prop.lng]}
              radius={8}
              pathOptions={{ color: '#006FBD', fillColor: '#006FBD', fillOpacity: 0.75, weight: 2 }}
            >
              <Tooltip direction="top">
                <div style={{ fontSize: '12px', lineHeight: 1.6, minWidth: '160px' }}>
                  <strong>{prop.name}</strong><br/>
                  {prop.units}세대 / {prop.age}년 / {prop.area}평<br/>
                  최근가: {formatPrice(prop.recent_price)}<br/>
                  3개월 변동:{' '}
                  <span style={{ color: prop.price_change_rate >= 0 ? '#E74C3C' : '#3498DB', fontWeight: 600 }}>
                    {formatRate(prop.price_change_rate)}
                  </span>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="nearby-map-legend">
        <span className="legend-item">
          <span className="legend-dot target"></span> 대상 물건
        </span>
        <span className="legend-item">
          <span className="legend-dot similar"></span> 유사 물건 ({data.similar_properties.length}건)
        </span>
      </div>
    </div>
  );
}
