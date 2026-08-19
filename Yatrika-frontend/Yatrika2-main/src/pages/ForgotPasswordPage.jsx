import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setMessage(data.message || 'If that email is registered, a password reset link has been sent.');
        } catch (err) {
            setError(err?.response?.data || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const forgotImage = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80";

    return (
        <div className="container-fluid p-0 d-flex flex-column" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="row g-0 flex-grow-1">
                <div className="col-lg-6 d-none d-lg-block position-relative">
                    <div 
                        className="h-100 w-100" 
                        style={{
                            backgroundImage: `url('${forgotImage}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(13,92,70,0.8) 100%)' }}></div>
                        <div className="position-absolute bottom-0 start-0 p-5 text-white">
                            <h2 className="display-5 fw-bold mb-3">Secure access</h2>
                            <p className="lead opacity-75 mb-0">Regain access to your account and continue your journey.</p>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white">
                    <div className="w-100" style={{ maxWidth: '480px', padding: '40px 24px' }}>
                        <div className="text-center mb-5">
                            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontSize: '2rem' }}>
                                <i className="bi bi-shield-lock"></i>
                            </div>
                            <h2 className="fw-bold mb-3">Forgot Password?</h2>
                            <p className="text-muted">Enter your email address and we'll send you a link to reset your password.</p>
                        </div>

                        {message && <div className="alert alert-success border-0 small py-3 mb-4 fw-semibold"><i className="bi bi-check-circle me-2"></i>{message}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Email Address</label>
                                <input 
                                    type="email" 
                                    className="form-control-custom" 
                                    required 
                                    placeholder="Enter your registered email"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    disabled={loading}
                                />
                            </div>
                            
                            {error && <div className="alert alert-danger border-0 small py-2 mb-4"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

                            <button className="btn-primary-custom w-100 py-3 mb-4" type="submit" disabled={loading} style={{ fontSize: '1.1rem' }}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...</>
                                ) : (
                                    <><i className="bi bi-envelope me-2"></i> Send Reset Link</>
                                )}
                            </button>

                            <p className="text-center text-muted">
                                Remembered your password? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
