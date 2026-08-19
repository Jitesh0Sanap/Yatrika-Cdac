import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const OPTIONAL_SERVICE_NAMES = ['breakfast', 'airport pickup', 'laundry', 'extra bed', 'late checkout', 'early check-in'];

function BookRoomPage() {
  const { hotelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [hotel, setHotel] = useState(null);
  const [roomCategories, setRoomCategories] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [form, setForm] = useState({ roomCategoryId: '', checkInDate: '', checkOutDate: '', numberOfGuests: 1, specialRequests: '' });
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [addOnsError, setAddOnsError] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const load = async () => {
      setPageLoading(true);
      setError('');
      setAddOnsError('');

      const results = await Promise.allSettled([
        api.get(`/hotels/${hotelId}`),
        api.get(`/hotels/${hotelId}/room-categories`),
        api.get(`/hotels/${hotelId}/addons`),
      ]);

      if (results[0].status === 'fulfilled') setHotel(results[0].value.data);
      else setError('Hotel could not be loaded.');

      if (results[1].status === 'fulfilled') setRoomCategories(results[1].value.data || []);
      else { setRoomCategories([]); setError('Room availability could not be loaded.'); }

      if (results[2].status === 'fulfilled') {
        const services = Array.isArray(results[2].value.data) ? results[2].value.data : Object.values(results[2].value.data || {});
        const optionalServices = services.filter((entry) => entry?.enabled !== false && isOptionalService(entry));
        setAddOns(optionalServices);
        if (optionalServices.length === 0) setAddOnsError('No optional services are available for this stay.');
      } else {
        setAddOns([]);
        setAddOnsError('Optional services are unavailable right now.');
      }

      setPageLoading(false);
    };

    load();
  }, [hotelId]);

  useEffect(() => {
    const pre = location?.state?.roomCategoryId;
    if (pre && roomCategories.length > 0 && !form.roomCategoryId) {
      setForm((f) => ({ ...f, roomCategoryId: String(pre) }));
    }
  }, [location?.state?.roomCategoryId, roomCategories.length]);

  const toggleAddOn = (addonId) => {
    setSelectedAddOns((s) => {
      const next = { ...s };
      if (next[addonId]) delete next[addonId];
      else next[addonId] = { quantity: 1 };
      return next;
    });
  };

  const setAddOnQty = (addonId, qty) => {
    setSelectedAddOns((s) => ({ ...s, [addonId]: { quantity: Math.max(1, Number(qty) || 1) } }));
  };

  const computeLocalPreview = () => {
    const rc = roomCategories.find((r) => r.roomCategoryId === Number(form.roomCategoryId));
    if (!rc || !form.checkInDate || !form.checkOutDate) return null;

    const checkIn = new Date(form.checkInDate);
    const checkOut = new Date(form.checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) return null;

    const nights = Math.max(0, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    const roomCost = (rc.pricePerNight || 0) * nights;

    let addOnTotal = 0;
    const lines = [];
    for (const ao of addOns) {
      if (!ao.enabled) continue;
      const id = ao.addOn?.addOnId;
      if (selectedAddOns[id]) {
        const qty = selectedAddOns[id]?.quantity || 1;
        let thisTotal = 0;
        const unit = ao.included ? 0 : ao.price;
        switch (ao.pricingType) {
          case 'PER_BOOKING': thisTotal = unit * qty; break;
          case 'PER_PERSON': thisTotal = unit * Number(form.numberOfGuests || 1) * qty; break;
          case 'PER_NIGHT': thisTotal = unit * nights * qty; break;
          case 'PER_PERSON_PER_NIGHT': thisTotal = unit * Number(form.numberOfGuests || 1) * nights * qty; break;
          default: thisTotal = unit * qty;
        }
        addOnTotal += thisTotal;
        lines.push({ addOnId: id, name: ao.addOn?.name, unitPrice: unit, quantity: qty, totalPrice: thisTotal, included: ao.included });
      }
    }

    return { roomCost, addOnTotal, nights, taxes: 0, discount: 0, total: roomCost + addOnTotal, lines };
  };

  const validateForm = () => {
    const errors = {};
    if (!form.roomCategoryId) errors.roomCategoryId = 'Please select a room.';
    if (!form.checkInDate) errors.checkInDate = 'Required.';
    if (!form.checkOutDate) errors.checkOutDate = 'Required.';
    if (form.checkInDate && form.checkOutDate) {
      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);
      if (checkOut <= checkIn) errors.checkOutDate = 'Check-out must be after check-in.';
    }
    if (!form.numberOfGuests || Number(form.numberOfGuests) < 1) errors.numberOfGuests = 'Guests must be at least 1.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = (includeSpecialRequests = false) => ({
    userId: user?.userId,
    hotelId: Number(hotelId),
    roomCategoryId: Number(form.roomCategoryId),
    checkInDate: form.checkInDate,
    checkOutDate: form.checkOutDate,
    numberOfGuests: Number(form.numberOfGuests || 1),
    addOns: Object.entries(selectedAddOns).map(([id, val]) => ({ addOnId: Number(id), quantity: Number(val?.quantity || 1) })),
    ...(includeSpecialRequests ? { specialRequests: form.specialRequests } : {}),
  });

  const requestSummary = useCallback(async (showError = true) => {
    if (!form.roomCategoryId || !form.checkInDate || !form.checkOutDate || !user?.userId || Number(form.numberOfGuests || 1) < 1) return;

    setLoading(true);
    try {
      const payload = buildPayload(false);
      const resp = await api.post('/bookings/summary', payload);
      setPreview(resp.data);
      if (showError) setError('');
    } catch (e) {
      setPreview(null);
      if (showError) setError(typeof e?.response?.data === 'string' ? e.response.data : 'Preview could not be verified right now.');
    } finally {
      setLoading(false);
    }
  }, [form.roomCategoryId, form.checkInDate, form.checkOutDate, form.numberOfGuests, form.specialRequests, hotelId, selectedAddOns, user?.userId]);

  useEffect(() => {
    if (!hotelId || !form.roomCategoryId || !form.checkInDate || !form.checkOutDate || !user?.userId || Number(form.numberOfGuests || 1) < 1) return;
    const timer = window.setTimeout(() => requestSummary(false), 300);
    return () => window.clearTimeout(timer);
  }, [requestSummary, hotelId, user?.userId]);

  const handleConfirm = async () => {
    setError('');
    if (!user?.userId) { setError('Please sign in to confirm your booking.'); return; }
    if (!validateForm()) { setError('Please fix the highlighted fields.'); return; }

    setLoading(true);
    try {
      const resp = await api.post('/bookings', buildPayload(true));
      navigate(`/bookings/${resp.data.bookingId}`);
    } catch (e) {
      setError(typeof e?.response?.data === 'string' ? e.response.data : 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoom = roomCategories.find((r) => r.roomCategoryId === Number(form.roomCategoryId)) || null;
  const local = computeLocalPreview();
  const summaryLines = preview?.addOnLines?.length ? preview.addOnLines : local?.lines || [];
  
  if (pageLoading) {
    return (
      <main className="page-container py-5 text-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem', marginTop: '15vh' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh' }}>
      {/* Premium Header */}
      <div className="bg-white border-bottom pt-5 pb-4 mb-5 shadow-sm position-sticky top-0" style={{ zIndex: 100 }}>
        <div className="page-container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <Link to={`/hotels/${hotelId}`} className="btn btn-light rounded-circle me-4 shadow-sm hover-lift" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-arrow-left fs-5"></i>
            </Link>
            <div>
              <p className="text-muted small mb-0 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Secure Checkout</p>
              <h2 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>Confirm your booking</h2>
            </div>
          </div>
          {/* Elegant progress indicator */}
          <div className="d-none d-md-flex align-items-center gap-2">
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle bg-primary-custom text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '32px', height: '32px' }}><i className="bi bi-check2"></i></div>
              <span className="small mt-1 fw-bold text-primary-custom" style={{ fontSize: '0.75rem' }}>Details</span>
            </div>
            <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--primary-color)', opacity: 0.2 }}></div>
            <div className="d-flex flex-column align-items-center opacity-50">
              <div className="rounded-circle bg-secondary text-muted d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px' }}>2</div>
              <span className="small mt-1 fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Payment</span>
            </div>
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

        <div className="row gx-lg-5">
          {/* Left Column: Stepper Form */}
          <div className="col-12 col-lg-8">
            
            {/* Step 1 */}
            <div className="premium-card p-4 p-md-5 mb-4 shadow-sm border-0">
              <h4 className="fw-bolder mb-4 d-flex align-items-center text-dark">
                <span className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center me-3 fs-5 shadow-sm" style={{ width: '40px', height: '40px' }}>1</span>
                Your stay details
              </h4>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-floating">
                    <select className={`form-select bg-light border-0 shadow-sm ${formErrors.roomCategoryId ? 'is-invalid' : ''}`} style={{ height: '64px' }} value={form.roomCategoryId} onChange={(e) => setForm({ ...form, roomCategoryId: e.target.value })}>
                      <option value="">Choose a room...</option>
                      {roomCategories.map((rc) => (
                        <option key={rc.roomCategoryId} value={rc.roomCategoryId}>{rc.roomType} (₹{rc.pricePerNight} / night)</option>
                      ))}
                    </select>
                    <label className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}><i className="bi bi-door-open me-1"></i> Select Room</label>
                  </div>
                  {formErrors.roomCategoryId && <div className="text-danger small mt-2 fw-semibold"><i className="bi bi-exclamation-circle me-1"></i>{formErrors.roomCategoryId}</div>}
                </div>
                
                <div className="col-md-6">
                  <div className="form-floating">
                    <select className={`form-select bg-light border-0 shadow-sm ${formErrors.numberOfGuests ? 'is-invalid' : ''}`} style={{ height: '64px' }} value={form.numberOfGuests} onChange={(e) => setForm({ ...form, numberOfGuests: e.target.value })}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n>1?'s':''}</option>)}
                    </select>
                    <label className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}><i className="bi bi-people me-1"></i> Number of Guests</label>
                  </div>
                  {formErrors.numberOfGuests && <div className="text-danger small mt-2 fw-semibold"><i className="bi bi-exclamation-circle me-1"></i>{formErrors.numberOfGuests}</div>}
                </div>

                <div className="col-md-6">
                  <div className="form-floating">
                    <input type="date" className={`form-control bg-light border-0 shadow-sm fw-bold ${formErrors.checkInDate ? 'is-invalid' : ''}`} style={{ height: '64px' }} value={form.checkInDate} onChange={(e) => setForm({ ...form, checkInDate: e.target.value })} />
                    <label className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}><i className="bi bi-calendar-event me-1"></i> Check-in Date</label>
                  </div>
                  {formErrors.checkInDate && <div className="text-danger small mt-2 fw-semibold"><i className="bi bi-exclamation-circle me-1"></i>{formErrors.checkInDate}</div>}
                </div>

                <div className="col-md-6">
                  <div className="form-floating">
                    <input type="date" className={`form-control bg-light border-0 shadow-sm fw-bold ${formErrors.checkOutDate ? 'is-invalid' : ''}`} style={{ height: '64px' }} value={form.checkOutDate} onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })} />
                    <label className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}><i className="bi bi-calendar-check me-1"></i> Check-out Date</label>
                  </div>
                  {formErrors.checkOutDate && <div className="text-danger small mt-2 fw-semibold"><i className="bi bi-exclamation-circle me-1"></i>{formErrors.checkOutDate}</div>}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="premium-card p-4 p-md-5 mb-4 shadow-sm border-0">
              <h4 className="fw-bolder mb-4 d-flex align-items-center text-dark">
                <span className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center me-3 fs-5 shadow-sm" style={{ width: '40px', height: '40px' }}>2</span>
                Optional services
              </h4>
              
              {addOnsError && <div className="alert alert-light border border-info border-start-5 small text-muted"><i className="bi bi-info-circle-fill text-info me-2"></i>{addOnsError}</div>}
              {addOns.length === 0 && !addOnsError && <div className="alert alert-light border border-info border-start-5 small text-muted"><i className="bi bi-info-circle-fill text-info me-2"></i>No optional services are available for this stay.</div>}
              
              <div className="d-flex flex-column gap-3">
                {addOns.map((ao) => {
                  if (!ao.enabled) return null;
                  const id = ao.addOn?.addOnId;
                  const isSelected = !!selectedAddOns[id];
                  return (
                    <div key={id} className={`p-4 rounded-4 border hover-lift ${isSelected ? 'border-primary-custom bg-primary-custom bg-opacity-10 shadow-sm' : 'bg-white'}`} style={{ cursor: 'pointer' }} onClick={() => toggleAddOn(id)}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="form-check mb-0 d-flex align-items-center">
                          <input className="form-check-input mt-0 me-3" type="checkbox" checked={isSelected} readOnly style={{ width: '1.4rem', height: '1.4rem', cursor: 'pointer' }} />
                          <label className="form-check-label fw-bold text-dark fs-6" style={{ cursor: 'pointer' }}>
                            {ao.addOn?.name || 'Service'}
                            <div className="text-muted small fw-semibold mt-1"><i className="bi bi-tag-fill text-success me-1"></i>{ao.included ? 'Included with room' : `₹${Number(ao.price || 0).toLocaleString('en-IN')}`}</div>
                          </label>
                        </div>
                        {isSelected && !ao.included && (
                          <div className="d-flex align-items-center bg-white p-2 rounded-3 border" style={{ maxWidth: '120px' }} onClick={(e) => e.stopPropagation()}>
                            <span className="text-muted small fw-bold me-2 text-uppercase">Qty</span>
                            <input className="form-control border-0 fw-bold text-center p-1 bg-light" type="number" min="1" value={selectedAddOns[id]?.quantity || 1} onChange={(e) => setAddOnQty(id, e.target.value)} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3 */}
            <div className="premium-card p-4 p-md-5 mb-4 shadow-sm border-0">
              <h4 className="fw-bolder mb-4 d-flex align-items-center text-dark">
                <span className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center me-3 fs-5 shadow-sm" style={{ width: '40px', height: '40px' }}>3</span>
                Special requests
              </h4>
              <div className="alert alert-light border border-start-5 border-primary-custom mb-4 rounded-3 d-flex align-items-center">
                <i className="bi bi-megaphone-fill fs-4 text-primary-custom me-3"></i>
                <span className="small text-muted fw-semibold">Special requests cannot be guaranteed – but the property will do its best to meet your needs. You can always make a special request after your booking is complete!</span>
              </div>
              <div className="form-floating">
                <textarea 
                  className="form-control bg-light border-0 shadow-sm" 
                  style={{ height: '120px' }}
                  value={form.specialRequests} 
                  onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} 
                  placeholder="Please write your requests in English or the local language..." 
                />
                <label className="text-muted fw-bold">Please write your requests in English or the local language... (optional)</label>
              </div>
            </div>

          </div>

          {/* Right Column: Summary */}
          <div className="col-12 col-lg-4 mt-5 mt-lg-0">
            <div className="premium-card p-0 sticky-top shadow-lg" style={{ top: '120px', border: '1px solid rgba(0,0,0,0.08)' }}>
              
              <div className="p-4 border-bottom bg-white">
                <div className="d-flex gap-3 align-items-start">
                  <div className="rounded-3 overflow-hidden shadow-sm" style={{ width: '90px', height: '90px', backgroundImage: `url(${hotel?.imageUrl || 'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div>
                    <span className="badge bg-light text-dark border small fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}><i className="bi bi-building me-1"></i> Hotel</span>
                    <h5 className="fw-bolder mb-1 text-dark" style={{ lineHeight: '1.3' }}>{hotel?.name}</h5>
                    <div className="d-flex align-items-center small text-muted">
                      <div className="d-flex text-gold me-2">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`bi bi-star${i < Math.round(hotel?.avgRating || 4) ? '-fill' : ''}`}></i>
                        ))}
                      </div>
                      <span>{hotel?.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-light bg-opacity-50 border-bottom">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Check-in</span>
                  <span className="text-dark fw-bold">{form.checkInDate ? new Date(form.checkInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">Check-out</span>
                  <span className="text-dark fw-bold">{form.checkOutDate ? new Date(form.checkOutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small fw-semibold">Total length of stay:</span>
                  <span className="text-dark fw-bold">{local?.nights ? `${local.nights} nights` : '-'}</span>
                </div>
              </div>

              <div className="p-4 bg-white">
                <h5 className="fw-bolder mb-4">Price Details</h5>
                
                <div className="d-flex justify-content-between mb-3 text-muted">
                  <span>Room Cost {local?.nights ? `(${local.nights} nights)` : ''}</span>
                  <span className="fw-semibold text-dark">₹{Number(preview?.roomCost ?? local?.roomCost ?? 0).toLocaleString('en-IN')}</span>
                </div>
                
                {summaryLines.length > 0 && (
                  <div className="mb-3 border-start border-2 border-primary-custom ps-3">
                    <span className="small text-muted fw-bold text-uppercase d-block mb-2" style={{ letterSpacing: '0.5px' }}>Optional Services</span>
                    {summaryLines.map((line) => (
                      <div key={line.addOnId} className="d-flex justify-content-between small text-muted mb-2">
                        <span><i className="bi bi-plus me-1"></i> {line.name} {line.quantity > 1 ? `(x${line.quantity})` : ''}</span>
                        <span className="fw-semibold">₹{Number(line.totalPrice || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="d-flex justify-content-between mb-3 text-muted">
                  <span>Taxes & Fees</span>
                  <span className="fw-semibold text-dark">₹{Number(preview?.taxes ?? local?.taxes ?? 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="d-flex justify-content-between mb-3 text-success">
                  <span>Discount</span>
                  <span className="fw-semibold">- ₹0</span>
                </div>

                <hr className="my-4 opacity-10" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bolder fs-5 text-dark">Grand Total</span>
                  <span className="fw-bolder fs-3 text-primary-custom">₹{Number(preview?.totalPrice ?? local?.total ?? 0).toLocaleString('en-IN')}</span>
                </div>

                <button className="btn-primary-custom w-100 py-3 text-uppercase fw-bold mb-3 shadow-sm ripple" style={{ letterSpacing: '1px', borderRadius: '12px' }} onClick={handleConfirm} disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                  ) : (
                    'Complete Booking'
                  )}
                </button>
                
                <div className="text-center mt-3">
                  <span className="text-muted small fw-semibold"><i className="bi bi-shield-lock-fill me-1 text-success"></i> Secure 256-bit encrypted checkout</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function isOptionalService(entry) {
  const name = String(entry?.addOn?.name || entry?.name || '').trim().toLowerCase();
  return OPTIONAL_SERVICE_NAMES.some((value) => name.includes(value));
}

export default BookRoomPage;
