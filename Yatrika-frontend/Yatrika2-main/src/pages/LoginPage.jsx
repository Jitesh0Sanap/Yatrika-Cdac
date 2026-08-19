import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await authService.login(credentials);
            login(user);
            navigate(user.role === 'HOTEL_OWNER' ? '/owner-dashboard' : '/');
        } catch (err) {
            setError(err.response?.data || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const loginImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

    return (
        <div className="container-fluid p-0 d-flex flex-column" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="row g-0 flex-grow-1">
                <div className="col-lg-6 d-none d-lg-block position-relative">
                    <div 
                        className="h-100 w-100" 
                        style={{
                            backgroundImage: `url('${loginImage}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(13,92,70,0.8) 100%)' }}></div>
                        <div className="position-absolute bottom-0 start-0 p-5 text-white">
                            <h2 className="display-5 fw-bold mb-3">Discover the extraordinary</h2>
                            <p className="lead opacity-75 mb-0">Join our community of luxury travelers and gain access to exclusive handpicked stays.</p>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white">
                    <div className="w-100" style={{ maxWidth: '480px', padding: '40px 24px' }}>
                        <div className="text-center mb-5">
                            <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.85rem' }}>WELCOME BACK</p>
                            <h2 className="fw-bold mb-3">Sign in to Yatrika</h2>
                            <p className="text-muted">Enter your details to access your account.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Email</label>
                                <input
                                    type="email"
                                    className="form-control-custom"
                                    name="email"
                                    required
                                    placeholder="Enter your email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                />
                            </div>
                            
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label small fw-bold text-uppercase text-muted mb-0" style={{ letterSpacing: '1px' }}>Password</label>
                                    <Link to="/forgot-password" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Forgot Password?</Link>
                                </div>
                                <input
                                    type="password"
                                    className="form-control-custom"
                                    name="password"
                                    required
                                    placeholder="Enter your password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                />
                            </div>

                            {error && <div className="alert alert-danger border-0 small py-2 mb-4"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

                            <button className="btn-primary-custom w-100 py-3 mb-4" type="submit" disabled={loading} style={{ fontSize: '1.1rem' }}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Signing in...</>
                                ) : (
                                    <><i className="bi bi-box-arrow-in-right me-2"></i> Sign In</>
                                )}
                            </button>

                            <p className="text-center text-muted">
                                Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
