import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function OwnerDashboard() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMyHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/hotels/owner/${user.userId}`);
      setHotels(response.data);
    } catch (requestError) {
      setError('Could not load your hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyHotels();
  }, [user.userId]);

  const deleteHotel = async (hotelId) => {
    if (!window.confirm('Delete this hotel? This cannot be undone.')) return;
    try {
      await api.delete(`/hotels/owner/${user.userId}/${hotelId}`);
      loadMyHotels();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'You cannot delete this hotel.');
    }
  };

  return (
    <main style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* SaaS Dashboard Header */}
      <div className="bg-white border-bottom pt-4 pb-4 mb-4 shadow-sm position-sticky top-0" style={{ zIndex: 100 }}>
        <div className="page-container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center mb-1">
              <span className="badge bg-dark text-white fw-bold me-2 px-2 py-1"><i className="bi bi-rocket-takeoff-fill me-1"></i> Partner Portal</span>
              <p className="text-muted small fw-semibold text-uppercase mb-0" style={{ letterSpacing: '1px' }}>Overview</p>
            </div>
            <h2 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>Owner Dashboard</h2>
          </div>
          <div className="d-flex gap-3">
            <button className="btn btn-light border fw-bold text-dark hover-lift">
              <i className="bi bi-download me-1"></i> Reports
            </button>
            <Link to="/owner/hotels/new" className="btn-primary-custom px-4 text-nowrap d-inline-flex align-items-center justify-content-center hover-lift shadow-sm">
              <i className="bi bi-plus-lg me-2"></i> Add Property
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container">
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center p-4 rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
        )}

        {!loading && !error && hotels.length === 0 && (
          <div className="text-center py-5 my-5 bg-white rounded-4 shadow-sm border p-5">
            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-light" style={{ width: '80px', height: '80px', color: 'var(--text-muted)' }}>
              <i className="bi bi-building-add fs-1 text-primary-custom"></i>
            </div>
            <h3 className="fw-bold mb-2">No properties listed yet</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>Start managing your bookings by adding your first hotel, resort, or villa to the Yatrika platform.</p>
            <Link to="/owner/hotels/new" className="btn-primary-custom px-4 py-2 hover-lift">
              List your property
            </Link>
          </div>
        )}

        {!loading && !error && hotels.length > 0 && (
          <>
            {/* SaaS Stats Cards */}
            <div className="row g-3 mb-5">
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="premium-card p-4 border-0 shadow-sm h-100 hover-lift">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <p className="text-muted small fw-bold text-uppercase mb-0">Total Properties</p>
                    <div className="rounded-circle bg-primary-custom bg-opacity-10 text-primary-custom d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}><i className="bi bi-buildings-fill"></i></div>
                  </div>
                  <h3 className="fw-bolder mb-1">{hotels.length}</h3>
                  <p className="text-success small fw-semibold mb-0"><i className="bi bi-arrow-up-right me-1"></i>Active listings</p>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="premium-card p-4 border-0 shadow-sm h-100 hover-lift">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <p className="text-muted small fw-bold text-uppercase mb-0">Total Bookings</p>
                    <div className="rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}><i className="bi bi-calendar-check-fill"></i></div>
                  </div>
                  <h3 className="fw-bolder mb-1">124</h3>
                  <p className="text-success small fw-semibold mb-0"><i className="bi bi-arrow-up-right me-1"></i>+12% this month</p>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="premium-card p-4 border-0 shadow-sm h-100 hover-lift">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <p className="text-muted small fw-bold text-uppercase mb-0">Revenue</p>
                    <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}><i className="bi bi-currency-rupee"></i></div>
                  </div>
                  <h3 className="fw-bolder mb-1">₹4.2L</h3>
                  <p className="text-success small fw-semibold mb-0"><i className="bi bi-arrow-up-right me-1"></i>+8.5% this month</p>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="premium-card p-4 border-0 shadow-sm h-100 hover-lift">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <p className="text-muted small fw-bold text-uppercase mb-0">Avg. Occupancy</p>
                    <div className="rounded-circle bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}><i className="bi bi-pie-chart-fill"></i></div>
                  </div>
                  <h3 className="fw-bolder mb-1">78%</h3>
                  <p className="text-danger small fw-semibold mb-0"><i className="bi bi-arrow-down-right me-1"></i>-2% this month</p>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="fw-bold m-0 text-dark">Your Properties</h4>
            </div>

            <div className="row g-4">
            {hotels.map((hotel) => (
              <div className="col-12 col-md-6 col-lg-4" key={hotel.hotelId}>
                <div className="premium-card h-100 d-flex flex-column" style={{ borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                  
                  <div className="position-relative" style={{ height: '200px', backgroundImage: `url(${hotel.imageUrl || 'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=800&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    {hotel.category && (
                      <div className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill bg-white text-dark shadow-sm fw-bold small text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                        {hotel.category}
                      </div>
                    )}
                    <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))' }}>
                      <div className="d-flex align-items-center text-white">
                        <i className="bi bi-star-fill text-gold small me-1"></i>
                        <span className="fw-bold">{hotel.avgRating ?? 'New'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 d-flex flex-column flex-grow-1 bg-white border-bottom">
                    <p className="text-muted small fw-semibold text-uppercase mb-1" style={{ letterSpacing: '1px' }}>
                      <i className="bi bi-geo-alt-fill text-primary-custom me-1"></i> {hotel.city}
                    </p>
                    <h5 className="fw-bold mb-2 text-dark">{hotel.name}</h5>
                    <p className="text-muted small mb-0"><i className="bi bi-map me-1"></i> {hotel.location}</p>
                  </div>

                  <div className="p-3 bg-light d-flex flex-column gap-2 mt-auto">
                    <div className="d-flex gap-2">
                      <Link to={`/owner/hotels/${hotel.hotelId}/edit`} className="btn btn-outline-secondary btn-sm flex-grow-1 fw-bold">
                        <i className="bi bi-pencil-square me-1"></i> Edit
                      </Link>
                      <button onClick={() => deleteHotel(hotel.hotelId)} className="btn btn-outline-danger btn-sm px-3" title="Delete Property">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    <div className="d-flex gap-2">
                      <Link to={`/owner/hotels/${hotel.hotelId}/rooms`} className="btn btn-light border btn-sm flex-grow-1 fw-bold text-primary-custom">
                        <i className="bi bi-door-open me-1"></i> Rooms
                      </Link>
                      <Link to={`/owner/hotels/${hotel.hotelId}/addons`} className="btn btn-light border btn-sm flex-grow-1 fw-bold text-primary-custom">
                        <i className="bi bi-plus-circle me-1"></i> Add-ons
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </main>
  );
}

export default OwnerDashboard;
