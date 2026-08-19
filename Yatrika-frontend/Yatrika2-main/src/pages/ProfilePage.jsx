import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TRAVEL_TYPES = ['SOLO', 'COUPLE', 'FAMILY', 'BUSINESS'];

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: '', phone: '', travelType: '', budgetPref: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const profileImage = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80";

    useEffect(() => {
        if (!user?.userId) return;

        const loadProfile = async () => {
            try {
                const { data } = await api.get(`/users/${user.userId}`);
                setProfile(data);
                setForm({
                    name: data.name || '',
                    phone: data.phone || '',
                    travelType: data.travelType || '',
                    budgetPref: data.budgetPref ?? '',
                });
            } catch (err) {
                setError('Could not load your profile.');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user?.userId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const startEdit = () => {
        setError('');
        setSuccess('');
        setIsEditing(true);
    };

    const cancelEdit = () => {
        if (profile) {
            setForm({
                name: profile.name || '',
                phone: profile.phone || '',
                travelType: profile.travelType || '',
                budgetPref: profile.budgetPref ?? '',
            });
        }
        setError('');
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const payload = {
                name: form.name,
                phone: form.phone,
                travelType: form.travelType || null,
                budgetPref: form.budgetPref === '' ? null : Number(form.budgetPref),
            };
            const { data } = await api.put(`/users/${user.userId}`, payload);

            setProfile(data);
            login({ ...user, name: data.name, phone: data.phone });
            setSuccess('Profile updated successfully.');
            setIsEditing(false);
        } catch (err) {
            setError(err?.response?.data || 'We could not update your profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="spinner-border text-success" role="status" />
            </div>
        );
    }

    return (
        <div className="container-fluid p-0 d-flex flex-column" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="row g-0 flex-grow-1">
                <div className="col-lg-6 d-none d-lg-block position-relative">
                    <div
                        className="h-100 w-100"
                        style={{
                            backgroundImage: `url('${profileImage}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(13,92,70,0.8) 100%)' }}></div>
                        <div className="position-absolute bottom-0 start-0 p-5 text-white">
                            <h2 className="display-5 fw-bold mb-3">Your journey, your details</h2>
                            <p className="lead opacity-75 mb-0">Keep your profile up to date so we can personalize every stay.</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 d-flex align-items-center justify-content-center bg-white">
                    <div className="w-100" style={{ maxWidth: '480px', padding: '40px 24px' }}>
                        <div className="text-center mb-5">
                            <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.85rem' }}>MY ACCOUNT</p>
                            <h2 className="fw-bold mb-3">My Profile</h2>
                            <p className="text-muted">{isEditing ? 'Update your personal details below.' : 'Here are your saved details.'}</p>
                        </div>

                        {error && <div className="alert alert-danger border-0 small py-2 mb-4"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
                        {success && <div className="alert alert-success border-0 small py-2 mb-4"><i className="bi bi-check-circle me-2"></i>{success}</div>}

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Email</label>
                            <div className="form-control-custom" style={{ background: '#f5f5f5', color: '#6c757d' }}>{user?.email}</div>
                        </div>

                        {!isEditing ? (
                            <>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Full name</label>
                                    <div className="form-control-custom">{profile?.name || '—'}</div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Phone number</label>
                                    <div className="form-control-custom">{profile?.phone || '—'}</div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Travel type</label>
                                        <div className="form-control-custom">
                                            {profile?.travelType ? profile.travelType.charAt(0) + profile.travelType.slice(1).toLowerCase() : '—'}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Budget / night</label>
                                        <div className="form-control-custom">
                                            {profile?.budgetPref ? `₹${Number(profile.budgetPref).toLocaleString('en-IN')}` : '—'}
                                        </div>
                                    </div>
                                </div>

                                <button className="btn-primary-custom w-100 py-3" type="button" onClick={startEdit} style={{ fontSize: '1.1rem' }}>
                                    <i className="bi bi-pencil-square me-2"></i> Edit Profile
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Full name</label>
                                    <input
                                        type="text"
                                        className="form-control-custom"
                                        name="name"
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Phone number</label>
                                    <input
                                        type="text"
                                        className="form-control-custom"
                                        name="phone"
                                        placeholder="e.g. 9876543210"
                                        value={form.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Travel type</label>
                                        <select className="form-control-custom" name="travelType" value={form.travelType} onChange={handleChange}>
                                            <option value="">Not set</option>
                                            {TRAVEL_TYPES.map((type) => (
                                                <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '1px' }}>Budget / night</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-control-custom"
                                            name="budgetPref"
                                            placeholder="e.g. 5000"
                                            value={form.budgetPref}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <button className="btn-primary-custom flex-grow-1 py-3" type="submit" disabled={saving} style={{ fontSize: '1.1rem' }}>
                                        {saving ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</>
                                        ) : (
                                            <><i className="bi bi-check2 me-2"></i> Save Changes</>
                                        )}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary py-3 px-4" onClick={cancelEdit} disabled={saving}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;