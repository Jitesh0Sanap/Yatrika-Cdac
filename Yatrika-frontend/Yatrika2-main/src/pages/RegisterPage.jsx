import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const RegisterPage = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        travelType: 'SOLO',
        budgetPref: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userData = {
                ...form,
                budgetPref: form.budgetPref ? parseFloat(form.budgetPref) : null
            };
            const user = await authService.register(userData);
            login(user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const registerImage = "https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1200&q=80";

    return (
        <div className="container-fluid p-0 d-flex flex-column" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="row g-0 flex-grow-1">
                <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white order-2 order-lg-1">
                    <div className="w-100" style={{ maxWidth: '540px', padding: '40px 24px' }}>
                        <div className="text-center mb-4">
                            <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.85rem' }}>START EXPLORING</p>
                            <h2 className="fw-bold mb-2">Create your account</h2>
                            <p className="text-muted">Join Yatrika to book handpicked luxury stays.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Full Name</label>
                                    <input name="name" className="form-control-custom" required value={form.name} onChange={handleChange} placeholder="John Doe" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Phone Number</label>
                                    <input name="phone" className="form-control-custom" value={form.phone} onChange={handleChange} placeholder="+1 234 567 890" />
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Email Address</label>
                                <input name="email" type="email" className="form-control-custom" required value={form.email} onChange={handleChange} placeholder="name@example.com" />
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Password</label>
                                <input name="password" type="password" className="form-control-custom" required minLength="4" value={form.password} onChange={handleChange} placeholder="Minimum 4 characters" />
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Travel Style</label>
                                    <select name="travelType" className="form-control-custom" style={{ padding: '15px' }} value={form.travelType} onChange={handleChange}>
                                        <option value="SOLO">Solo Traveler</option>
                                        <option value="COUPLE">Couple / Romance</option>
                                        <option value="FAMILY">Family Vacation</option>
                                        <option value="BUSINESS">Business Travel</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Nightly Budget ($)</label>
                                    <input name="budgetPref" type="number" className="form-control-custom" min="0" value={form.budgetPref} onChange={handleChange} placeholder="e.g. 150" />
                                </div>
                            </div>

                            {error && <div className="alert alert-danger border-0 small py-2 mb-4"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

                            <button className="btn-primary-custom w-100 py-3 mb-4" type="submit" disabled={loading} style={{ fontSize: '1.1rem' }}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Creating account...</>
                                ) : (
                                    <><i className="bi bi-person-plus me-2"></i> Create Account</>
                                )}
                            </button>

                            <p className="text-center text-muted">
                                Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
                            </p>
                        </form>
                    </div>
                </div>

                <div className="col-lg-6 d-none d-lg-block position-relative order-1 order-lg-2">
                    <div 
                        className="h-100 w-100" 
                        style={{
                            backgroundImage: `url('${registerImage}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(13,92,70,0.8) 100%)' }}></div>
                        <div className="position-absolute bottom-0 start-0 p-5 text-white">
                            <h2 className="display-5 fw-bold mb-3">Your journey begins</h2>
                            <p className="lead opacity-75 mb-0">Experience world-class hospitality and unforgettable destinations.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
