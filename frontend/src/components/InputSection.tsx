import { useState } from 'react';
import AutocompleteInput from './AutocompleteInput';

declare global {
  interface Window {
    daum: any;
  }
}

interface InputSectionProps {
  onAnalyze: (company: string, address: string, amount: number, interestRate: number, duration: number) => void;
  loading: boolean;
}

export default function InputSection({ onAnalyze, loading }: InputSectionProps) {
  const [company, setCompany] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [addressDetail, setAddressDetail] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('7.5');
  const [duration, setDuration] = useState<string>('12');

  const fullAddress = addressDetail ? `${address} ${addressDetail}` : address;

  const handleSubmit = () => {
    if (!company || !address || !amount) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    onAnalyze(company, fullAddress, Number(amount), Number(interestRate), Number(duration));
  };

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        setAddress(data.address);
        setAddressDetail('');
      }
    }).open();
  };

  return (
    <div className="input-section">
      <AutocompleteInput
        label="업체명"
        value={company}
        onChange={setCompany}
        field="company"
        placeholder="예시) 파란캐피탈대부"
        disabled={loading}
      />

      <div className="input-group">
        <label>담보주소</label>
        <div className="address-input-row">
          <input
            type="text"
            value={address}
            placeholder="주소 검색 버튼을 클릭하세요"
            disabled={loading}
            readOnly
          />
          <button
            type="button"
            className="address-search-btn"
            onClick={openAddressSearch}
            disabled={loading}
          >
            주소 검색
          </button>
        </div>
        {address && (
          <input
            type="text"
            className="address-detail-input"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            placeholder="상세주소 입력 (동/호수)"
            disabled={loading}
          />
        )}
      </div>

      <div className="input-group">
        <label>대출신청금액</label>
        <div className="amount-input">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="800000000"
            disabled={loading}
          />
          <span className="unit">원</span>
        </div>
      </div>

      <div className="input-group">
        <label>금리</label>
        <div className="amount-input">
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            step="0.1"
            min="0"
            max="100"
            disabled={loading}
          />
          <span className="unit">%</span>
        </div>
      </div>

      <div className="input-group">
        <label>대출기간</label>
        <div className="amount-input">
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={loading}
            className="duration-select"
          >
            <option value="6">6개월</option>
            <option value="12">12개월</option>
            <option value="18">18개월</option>
            <option value="24">24개월</option>
            <option value="36">36개월</option>
            <option value="48">48개월</option>
            <option value="60">60개월</option>
          </select>
        </div>
      </div>

      <button
        className="analyze-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '분석중...' : '분석'}
      </button>
    </div>
  );
}
