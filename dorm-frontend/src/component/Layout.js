import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    width: '100%',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
  };

  const containerStyle = {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '4rem',
  };

  const navLinkStyle = {
    color: '#64748b',
    fontWeight: 500,
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f7f8', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={containerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', textDecoration: 'none' }}>
              <span style={{ color: '#1173d4', fontSize: '1.5rem' }}>🏫</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>DormMS</span>
            </a>
            <nav className="md-flex" style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
              <a href="#" style={{ ...navLinkStyle, color: '#0f172a', fontWeight: 600, backgroundColor: '#f1f5f9' }}>
                📊 Dashboard
              </a>
              <a href="#" style={navLinkStyle}>
                🚪 My Room
              </a>
              <a href="#" style={navLinkStyle}>
                🔧 Services
              </a>
              <a href="#" style={navLinkStyle}>
                📢 Announcement
              </a>
              <a href="#" style={navLinkStyle}>
                🔄 Check-in/Out
              </a>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{
              position: 'relative',
              borderRadius: '9999px',
              padding: '0.5rem',
              color: '#475569',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}>
              🔔
              <span style={{
                position: 'absolute',
                top: '0.25rem',
                right: '0.25rem',
                height: '0.5rem',
                width: '0.5rem',
                borderRadius: '9999px',
                backgroundColor: '#ef4444',
              }}></span>
            </button>
            <button 
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
                padding: '0.25rem 0.5rem',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                {user?.name || 'User'}
              </span>
              <div style={{
                height: '2rem',
                width: '2rem',
                borderRadius: '9999px',
                backgroundColor: '#1173d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
              }}>
                👤
              </div>
            </button>
            <button 
              style={{
                display: 'block',
                borderRadius: '0.375rem',
                padding: '0.5rem',
                color: '#475569',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
              className="md-hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div style={{
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            padding: '0.5rem',
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <a href="#" style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                📊 Dashboard
              </a>
              <a href="#" style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                🚪 My Room
              </a>
              <a href="#" style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                🔧 Services
              </a>
              <a href="#" style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                📢 Announcement
              </a>
              <a href="#" style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                🔄 Check-in/Out
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          © 2024 Dormitory Management System. Version 1.0.0
        </p>
      </footer>
    </div>
  );
};

export default Layout;