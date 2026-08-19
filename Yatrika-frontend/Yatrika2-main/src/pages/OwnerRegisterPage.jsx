import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const OwnerRegisterPage = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.registerOwner(form);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const ownerImage = "https://images.unsplash.com/photo-1551882547-ff40c0d509af?auto=format&fit=crop&w=1200&q=80";

    return (
        <div className="container-fluid p-0 d-flex flex-column" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="row g-0 flex-grow-1">
                <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white order-2 order-lg-1">
                    <div className="w-100" style={{ maxWidth: '500px', padding: '40px 24px' }}>
                        <div className="text-center mb-5">
                            <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.85rem' }}>PARTNER WITH YATRIKA</p>
                            <h2 className="fw-bold mb-2">Become a Hotel Partner</h2>
                            <p className="text-muted">List your premium property and reach luxury travelers globally.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Full Name</label>
                                <input name="name" className="form-control-custom" required value={form.name} onChange={handleChange} placeholder="Owner / Manager Name" />
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Email Address</label>
                                <input name="email" type="email" className="form-control-custom" required value={form.email} onChange={handleChange} placeholder="Business Email" />
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Password</label>
                                <input name="password" type="password" className="form-control-custom" required minLength="4" value={form.password} onChange={handleChange} placeholder="Secure password" />
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Phone Number</label>
                                <input name="phone" className="form-control-custom" value={form.phone} onChange={handleChange} placeholder="Business Contact Number" />
                            </div>

                            {error && <div className="alert alert-danger border-0 small py-2 mb-4"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

                            <button className="btn-primary-custom w-100 py-3 mb-4" type="submit" disabled={loading} style={{ fontSize: '1.1rem' }}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Creating account...</>
                                ) : (
                                    <><i className="bi bi-building me-2"></i> Register Property</>
                                )}
                            </button>

                            <p className="text-center text-muted">
                                Already a partner? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
                            </p>
                        </form>
                    </div>
                </div>

                <div className="col-lg-6 d-none d-lg-block position-relative order-1 order-lg-2">
                    <div 
                        className="h-100 w-100" 
                        style={{
                            backgroundImage: `url('${ownerImage}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(13,92,70,0.8) 100%)' }}></div>
                        <div className="position-absolute bottom-0 start-0 p-5 text-white">
                            <h2 className="display-5 fw-bold mb-3">Elevate your business</h2>
                            <p className="lead opacity-75 mb-0">Join our exclusive network of premium hospitality partners.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerRegisterPage;
