import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // Is it the homepage? (We want transparent on homepage, white on others)
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header 
            className={`navbar-premium transition-all ${scrolled ? 'scrolled' : ''} ${isHomePage && !scrolled ? 'glass-nav' : 'solid-nav'}`}
            style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 1000,
                transition: 'all 0.4s ease',
                backgroundColor: scrolled || !isHomePage ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: scrolled || !isHomePage ? 'blur(20px)' : 'blur(15px)',
                WebkitBackdropFilter: scrolled || !isHomePage ? 'blur(20px)' : 'blur(15px)',
                borderBottom: scrolled || !isHomePage ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.4)',
                boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.08)' : '0 4px 30px rgba(0,0,0,0.1)',
                padding: scrolled ? '15px 0' : '20px 0'
            }}
        >
            <div className="page-container d-flex align-items-center justify-content-between">
                <Link to="/" className="navbar-brand text-decoration-none d-flex align-items-center hover-lift">
                    <i className="bi bi-compass-fill me-2" style={{ color: 'var(--primary-color)', fontSize: '1.8rem', transition: 'color 0.3s ease' }}></i>
                    <span style={{ color: 'var(--text-dark)', fontWeight: 800, letterSpacing: '-0.5px', fontSize: '1.4rem', transition: 'color 0.3s ease' }}>Yatrika</span>
                </Link>

                <nav className="d-flex align-items-center gap-3">
                    <Link to="/" className="nav-link-animated d-none d-md-inline text-dark">Explore</Link>
                    <Link to="/hotels" className="nav-link-animated d-none d-md-inline text-dark">Hotels</Link>
                    <Link to="/recommendations" className="nav-link-animated d-none d-md-inline text-dark">Recommendations</Link>

                    {!user && (
                      <div className="d-flex align-items-center ms-2 gap-2">
                        <Link to="/login" className="btn btn-outline-custom px-4 rounded-pill fw-bold hover-lift">Sign in</Link>
                        <Link to="/register" className="btn btn-primary-custom d-none d-md-flex px-4 rounded-pill fw-bold hover-lift">Register</Link>
                        <div className="dropdown d-none d-lg-block ms-2">
                           <button className="btn btn-sm dropdown-toggle border-0 fw-semibold text-muted" type="button" data-bs-toggle="dropdown">
                             For Partners
                           </button>
                           <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg" style={{ borderRadius: 'var(--border-radius-lg)', padding: '10px' }}>
                             <li><Link className="dropdown-item py-2 rounded" to="/register-owner">List your property</Link></li>
                           </ul>
                        </div>
                      </div>
                    )}

                    {user && user.role !== 'HOTEL_OWNER' && user.role !== 'ADMIN' && (
                      <Link to="/my-bookings" className="nav-link-animated d-none d-md-inline text-dark">My Bookings</Link>
                    )}

                    {user && user.role === 'HOTEL_OWNER' && (
                      <Link to="/owner-dashboard" className="nav-link-animated d-none d-md-inline text-dark">Owner Dashboard</Link>
                    )}

                    {user && user.role === 'ADMIN' && (
                      <Link to="/admin-dashboard" className="nav-link-animated d-none d-md-inline text-dark">Admin Dashboard</Link>
                    )}

                    <div className="d-flex align-items-center ms-3">
                      {user && (
                        <button className="btn btn-light rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm hover-lift" style={{ width: '40px', height: '40px', backgroundColor: '#f8f9fa', border: 'none' }} aria-label="notifications">
                            <i className="bi bi-bell-fill text-muted" />
                        </button>
                      )}

                      {user ? (
                        <div className="dropdown">
                          <button className="btn rounded-pill px-3 shadow-sm d-flex align-items-center gap-2 border-0 dropdown-toggle hover-lift" type="button" id="profileMenu" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontWeight: 600, backgroundColor: '#f8f9fa', color: 'var(--text-dark)' }}>
                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '28px', height: '28px', fontSize: '0.8rem', backgroundColor: 'var(--primary-color)' }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="d-none d-md-inline">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg mt-3" aria-labelledby="profileMenu" style={{ borderRadius: 'var(--border-radius-lg)', minWidth: '220px', padding: '10px' }}>
                            <li className="px-3 py-2 text-muted small text-uppercase fw-bold border-bottom mb-2">{user.role}</li>
                            
                            {user.role !== 'HOTEL_OWNER' && user.role !== 'ADMIN' && (
                              <>
                                <li><Link className="dropdown-item py-2 rounded mb-1" to="/profile"><i className="bi bi-person me-3 text-muted"></i>My Profile</Link></li>
                                <li><Link className="dropdown-item py-2 rounded mb-1" to="/my-bookings"><i className="bi bi-journal-bookmark me-3 text-muted"></i>My Bookings</Link></li>
                              </>
                            )}

                            {user.role === 'HOTEL_OWNER' && (
                              <li><Link className="dropdown-item py-2 rounded mb-1" to="/profile"><i className="bi bi-person me-3 text-muted"></i>My Profile</Link></li>
                            )}

                            <li><hr className="dropdown-divider opacity-10 my-2" /></li>
                            <li><button className="dropdown-item py-2 rounded text-danger fw-semibold" onClick={handleLogout}><i className="bi bi-box-arrow-right me-3"></i>Sign out</button></li>
                          </ul>
                        </div>
                      ) : null}
                    </div>
                </nav>
            </div>

            <style>{`
              .nav-link-animated {
                position: relative;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.95rem;
                padding: 0.5rem 0.25rem;
                transition: color 0.3s ease;
              }
              .nav-link-animated::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0;
                height: 2px;
                background-color: var(--gold);
                transition: width 0.3s ease;
              }
              .nav-link-animated:hover::after {
                width: 100%;
              }
              .btn-glass-outline {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.5);
                color: white;
                transition: all 0.3s ease;
              }
              .btn-glass-outline:hover {
                background: rgba(255,255,255,0.1);
                border-color: white;
                color: white;
              }
              .hover-lift {
                transition: transform 0.3s ease;
              }
              .hover-lift:hover {
                transform: translateY(-2px);
              }
              .dropdown-item {
                transition: all 0.2s ease;
              }
              .dropdown-item:hover {
                background-color: rgba(13, 92, 70, 0.05);
                color: var(--primary-color);
              }
            `}</style>
        </header>
    );
};

export default Navbar;
