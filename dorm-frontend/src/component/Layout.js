import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { studentId, managerId } = useParams();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Determine ID based on user type and URL params
    const id = user?.userType === 'manager'
        ? (managerId || user?.id)
        : (studentId || user?.id);

    const isActiveLink = (path) => location.pathname === path || location.pathname.startsWith(path);

    const navLinkStyle = (isActive) => ({
        color: isActive ? 'white' : '#e2d6cf',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'all 0.2s ease-in-out',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.375rem',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    });

    // Generate navigation links based on user type
    const getNavigationLinks = () => {
        if (user?.userType === 'manager') {
            return (
                <>
                    <Link to={`/manager/${id}/dashboard`}
                        style={navLinkStyle(isActiveLink(`/manager/${id}/dashboard`))}>
                        Dashboard
                    </Link>
                    <Link to={`/manager/${id}/rooms`}
                        style={navLinkStyle(isActiveLink(`/manager/${id}/rooms`))}>
                        Rooms
                    </Link>
                    <Link to={`/manager/${id}/complaints`}
                        style={navLinkStyle(isActiveLink(`/manager/${id}/complaints`))}>
                        Complaints
                    </Link>
                    <Link to={`/manager/${id}/announcements`}
                        style={navLinkStyle(isActiveLink(`/manager/${id}/announcements`))}>
                        Announcements
                    </Link>
                    <Link to={`/manager/${id}/checkinout`}
                        style={navLinkStyle(isActiveLink(`/manager/${id}/checkinout`))}>
                        Check In/Out
                    </Link>
                </>
            );
        } else {
            // Student navigation
            return (
                <>
                    <Link to={`/student/${id}/dashboard`}
                        style={navLinkStyle(isActiveLink(`/student/${id}/dashboard`))}>
                        Dashboard
                    </Link>
                    <Link to={`/student/${id}/room`}
                        style={navLinkStyle(isActiveLink(`/student/${id}/room`))}>
                        My Room
                    </Link>
                    <Link to={`/student/${id}/services`}
                        style={navLinkStyle(isActiveLink(`/student/${id}/services`))}>
                        Services
                    </Link>
                    <Link to={`/student/${id}/announcements`}
                        style={navLinkStyle(isActiveLink(`/student/${id}/announcements`))}>
                        Announcements
                    </Link>
                    <Link to={`/student/${id}/checkin`}
                        style={navLinkStyle(isActiveLink(`/student/${id}/checkin`))}>
                        Check-in/Out
                    </Link>
                </>
            );
        }
    };

    const handleProfileClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowDropdown(false);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getUserRoleText = () => {
        return user?.userType === 'manager' ? 'Manager' : 'Student';
    };

    const getUserEmail = () => {
        return user?.email || (user?.userType === 'manager'
            ? 'manager@dormitory.edu'
            : 'student@university.edu');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#faf7f5', fontFamily: 'Inter, sans-serif' }}>
            <header style={{
                backgroundColor: '#7d2923',
                color: 'white',
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f3efecff' }}>MFUDorm</div>

                <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {getNavigationLinks()}

                    {/* Profile with Dropdown */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginLeft: '1rem',
                                paddingLeft: '1rem',
                                borderLeft: '1px solid #5d4037',
                                cursor: 'pointer',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.375rem',
                                transition: 'background-color 0.2s ease-in-out',
                            }}
                            onClick={handleProfileClick}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#8d6e63',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                color: 'white',
                                fontSize: '0.875rem',
                            }}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{user?.name || 'User'}</span>
                                <span style={{ fontSize: '0.75rem', color: '#bcaaa4' }}>{getUserRoleText()}</span>
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                transition: 'transform 0.2s ease-in-out',
                                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}>
                                ▼
                            </span>
                        </div>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                backgroundColor: 'white',
                                border: '1px solid #d7ccc8',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                minWidth: '160px',
                                zIndex: 50,
                            }}>
                                <div style={{
                                    padding: '0.5rem',
                                    borderBottom: '1px solid #f5f5f5',
                                }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#2c1810',
                                        padding: '0.5rem 0.75rem',
                                    }}>
                                        {user?.name || 'User'}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#8d6e63',
                                        padding: '0 0.75rem 0.5rem',
                                    }}>
                                        {getUserEmail()}
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#d84315',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease-in-out',
                                        borderBottomLeftRadius: '0.5rem',
                                        borderBottomRightRadius: '0.5rem',
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>↩</span>
                                        <span>Logout</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main>{children}</main>

            <footer style={{
                backgroundColor: '#7d2923',
                color: '#e2d6cf',
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