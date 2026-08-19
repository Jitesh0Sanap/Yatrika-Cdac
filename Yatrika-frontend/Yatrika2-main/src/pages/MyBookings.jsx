import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPaymentMeta } from '../services/paymentStorage';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user?.userId) {
        setBookings([]);
        setLoading(false);
        return;
      }
      try {
        const resp = await api.get(`/bookings/users/${user.userId}/bookings`);
        const allBookings = resp.data || [];
        const hydrated = allBookings.map((booking) => {
          const paymentMeta = getPaymentMeta(booking.bookingId);
          if (paymentMeta) {
            return { ...booking, bookingState: 'CONFIRMED', paymentStatus: paymentMeta.paymentStatus || 'SUCCESS', paymentReference: paymentMeta.transactionReference, paidAmount: paymentMeta.amount, paidOn: paymentMeta.paymentTime };
          }
          return booking;
        });
        setBookings(hydrated);
      } catch (e) {
        setError('Your bookings could not be loaded right now.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.userId]);

  const today = new Date();
  const getStatus = (booking) => {
    const checkIn = new Date(booking.checkInDate || booking.checkIn || '');
    const checkOut = new Date(booking.checkOutDate || booking.checkOut || '');
    if (booking.bookingState === 'CANCELLED') return 'cancelled';
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) return 'completed';
    if (checkIn <= today && today <= checkOut) return 'current';
    if (checkIn > today) return 'upcoming';
    return 'completed';
  };

  const filtered = bookings.filter((booking) => getStatus(booking) === tab);

  return (
    <main className="pb-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh' }}>
      
      {/* Premium Header */}
      <div className="bg-white border-bottom pt-5 pb-4 mb-5 shadow-sm position-sticky top-0" style={{ zIndex: 100 }}>
        <div className="page-container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div>
            <div className="d-flex align-items-center mb-2">
              <span className="badge bg-primary-custom text-white fw-bold me-2 px-2 py-1 shadow-sm"><i className="bi bi-briefcase-fill me-1"></i> Trips</span>
              <p className="text-muted small fw-bolder text-uppercase mb-0" style={{ letterSpacing: '1px' }}>Your Travel History</p>
            </div>
            <h2 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.5px', fontSize: '2.5rem' }}>My Bookings</h2>
          </div>
          
          <div className="d-flex bg-light rounded-pill p-1 shadow-sm border" style={{ maxWidth: '400px' }}>
            <button className={`btn rounded-pill border-0 px-4 py-2 fw-bold text-nowrap transition-all ${tab === 'upcoming' ? 'btn-white shadow-sm text-primary-custom' : 'text-muted'}`} onClick={() => setTab('upcoming')} style={{ backgroundColor: tab === 'upcoming' ? 'white' : 'transparent' }}>Upcoming</button>
            <button className={`btn rounded-pill border-0 px-4 py-2 fw-bold text-nowrap transition-all ${tab === 'current' ? 'btn-white shadow-sm text-primary-custom' : 'text-muted'}`} onClick={() => setTab('current')} style={{ backgroundColor: tab === 'current' ? 'white' : 'transparent' }}>Current</button>
            <button className={`btn rounded-pill border-0 px-4 py-2 fw-bold text-nowrap transition-all ${tab === 'completed' ? 'btn-white shadow-sm text-primary-custom' : 'text-muted'}`} onClick={() => setTab('completed')} style={{ backgroundColor: tab === 'completed' ? 'white' : 'transparent' }}>Completed</button>
            <button className={`btn rounded-pill border-0 px-4 py-2 fw-bold text-nowrap transition-all ${tab === 'cancelled' ? 'btn-white shadow-sm text-danger' : 'text-muted'}`} onClick={() => setTab('cancelled')} style={{ backgroundColor: tab === 'cancelled' ? 'white' : 'transparent' }}>Cancelled</button>
          </div>
        </div>
      </div>
      
      <div className="page-container" style={{ maxWidth: '900px' }}>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary-custom" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger border-0 shadow-sm p-4 rounded-3">
          <i className="bi bi-exclamation-triangle-fill fs-4 me-2"></i>{error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 my-5 bg-white rounded-4 shadow-sm border p-5">
          <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-light" style={{ width: '80px', height: '80px', color: 'var(--text-muted)' }}>
            <i className="bi bi-calendar2-x fs-1 text-primary-custom"></i>
          </div>
          <h3 className="fw-bolder mb-2 text-dark">No {tab.replace('-', ' ')} bookings</h3>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>You don't have any {tab} trips right now. Time to plan your next adventure!</p>
          <button className="btn-primary-custom px-4 py-2 hover-lift" onClick={() => navigate('/')}>
            Explore Destinations
          </button>
        </div>
      ) : filtered.map((b) => {
        const paymentMeta = getPaymentMeta(b.bookingId);
        const paymentStatus = String(b.paymentStatus || '').toUpperCase() || (b.bookingState === 'CONFIRMED' ? 'SUCCESS' : 'PENDING');
        return (
          <div key={b.bookingId} className="premium-card p-0 mb-4 hover-lift shadow-sm" style={{ overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
            
            {/* Card Header */}
            <div className="bg-light bg-opacity-50 border-bottom p-3 px-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary-custom text-white d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '40px', height: '40px' }}>
                  <i className="bi bi-building"></i>
                </div>
                <div>
                  <h5 className="fw-bolder mb-0 text-dark">{b.hotel?.name || b.hotelName}</h5>
                  <p className="text-muted small mb-0 fw-semibold">{b.roomCategory?.roomType || b.roomCategory || 'Selected room'}</p>
                </div>
              </div>
              <div className="text-end">
                <span className={`badge ${b.bookingState === 'CONFIRMED' ? 'bg-success' : b.bookingState === 'CANCELLED' ? 'bg-danger' : 'bg-warning text-dark'} px-3 py-2 rounded-pill shadow-sm`} style={{ letterSpacing: '0.5px' }}>
                  {String(b.bookingState || '').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 bg-white d-flex flex-column flex-md-row gap-4 align-items-md-center justify-content-between">
              
              <div className="d-flex gap-4">
                <div>
                  <p className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}><i className="bi bi-calendar-event me-1"></i> Check-in</p>
                  <h6 className="fw-bolder text-dark mb-0">{b.checkInDate || b.checkIn}</h6>
                </div>
                <div style={{ width: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
                <div>
                  <p className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}><i className="bi bi-calendar-check me-1"></i> Check-out</p>
                  <h6 className="fw-bolder text-dark mb-0">{b.checkOutDate || b.checkOut}</h6>
                </div>
              </div>

              <div className="d-flex flex-column align-items-md-end">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Total</span>
                  <h4 className="fw-bolder text-primary-custom mb-0">₹{Number(b.totalPrice || 0).toLocaleString('en-IN')}</h4>
                </div>
                
                <div className="d-flex align-items-center gap-2">
                  {paymentStatus === 'SUCCESS' ? (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25"><i className="bi bi-check-circle-fill me-1"></i> Paid</span>
                  ) : (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"><i className="bi bi-hourglass-split me-1"></i> Payment Pending</span>
                  )}
                  {paymentMeta && <span className="small text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Txn: {paymentMeta.transactionReference}</span>}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-light p-3 px-4 border-top d-flex justify-content-between align-items-center">
              <span className="text-muted small fw-semibold">
                {b.bookingReference ? `Booking Ref: ${b.bookingReference}` : `Booking ID: #${b.bookingId}`}
              </span>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm fw-bold hover-lift" onClick={() => navigate(`/bookings/${b.bookingId}`)}>View Details</button>
                {paymentStatus !== 'SUCCESS' && b.bookingState === 'PAYMENT_PENDING' && (
                  <button className="btn btn-primary-custom btn-sm fw-bold hover-lift shadow-sm" onClick={() => navigate(`/payments/${b.bookingId}`)}>Pay Now</button>
                )}
              </div>
            </div>
            
          </div>
        );
      })}
      </div>
    </main>
  );
}
