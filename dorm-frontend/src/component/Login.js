import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBuildingUser} from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(id, password, userType);
    
    if (result.success) {
      navigate(userType === 'manager' ? '/manager/'+id+'/dashboard': '/student/'+id+'/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e8c8b5ff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf7f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '28rem', 
        width: '100%',
        ...cardStyle,
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem'}}>
            <span style={{ 
              fontSize: '4.5rem',
              color: '#7d2923'
              , paddingBottom:'0.2rem'
            }}>
              <FontAwesomeIcon icon={faBuildingUser} />
            </span>
          </div>
          <h2 style={{
            marginTop: '0.2rem',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#000000',
            lineHeight: 1.25,
            letterSpacing: '-0.033em',
            marginBottom: '0.5rem'
          }}>
            Sign in to DormMS
          </h2>
          <p style={{
            marginTop: '0.5rem',
            fontSize: '1rem',
            color: '#191919ff',
            fontWeight: 400
          }}>
            Dormitory Management System
          </p>
        </div>
        
        <form style={{ marginTop: '2rem' }} onSubmit={handleSubmit}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="userType" style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 500,
              color: '#000000',
              marginBottom: '0.5rem'
            }}>
              I am a
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7d2923';
                e.target.style.boxShadow = '0 0 0 3px rgba(125, 41, 35, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="student">Student</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="id" style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 500,
              color: '#000000',
              marginBottom: '0.5rem'
            }}>
              ID
            </label>
            <input
              id="id"
              name="id"
              type="text"
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              placeholder="Enter your ID"
              onFocus={(e) => {
                e.target.style.borderColor = '#7d2923';
                e.target.style.boxShadow = '0 0 0 3px rgba(125, 41, 35, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 500,
              color: '#000000',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              placeholder="Enter your password"
              onFocus={(e) => {
                e.target.style.borderColor = '#7d2923';
                e.target.style.boxShadow = '0 0 0 3px rgba(125, 41, 35, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '0.5rem 1rem',
                border: '1px solid transparent',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                fontWeight: 500,
                color: 'white',
                backgroundColor: loading ? '#9ca3af' : '#7d2923',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#69301cff';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#7d2923';
              }}
              onFocus={(e) => {
                if (!loading) e.target.style.boxShadow = '0 0 0 3px rgba(125, 41, 35, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;