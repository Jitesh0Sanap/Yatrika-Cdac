import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetImage = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80";

    if (!token) {
        return (
            <div className="container-fluid p-0 d-flex flex-column bg-white" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center px-4">
                    <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: '#ffe5e5', color: 'var(--danger)', fontSize: '2rem' }}>
                        <i className="bi bi-x-circle"></i>
                    </div>
                    <h2 className="fw-bold mb-3">Invalid Link</h2>
                    <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>The password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" className="btn-primary-custom px-4">Request new link</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/reset-password', { token, newPassword: password });
            setMessage(data.message || 'Password reset successfully.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err?.response?.data?.error || err?.response?.data || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-0 d-flex flex-column" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="row g-0 flex-grow-1">
                <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white order-2 order-lg-1">
                    <div className="w-100" style={{ maxWidth: '480px', padding: '40px 24px' }}>
                        <div className="text-center mb-5">
                            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontSize: '2rem' }}>
                                <i className="bi bi-key"></i>
                            </div>
                            <h2 className="fw-bold mb-3">Create new password</h2>
                            <p className="text-muted">Your new password must be different from previous used passwords.</p>
                        </div>

                        {message && <div className="alert alert-success border-0 small py-3 mb-4 fw-semibold"><i className="bi bi-check-circle me-2"></i>{message}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>New Password</label>
                                <input 
                                    type="password" 
                                    className="form-control-custom" 
                                    required 
                                    minLength={6}
                                    placeholder="Enter new password"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    disabled={loading || !!message}
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Confirm Password</label>
                                <input 
                                    type="password" 
                                    className="form-control-custom" 
                                    required 
                                    minLength={6}
                                    placeholder="Confirm new password"
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    disabled={loading || !!message}
                                />
                            </div>

                            {error && <div className="alert alert-danger border-0 small py-2 mb-4"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

                            <button className="btn-primary-custom w-100 py-3 mb-4" type="submit" disabled={loading || !!message} style={{ fontSize: '1.1rem' }}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</>
                                ) : (
                                    <><i className="bi bi-check2-circle me-2"></i> Reset Password</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-6 d-none d-lg-block position-relative order-1 order-lg-2">
                    <div 
                        className="h-100 w-100" 
                        style={{
                            backgroundImage: `url('${resetImage}')`,
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
            </div>
        </div>
    );
}
