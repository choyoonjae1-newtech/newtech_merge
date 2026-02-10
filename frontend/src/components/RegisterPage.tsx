import { useState } from 'react';
import { register } from '../api/auth';
import './RegisterPage.css';

interface RegisterPageProps {
  onBack: () => void;
}

interface RegisterForm {
  user_id: string;
  password: string;
  passwordConfirm: string;
  company_name: string;
  ceo_name: string;
  business_number: string;
  phone: string;
}

export default function RegisterPage({ onBack }: RegisterPageProps) {
  const [form, setForm] = useState<RegisterForm>({
    user_id: '',
    password: '',
    passwordConfirm: '',
    company_name: '',
    ceo_name: '',
    business_number: '',
    phone: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { user_id, password, passwordConfirm, company_name, ceo_name, business_number, phone } = form;

    if (!user_id || !password || !company_name || !ceo_name || !business_number || !phone) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await register({ user_id, password, company_name, ceo_name, business_number, phone });

      if (data.status === 'success') {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        onBack();
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <img src="/capital_CI.png" alt="JB우리캐피탈" className="register-logo" />
          <p>대부업체 회원가입</p>
        </div>

        <div className="register-form">
          <h3>계정 정보</h3>
          <div className="register-row">
            <div className="register-field">
              <label>아이디 *</label>
              <input
                value={form.user_id}
                onChange={(e) => handleChange('user_id', e.target.value)}
                placeholder="아이디"
                disabled={loading}
              />
            </div>
          </div>
          <div className="register-row">
            <div className="register-field">
              <label>비밀번호 *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="비밀번호"
                disabled={loading}
              />
            </div>
            <div className="register-field">
              <label>비밀번호 확인 *</label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                placeholder="비밀번호 확인"
                disabled={loading}
              />
            </div>
          </div>

          <h3>업체 정보</h3>
          <div className="register-row">
            <div className="register-field">
              <label>대부업체명 *</label>
              <input
                value={form.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="예) 파란캐피탈대부"
                disabled={loading}
              />
            </div>
            <div className="register-field">
              <label>대표이사명 *</label>
              <input
                value={form.ceo_name}
                onChange={(e) => handleChange('ceo_name', e.target.value)}
                placeholder="대표이사 성명"
                disabled={loading}
              />
            </div>
          </div>
          <div className="register-row">
            <div className="register-field">
              <label>사업자등록번호 *</label>
              <input
                value={form.business_number}
                onChange={(e) => handleChange('business_number', e.target.value)}
                placeholder="000-00-00000"
                disabled={loading}
              />
            </div>
            <div className="register-field">
              <label>연락처 *</label>
              <input
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="02-0000-0000"
                disabled={loading}
              />
            </div>
          </div>

          {error && <p className="register-error">{error}</p>}

          <div className="register-actions">
            <button className="back-btn" onClick={onBack} disabled={loading}>
              돌아가기
            </button>
            <button className="register-btn" onClick={handleRegister} disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
