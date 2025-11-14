import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuildingUser } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop refresh
    setError('');

    // Basic validation
    if (!id.trim()) return setError('Please enter your ID');
    if (!password.trim()) return setError('Please enter your password');

    // Numeric ID validation for backend Long
    if (isNaN(Number(id))) return setError('ID must be a number');

    setLoading(true);

    try {
      const result = await login(id, password, userType);

      if (result.success) {
        navigate(userType === 'manager' ? `/manager/${id}/dashboard` : `/student/${id}/dashboard`);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf7f5', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '28rem', width: '100%', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e8c8b5ff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <FontAwesomeIcon icon={faBuildingUser} style={{ fontSize: '4.5rem', color: '#7d2923' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginTop: '0.5rem' }}>Sign in to MFUDorm</h2>
          <p style={{ fontSize: '1rem', color: '#191919ff' }}>Dormitory Management System</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="userType" style={{ display: 'block', fontWeight: 500 }}>I am a</label>
            <select id="userType" value={userType} onChange={(e) => setUserType(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}>
              <option value="student">Student</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="id" style={{ display: 'block', fontWeight: 500 }}>ID</label>
            <input type="text" id="id" value={id} onChange={(e) => setId(e.target.value)} placeholder="Enter your ID" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', fontWeight: 500 }}>Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', fontWeight: 500, color: '#fff', backgroundColor: loading ? '#9ca3af' : '#7d2923', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
