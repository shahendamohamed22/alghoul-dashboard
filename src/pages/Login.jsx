import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/');
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="bg-white rounded-4 shadow p-4" style={{ width: 380 }}>
        <div className="text-center mb-4">
          <div className="bg-brand-dark text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
            <i className="fa-solid fa-cow fs-4"></i>
          </div>
          <h4 className="fw-bold mb-0">El-Ghoul Admin</h4>
          <div className="text-muted small">تسجيل الدخول للوحة التحكم</div>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small">البريد الإلكتروني</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label small">كلمة المرور</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn bg-brand-dark text-white w-100" disabled={loading}>
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}