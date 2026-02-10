import { useState, useEffect } from 'react';
import { User } from '../types/loan';
import { submitApplication, getApplications } from '../api/applications';
import { analyzeProperty } from '../api/analysis';
import './CustomerDashboard.css';

declare global {
  interface Window {
    daum: any;
  }
}

interface CustomerDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Application {
  id: string;
  property_address: string;
  loan_amount: number;
  loan_duration: number;
  created_at: string;
  status: string;
}

export default function CustomerDashboard({ user, onLogout }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'apply' | 'history'>('apply');
  const [address, setAddress] = useState<string>('');
  const [addressDetail, setAddressDetail] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [duration, setDuration] = useState<string>('12');
  const [applications, setApplications] = useState<Application[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      const data = await getApplications(user.user_id);
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const handleSubmit = async () => {
    if (!address || !amount || !duration) {
      alert('담보물건 주소, 신청금액, 대출기간을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitApplication({
        applicant_id: user.user_id,
        company_name: user.company_name,
        ceo_name: user.ceo_name,
        property_address: addressDetail ? `${address} ${addressDetail}` : address,
        loan_amount: parseInt(amount),
        loan_duration: parseInt(duration)
      });
      if (data.status === 'success') {
        alert('대출 신청이 완료되었습니다.');
        setAddress('');
        setAddressDetail('');
        setAmount('');
        setDuration('12');
        setActiveTab('history');
      }
    } catch (err) {
      alert('서버에 연결할 수 없습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatAmount = (value: number): string => {
    if (!value) return '-';
    const billions = value / 100000000;
    return `${billions.toFixed(1)}억원`;
  };

  const getStatusBadge = (status: string): React.CSSProperties => {
    const colors: Record<string, string> = {
      '접수완료': '#006FBD',
      '심사중': '#051C48',
      '승인': '#20c997',
      '반려': '#EF5350'
    };
    return {
      backgroundColor: colors[status] || '#999',
      color: '#FFFFFF',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600'
    };
  };

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <img
            src="/capital_CI.png"
            alt="JB우리캐피탈"
            className="header-logo clickable"
            onClick={() => setActiveTab('history')}
          />
          <span className="header-divider">|</span>
          <h1>대출 신청</h1>
        </div>
        <div className="header-right">
          <span className="user-info">{user.company_name} ({user.ceo_name})</span>
          <button className="logout-btn" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <div className="dashboard-body">
        <nav className="sidebar">
          <button
            className={`sidebar-btn ${activeTab === 'apply' ? 'active' : ''}`}
            onClick={() => setActiveTab('apply')}
          >
            대출 신청
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            신청 내역
          </button>
        </nav>

        <div className="dashboard-content">
        {activeTab === 'apply' && (
          <div className="apply-section">
            <div className="apply-card">
              <h2>대출 신청 정보 입력</h2>

              <div className="apply-info-box">
                <h3>신청 업체 정보</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">대부업체명</span>
                    <span className="info-value">{user.company_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">대표이사</span>
                    <span className="info-value">{user.ceo_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">사업자등록번호</span>
                    <span className="info-value">{user.business_number}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">연락처</span>
                    <span className="info-value">{user.phone}</span>
                  </div>
                </div>
              </div>

              <div className="apply-form-box">
                <h3>담보 물건 정보</h3>
                <div className="apply-field">
                  <label>담보물건 주소 *</label>
                  <div className="address-input-row">
                    <input
                      value={address}
                      placeholder="주소 검색 버튼을 클릭하세요"
                      disabled={submitting}
                      readOnly
                    />
                    <button
                      type="button"
                      className="address-search-btn"
                      onClick={() => {
                        new window.daum.Postcode({
                          oncomplete: function(data: any) {
                            setAddress(data.address);
                            setAddressDetail('');
                          }
                        }).open();
                      }}
                      disabled={submitting}
                    >
                      주소 검색
                    </button>
                  </div>
                  {address && (
                    <input
                      className="address-detail-input"
                      value={addressDetail}
                      onChange={(e) => setAddressDetail(e.target.value)}
                      placeholder="상세주소 입력 (동/호수)"
                      disabled={submitting}
                    />
                  )}
                </div>
                <div className="apply-field">
                  <label>대출 신청금액 *</label>
                  <div className="apply-amount-row">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="800000000"
                      disabled={submitting}
                    />
                    <span className="unit">원</span>
                  </div>
                </div>
                <div className="apply-field">
                  <label>신청 대출기간 *</label>
                  <div className="apply-amount-row">
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      disabled={submitting}
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
              </div>

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '신청 중...' : '대출 신청'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <div className="history-card">
              <h2>신청 내역</h2>
              {applications.length === 0 ? (
                <p className="empty-text">신청 내역이 없습니다.</p>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>신청번호</th>
                      <th>담보물건 주소</th>
                      <th>신청금액</th>
                      <th>대출기간</th>
                      <th>신청일시</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td>{app.id}</td>
                        <td>{app.property_address}</td>
                        <td>{formatAmount(app.loan_amount)}</td>
                        <td>{app.loan_duration}개월</td>
                        <td>{app.created_at}</td>
                        <td>
                          <span style={getStatusBadge(app.status)}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
