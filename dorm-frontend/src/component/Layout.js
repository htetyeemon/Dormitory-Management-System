import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { studentId } = useParams();

  const id = studentId || user?.id; // fallback if no param in URL

  const isActiveLink = (path) => location.pathname === path || location.pathname.startsWith(path);

  const navLinkStyle = (isActive) => ({
    color: isActive ? 'white' : '#cbd5e1',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f7f8', fontFamily: 'Inter, sans-serif' }}>
      <header style={{
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>DormMS</div>

        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to={`/student/${id}/dashboard`} style={navLinkStyle(isActiveLink(`/student/${id}/dashboard`))}>
            Dashboard
          </Link>
          <Link to={`/student/${id}/room`} style={navLinkStyle(isActiveLink(`/student/${id}/room`))}>
            My Room
          </Link>
          <Link to={`/student/${id}/services`} style={navLinkStyle(isActiveLink(`/student/${id}/services`))}>
            Services
          </Link>
          <Link to={`/student/${id}/announcements`} style={navLinkStyle(isActiveLink(`/student/${id}/announcements`))}>
            Announcements
          </Link>
          <Link to={`/student/${id}/checkin`} style={navLinkStyle(isActiveLink(`/student/${id}/checkin`))}>
            Check-in/Out
          </Link>

          {/* Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginLeft: '1rem',
            paddingLeft: '1rem',
            borderLeft: '1px solid #475569',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
            }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <span>{user.name || 'User'}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Student</span>
            </div>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer style={{
        backgroundColor: '#1e293b',
        color: 'white',
        textAlign: 'center',
        padding: '1.5rem',
        fontSize: '0.875rem',
      }}>
        © 2024 Dormitory Management System. Version 1.0.0
      </footer>
    </div>
  );
};

export default Layout;
