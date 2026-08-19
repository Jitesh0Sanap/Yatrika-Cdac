import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewSection from '../components/ReviewSection';
import api from '../services/api';
import { getPaymentMeta } from '../services/paymentStorage';

export default function BookingDetails() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.get(`/bookings/${bookingId}`);
        setBooking(resp.data);
      } catch (e) {
        setError(typeof e?.response?.data === 'string' ? e.response.data : 'Booking details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;
    const stored = getPaymentMeta(bookingId);
    if (stored) {
      setBooking((current) => current ? { ...current, bookingState: 'CONFIRMED', paymentStatus: stored.paymentStatus || 'SUCCESS', paymentReference: stored.transactionReference, paidAmount: stored.amount, paidOn: stored.paymentTime } : current);
    }
  }, [bookingId, booking]);

  const handleCancel = async () => {
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      setBooking((current) => (current ? { ...current, bookingState: 'CANCELLED' } : current));
    } catch (e) {
      setError(typeof e?.response?.data === 'string' ? e.response.data : 'Cancellation failed.');
    }
  };

  if (loading) return <main className="page-container"><div className="booking-loading">Loading booking details…</div></main>;
  if (error) return <main className="page-container"><div className="empty-state">{error}</div></main>;
  if (!booking) return <main className="page-container"><div className="empty-state">No booking found.</div></main>;

  const bookingState = String(booking.bookingState || '').toUpperCase();
  const paymentStatus = String(booking.paymentStatus || '').toUpperCase() || (bookingState === 'CONFIRMED' ? 'SUCCESS' : 'PENDING');
  const roomName = booking.roomType || booking.roomCategory || booking.roomCategoryName || 'Selected room';
  const serviceLines = Array.isArray(booking.addOnLines) ? booking.addOnLines : [];
  const paymentMeta = getPaymentMeta(bookingId);

  return (
    <main className="page-container py-4 py-md-5">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
            <div>
              <div className="pill">Booking confirmed</div>
              <h2 className="h3 mt-2 mb-1">Booking #{booking.bookingId || bookingId}</h2>
              {booking.bookingReference && <div className="text-muted">Ref: {booking.bookingReference}</div>}
            </div>
            <div className="text-md-end">
              <div className="text-uppercase small text-muted">Status</div>
              <div className="fw-bold">{bookingState}</div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="text-uppercase small text-muted">Hotel</div>
              <div className="fw-semibold">{booking.hotelName || booking.hotel?.name || 'Hotel'}</div>
            </div>
            <div className="col-md-3">
              <div className="text-uppercase small text-muted">Room</div>
              <div className="fw-semibold">{roomName}</div>
            </div>
            <div className="col-md-3">
              <div className="text-uppercase small text-muted">Guests</div>
              <div className="fw-semibold">{booking.numberOfGuests || 1}</div>
            </div>
            <div className="col-md-3">
              <div className="text-uppercase small text-muted">Payment</div>
              <div className="fw-semibold">{paymentStatus}</div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="text-uppercase small text-muted">Check-in</div>
              <div className="fw-semibold">{booking.checkIn || booking.checkInDate || '—'}</div>
            </div>
            <div className="col-md-6">
              <div className="text-uppercase small text-muted">Check-out</div>
              <div className="fw-semibold">{booking.checkOut || booking.checkOutDate || '—'}</div>
            </div>
          </div>

          <div className="border rounded-4 p-3 p-md-4 mb-4 bg-light-subtle">
            <div className="invoice-summary-row mb-2">
              <span>Room cost</span>
              <strong>₹{Number(booking.roomCost || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="invoice-summary-row mb-2">
              <span>Selected services</span>
              <strong>₹{Number(booking.addOnTotal || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="invoice-summary-row mb-2">
              <span>Taxes</span>
              <strong>₹{Number(booking.taxes || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="invoice-summary-row mb-2">
              <span>Discount</span>
              <strong>-₹{Number(booking.discount || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="invoice-summary-row fw-bold fs-5">
              <span>Grand total</span>
              <strong>₹{Number(booking.totalPrice || 0).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {paymentMeta && (
            <div className="alert alert-success mb-4">
              <div className="fw-semibold">Payment Successful</div>
              <div className="small mt-2">Transaction reference: {paymentMeta.transactionReference}</div>
              <div className="small">Paid on: {new Date(paymentMeta.paymentTime).toLocaleString()}</div>
            </div>
          )}

          {serviceLines.length > 0 && (
            <>
              <div className="booking-divider" />
              <div className="service-list service-list--summary">
                {serviceLines.map((line) => (
                  <div key={line.addOnId || line.name} className="service-row service-row--summary">
                    <span>{line.name}</span>
                    <strong>₹{Number(line.totalPrice || 0).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
            </>
          )}

          {(bookingState === 'PAYMENT_PENDING') && (
            <div className="d-flex flex-column flex-md-row gap-2 mt-4">
              <button className="btn btn-outline-danger" onClick={handleCancel}>Cancel Booking</button>
              <button className="btn btn-success" onClick={() => navigate(`/payments/${bookingId}`)}>Pay Now</button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
            </div>
          )}

          {paymentMeta && (
            <div className="d-flex flex-column flex-md-row gap-2 mt-3">
              <button className="btn btn-success" disabled>Payment Successful</button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/my-bookings')}>Back to My Bookings</button>
            </div>
          )}

          <ReviewSection hotelId={booking.hotel?.hotelId || booking.hotelId} booking={booking} compact={false} />
        </div>
      </div>
    </main>
  );
}
