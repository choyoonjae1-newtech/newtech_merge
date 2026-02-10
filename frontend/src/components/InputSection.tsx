import { useState } from 'react';
import AutocompleteInput from './AutocompleteInput';

declare global {
  interface Window {
    daum: any;
  }
}

interface InputSectionProps {
  onAnalyze: (company: string, address: string, amount: number) => void;
  loading: boolean;
}

export default function InputSection({ onAnalyze, loading }: InputSectionProps) {
  const [company, setCompany] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [addressDetail, setAddressDetail] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const fullAddress = addressDetail ? `${address} ${addressDetail}` : address;

  const handleSubmit = () => {
    if (!company || !address || !amount) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    onAnalyze(company, fullAddress, Number(amount));
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
