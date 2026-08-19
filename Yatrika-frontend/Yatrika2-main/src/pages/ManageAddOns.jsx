import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ManageAddOns() {
  const { hotelId } = useParams();
  const { user } = useAuth();
  const [availableAddOns, setAvailableAddOns] = useState([]);
  const [hotelAddOns, setHotelAddOns] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [aRes, hRes] = await Promise.all([
        api.get('/api/addons').catch(() => ({ data: [] })),
        api.get(`/hotels/${hotelId}/owner/${user.userId}/addons`)
      ]);
      setAvailableAddOns(aRes.data || []);
      setHotelAddOns(hRes.data || []);
    } catch (e) { 
      setError('Could not load add-ons. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [hotelId]);

  const toggleEnable = async (addOnId, current) => {
    try {
      const req = { addOnId, price: current.price ?? 0, pricingType: current.pricingType, enabled: !current.enabled, included: current.included };
      await api.post(`/hotels/${hotelId}/owner/${user.userId}/addons`, req);
      load();
    } catch (e) { setError('Could not update add-on state.'); }
  };

  const remove = async (addOnId) => {
    if (!window.confirm('Remove this add-on configuration?')) return;
    try { 
      await api.delete(`/hotels/${hotelId}/owner/${user.userId}/addons/${addOnId}`); 
      load(); 
    } catch (e) { setError('Could not remove add-on.'); }
  };

  const save = async (addOnId, price, pricingType, included) => {
    try {
      const req = { addOnId, price: Number(price), pricingType, enabled: true, included };
      await api.post(`/hotels/${hotelId}/owner/${user.userId}/addons`, req);
      load();
    } catch (e) { setError('Could not save add-on.'); }
  };

  // Helper to format pricing type for UI
  const formatPricingType = (type) => {
    const formats = {
      'PER_BOOKING': 'Per Booking',
      'PER_NIGHT': 'Per Night',
      'PER_PERSON': 'Per Person',
      'PER_PERSON_PER_NIGHT': 'Per Person/Night'
    };
    return formats[type] || type;
  };

  return (
    <main style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div className="bg-white border-bottom pt-4 pb-4 mb-4">
        <div className="page-container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <Link to="/owner-dashboard" className="text-decoration-none text-muted small fw-bold text-uppercase d-inline-block mb-2 hover-primary transition" style={{ letterSpacing: '1px' }}>
              <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
            </Link>
            <h2 className="fw-bold mb-0">Manage Add-ons</h2>
          </div>
        </div>
      </div>

      <div className="page-container">
        {error && (
          <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center p-4 rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            
            {/* Active Add-ons List */}
            <div className="col-12 col-lg-7">
              <h4 className="fw-bold mb-4 d-flex align-items-center">
                <i className="bi bi-check-circle-fill text-success me-2"></i> Active Hotel Add-ons
              </h4>
              
              {hotelAddOns.length === 0 ? (
                <div className="premium-card p-5 text-center bg-white border">
                  <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-light" style={{ width: '60px', height: '60px', color: 'var(--text-muted)' }}>
                    <i className="bi bi-plus-circle fs-3"></i>
                  </div>
                  <h5 className="fw-bold">No Add-ons Configured</h5>
                  <p className="text-muted small">Select add-ons from the available catalog to offer them to your guests.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {hotelAddOns.map(h => (
                    <div key={h.addOn.addOnId} className="premium-card p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white">
                      <div className="d-flex align-items-start gap-3">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${h.enabled ? 'bg-primary bg-opacity-10 text-primary-custom' : 'bg-light text-muted'}`} style={{ width: '45px', height: '45px' }}>
                          <i className={`bi bi-${h.included ? 'gift' : 'tags'} fs-5`}></i>
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h5 className={`fw-bold mb-0 ${!h.enabled ? 'text-muted' : ''}`}>{h.addOn.name}</h5>
                            {h.included && <span className="badge bg-success-subtle text-success border border-success-subtle px-2">Included</span>}
                            {!h.enabled && <span className="badge bg-secondary-subtle text-secondary border px-2">Disabled</span>}
                          </div>
                          {!h.included && h.enabled && (
                            <div className="text-muted small fw-semibold">
                              <span className="text-dark">₹{Number(h.price || 0).toLocaleString('en-IN')}</span> • {formatPricingType(h.pricingType)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="d-flex gap-2 ms-md-4 mt-3 mt-md-0 border-top pt-3 pt-md-0 border-md-0">
                        <button 
                          onClick={() => toggleEnable(h.addOn.addOnId, h)}
                          className={`btn btn-sm px-3 fw-bold flex-grow-1 ${h.enabled ? 'btn-outline-secondary' : 'btn-success'}`}
                        >
                          {h.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          onClick={() => remove(h.addOn.addOnId)}
                          className="btn btn-outline-danger btn-sm px-3"
                          title="Remove entirely"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Add-ons Catalog */}
            <div className="col-12 col-lg-5">
              <h4 className="fw-bold mb-4 d-flex align-items-center">
                <i className="bi bi-journal-plus text-primary-custom me-2"></i> Catalog
              </h4>
              
              <div className="premium-card p-0 bg-white overflow-hidden sticky-top" style={{ top: '100px' }}>
                <div className="p-3 border-bottom bg-light bg-opacity-50 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
                  Available Services
                </div>
                
                <div className="d-flex flex-column" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {availableAddOns.map(a => {
                    const isConfigured = hotelAddOns.some(h => h.addOn.addOnId === a.addOnId);
                    if (isConfigured) return null; // Hide if already active
                    
                    return (
                      <div key={a.addOnId} className="p-4 border-bottom hover-bg-light transition">
                        <div className="mb-2">
                          <h6 className="fw-bold mb-1">{a.name}</h6>
                          <p className="text-muted small mb-0 line-clamp-2">{a.description}</p>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="text-muted small">
                            Suggested: ₹{Number(a.price || 0).toLocaleString('en-IN')}
                          </div>
                          <button 
                            className="btn btn-outline-primary btn-sm fw-bold px-3 rounded-pill"
                            onClick={() => save(a.addOnId, a.price || 0, a.pricingType || 'PER_BOOKING', false)}
                          >
                            <i className="bi bi-plus me-1"></i> Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {availableAddOns.every(a => hotelAddOns.some(h => h.addOn.addOnId === a.addOnId)) && (
                    <div className="p-5 text-center text-muted">
                      <i className="bi bi-check2-all fs-2 mb-2 d-block text-success"></i>
                      <p className="mb-0">All available add-ons have been configured for this property.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
