import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import PaymentMethodCard from '../components/PaymentMethodCard';
import { getPaymentMeta, savePaymentMeta } from '../services/paymentStorage';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PAYMENT_OPTIONS = [
  { value: 'UPI', label: 'UPI', description: 'Instant transfer', icon: 'bi-phone' },
  { value: 'CREDIT_CARD', label: 'Credit Card', description: 'Visa, MasterCard', icon: 'bi-credit-card' },
  { value: 'DEBIT_CARD', label: 'Debit Card', description: 'Bank debit card', icon: 'bi-credit-card-2-front' },
  { value: 'NET_BANKING', label: 'Net Banking', description: 'Secure bank transfer', icon: 'bi-bank' },
  { value: 'WALLET', label: 'Wallet', description: 'Paytm, PhonePe', icon: 'bi-wallet2' },
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('UPI');

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}`);
        setBooking(data);
        const stored = getPaymentMeta(bookingId);
        if (stored) {
          setSuccess(stored);
        }
      } catch (err) {
        setError('Booking details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const bookingState = useMemo(() => String(booking?.bookingState || '').toUpperCase(), [booking]);

  const handlePay = async (event) => {
    event.preventDefault();
    if (!bookingId || processing) return;

    setProcessing(true);
    setError('');
    setSuccess(null);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError('Razorpay SDK failed to load. Check your connection.');
        setProcessing(false);
        return;
      }

      const orderResp = await api.post(`/payments/${bookingId}/order`);
      const { razorpayOrderId, amount, currency, keyId } = orderResp.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || keyId,
        amount: amount,
        currency: currency,
        name: "Yatrika Bookings",
        description: `Payment for Booking #${bookingId}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            setProcessing(true);
            const verifyResp = await api.post(`/payments/${bookingId}/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            const data = verifyResp.data;
            const paymentResult = {
              transactionReference: data?.transactionReference || response.razorpay_payment_id,
              paymentTime: data?.paymentTime || new Date().toISOString(),
              amount: booking?.totalPrice || 0,
              bookingId: data?.bookingId || bookingId,
              hotelName: booking?.hotelName || booking?.hotel?.name || 'Hotel',
              paymentStatus: data?.paymentStatus || 'SUCCESS',
            };

            savePaymentMeta(bookingId, paymentResult);
            setSuccess(paymentResult);
            setBooking((current) => current ? { ...current, bookingState: 'CONFIRMED', paymentStatus: 'SUCCESS' } : current);
          } catch (err) {
            setError(err?.response?.data || 'Payment verification failed.');
          } finally {
            setProcessing(false);
          }
        },
        theme: {
          color: "#0D5C46" // Yatrika Primary
        },
        prefill: {
          name: booking?.user?.name || booking?.userName || "Yatrika Guest",
          email: booking?.user?.email || booking?.userEmail || "guest@example.com",
          contact: booking?.user?.phone || booking?.userPhone || "9999999999"
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            setError('Payment cancelled by user.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
         setError(`Payment failed: ${response.error.description}`);
         setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      const message = err?.response?.data || 'Failed to initialize payment.';
      setError(typeof message === 'string' ? message : 'Failed to initialize payment.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="page-container py-5 text-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem', marginTop: '15vh' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="page-container py-5 text-center" style={{ minHeight: '80vh' }}>
        <div className="alert alert-danger border-0 shadow-sm p-4 rounded-3 d-inline-block mt-5">
          <i className="bi bi-exclamation-triangle fs-3 mb-2 d-block"></i>
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="pb-5" style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white border-bottom pt-5 pb-4 mb-5 shadow-sm position-sticky top-0" style={{ zIndex: 100 }}>
        <div className="page-container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <Link to={`/bookings/${bookingId}`} className="btn btn-light rounded-circle me-4 shadow-sm hover-lift" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-arrow-left fs-5"></i>
            </Link>
            <div>
              <p className="text-muted small mb-0 fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Payment</p>
              <h2 className="fw-bolder mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>Complete your booking</h2>
            </div>
          </div>
          {/* Elegant progress indicator */}
          <div className="d-none d-md-flex align-items-center gap-2">
            <div className="d-flex flex-column align-items-center opacity-50">
              <div className="rounded-circle bg-secondary text-dark d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px' }}><i className="bi bi-check2"></i></div>
              <span className="small mt-1 fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Details</span>
            </div>
            <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--primary-color)', opacity: 0.2 }}></div>
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle bg-primary-custom text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '32px', height: '32px' }}>2</div>
              <span className="small mt-1 fw-bold text-primary-custom" style={{ fontSize: '0.75rem' }}>Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="row gx-lg-5">
          <div className="col-lg-8">
            <div className="premium-card p-4 p-md-5 mb-4">
              
              <div className="d-flex align-items-center mb-4 pb-4 border-bottom">
                <div className="rounded overflow-hidden me-4" style={{ width: '120px', height: '120px', flexShrink: 0, backgroundImage: `url(${booking?.hotel?.imageUrl || 'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div>
                  <div className="badge bg-light text-dark border mb-2">{booking?.hotel?.category || 'Luxury'}</div>
                  <h4 className="fw-bold mb-1">{booking?.hotelName || 'Hotel'}</h4>
                  <p className="text-muted mb-0">{booking?.roomCategory || booking?.roomType || 'Room'} • {booking?.numberOfGuests || 1} Guests</p>
                  <p className="text-muted small mb-0 mt-1"><i className="bi bi-calendar3 me-1"></i> {booking?.checkIn || booking?.checkInDate || '—'} to {booking?.checkOut || booking?.checkOutDate || '—'}</p>
                </div>
              </div>

              {!success && (
                <>
                  <h5 className="fw-bolder mb-4 text-dark">How would you like to pay?</h5>
                  <div className="row g-3 mb-4">
                    {PAYMENT_OPTIONS.map((option) => (
                      <div className="col-12 col-md-6" key={option.value}>
                        <div 
                          className={`p-4 rounded-4 border cursor-pointer d-flex align-items-center hover-lift ${selectedMethod === option.value ? 'border-primary-custom bg-primary-custom bg-opacity-10 shadow-sm' : 'bg-white shadow-sm'}`}
                          style={{ transition: 'all 0.3s' }}
                          onClick={() => setSelectedMethod(option.value)}
                        >
                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', backgroundColor: selectedMethod === option.value ? 'var(--primary-color)' : 'var(--bg-light)', color: selectedMethod === option.value ? 'white' : 'var(--text-dark)' }}>
                            <i className={`bi ${option.icon} fs-4`}></i>
                          </div>
                          <div>
                            <div className="fw-bolder text-dark">{option.label}</div>
                            <div className="text-muted small fw-semibold">{option.description}</div>
                          </div>
                          <div className="ms-auto">
                            <div className={`rounded-circle border d-flex align-items-center justify-content-center ${selectedMethod === option.value ? 'border-primary bg-primary' : ''}`} style={{ width: '24px', height: '24px' }}>
                              {selectedMethod === option.value && <i className="bi bi-check text-white" style={{ fontSize: '16px' }}></i>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {error && <div className="alert alert-danger border-0 small py-3 mb-4"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
              
              {success && (
                <div className="alert alert-success border-0 p-4 mb-4 rounded-4 text-center">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-check-lg fs-2"></i>
                  </div>
                  <h4 className="fw-bold mb-2">Payment Successful</h4>
                  <p className="text-muted mb-0">Transaction Ref: {success.transactionReference}</p>
                </div>
              )}

              {!success ? (
                <button className="btn-primary-custom w-100 py-3 text-uppercase fw-bold" style={{ fontSize: '1.1rem', letterSpacing: '1px' }} onClick={handlePay} disabled={processing}>
                  {processing ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                  ) : (
                    <>Pay ₹{Number(booking?.totalPrice || 0).toLocaleString('en-IN')}</>
                  )}
                </button>
              ) : (
                <div className="d-flex flex-column flex-md-row gap-3">
                  <button className="btn-primary-custom flex-grow-1" onClick={() => navigate(`/bookings/${bookingId}`)}>View Booking</button>
                  <button className="btn-outline-custom flex-grow-1" onClick={() => navigate('/my-bookings')}>Back to My Bookings</button>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4 mt-5 mt-lg-0">
            <div className="premium-card p-0 sticky-top shadow-lg" style={{ top: '120px', border: '1px solid rgba(0,0,0,0.08)' }}>
              <div className="p-4 border-bottom bg-white">
                <h5 className="fw-bolder mb-0 text-dark">Order Summary</h5>
              </div>
              <div className="p-4 bg-white">
                <div className="d-flex justify-content-between mb-3 text-muted">
                  <span className="fw-semibold">Booking Reference</span>
                  <span className="fw-bolder text-dark">#{bookingId}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-muted">
                  <span className="fw-semibold">Booking Status</span>
                  <span className={`badge ${bookingState === 'CONFIRMED' ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>{bookingState}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-muted">
                  <span className="fw-semibold">Payment Status</span>
                  <span className={`fw-bold ${success ? 'text-success' : 'text-warning'}`}>{success ? 'SUCCESS' : booking?.paymentStatus || 'PENDING'}</span>
                </div>
                
                <hr className="my-4 opacity-10" />
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bolder fs-5 text-dark">Total Pay</span>
                  <span className="fw-bolder fs-3 text-primary-custom">₹{Number(booking?.totalPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                
                <div className="text-center bg-light p-3 rounded-4 border">
                  <div className="text-muted small fw-semibold d-flex align-items-center justify-content-center">
                    <i className="bi bi-shield-lock-fill text-success me-2 fs-4"></i> 
                    <span style={{ letterSpacing: '0.5px' }}>Payments are secure and 256-bit encrypted.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
