import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import api from './api';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('RESIDENT');
  const [roomNo, setRoomNo] = useState('');



  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const toggleMode = (e) => {
    e.preventDefault();
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setRole('RESIDENT');
    setRoomNo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email, password }
        : { email, password, name: fullName, phone, role, flatNumber: roomNo };

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data = null;
      try { data = JSON.parse(text); } catch (e) {}

      if (!response.ok) {
        if (response.status === 504 || response.status === 502) {
          throw new Error('Could not reach the server. Ensure the backend is running.');
        }
        throw new Error((data && (data.message || data.error)) || `Authentication failed: ${response.status}`);
      }

      if (isLogin) {
        const token = data?.token || (data && data.jwt) || data;
        if (typeof token === 'string') localStorage.setItem('token', token);
        else if (token && token.accessToken) localStorage.setItem('token', token.accessToken);
        if (data?.name) localStorage.setItem('name', data.name);
        if (data?.email) localStorage.setItem('email', data.email);
        if (data && data.role) {
          localStorage.setItem('role', data.role);
          if (data.role === 'RESIDENT') navigate('/resident');
          else if (data.role === 'WORKER') navigate('/worker');
          else navigate('/app');
        } else {
          navigate('/app');
        }
      } else {
        setSuccess('Registration successful. Please log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-container">
      {/* Top Navbar */}
      <header className="heron-navbar" style={{ position: 'relative', maxWidth: '100%' }}>
        <div className="heron-logo-cell">
          <span className="logo-text">Society</span>
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18"></path>
            <path d="M9 8h1"></path>
            <path d="M9 12h1"></path>
            <path d="M9 16h1"></path>
            <path d="M14 8h1"></path>
            <path d="M14 12h1"></path>
            <path d="M14 16h1"></path>
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
          </svg>
        </div>
      </header>

      <div className="auth-wrapper">
        <div className="auth-box">
          <div className="auth-panel-left">
            <div className="section-label" style={{ fontSize: '0.75rem' }}>
              {isLogin ? 'Authentication' : 'Registration'}
            </div>

            <h1 className="auth-header">
              {isLogin ? 'Welcome back.' : 'Create account.'}
            </h1>

            <div className="auth-subheader">
              {isLogin
                ? 'Log in to manage complaints, bills, and society services.'
                : 'Join your society to stay connected and resolve issues.'}
            </div>

            {error && (
              <div style={{ color: '#991b1b', marginBottom: '1.5rem', fontSize: '0.9rem', padding: '0.75rem 1rem', background: '#fee2e2', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ color: '#166534', marginBottom: '1.5rem', fontSize: '0.9rem', padding: '0.75rem 1rem', background: '#dcfce7', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label className="form-label">role</label>
                    <select
                      className="form-input"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{ background: 'transparent' }}
                    >
                      <option value="RESIDENT">Resident</option>
                      <option value="WORKER">Worker</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">full_name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">phone_number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  {role === 'RESIDENT' && (
                    <div className="form-group">
                      <label className="form-label">room_no</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. R-101"
                        value={roomNo}
                        onChange={(e) => setRoomNo(e.target.value)}
                        required={!isLogin && role === 'RESIDENT'}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="form-group">
                <label className="form-label">email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-pill" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem 1.5rem', marginTop: '0.5rem' }}>
                {loading ? 'Processing...' : (isLogin ? 'Sign in →' : 'Create account →')}
              </button>
            </form>

            <div className="auth-switch">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <span className="auth-switch-link" onClick={toggleMode}>
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </div>
          </div>

          <div className="auth-panel-right">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400, lineHeight: 1, marginBottom: '1.5rem' }}>
              Smart living for modern societies.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              A seamless platform to connect residents, manage complaints, and streamline society operations.
            </p>
            <div style={{ marginTop: '3rem', display: 'flex', gap: '2.5rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: 1 }}>99%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Issue resolution</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: 1 }}>24h</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Avg. response</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
