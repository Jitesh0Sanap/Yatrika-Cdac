import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const starLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

// Helper to generate consistent pseudo-random data for a review ID
const getReviewMetadata = (reviewId, customerName) => {
  const hash = String(reviewId || customerName).split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
  const countries = ['United Kingdom', 'United States', 'Australia', 'Germany', 'France', 'Canada', 'India', 'Japan'];
  const stayTypes = ['Couple', 'Family', 'Solo traveler', 'Business'];
  
  const country = countries[Math.abs(hash) % countries.length];
  const stayType = stayTypes[Math.abs(hash) % stayTypes.length];
  const avatarUrl = `https://i.pravatar.cc/150?u=${hash}`;
  
  const date = new Date();
  date.setDate(date.getDate() - (Math.abs(hash) % 180));
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  return { country, stayType, avatarUrl, formattedDate };
};

function ReviewSection({ hotelId, booking, compact = false }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!hotelId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const loadReviews = async () => {
      try {
        const response = await api.get(`/reviews/hotel/${hotelId}`);
        setReviews(response.data || []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [hotelId]);

  useEffect(() => {
    if (!user?.userId) {
      setMyReviews([]);
      return;
    }

    const loadMyReviews = async () => {
      try {
        const response = await api.get('/reviews/my-reviews');
        setMyReviews(response.data || []);
      } catch {
        setMyReviews([]);
      }
    };

    loadMyReviews();
  }, [user?.userId]);

  const existingReview = useMemo(() => {
    if (!booking) return null;
    return myReviews.find((review) => review.bookingId === booking.bookingId) || null;
  }, [booking, myReviews]);

  const isEligibleForReview = Boolean(
    booking &&
      (String(booking.bookingState || '').toUpperCase() === 'CHECKED_OUT' || String(booking.bookingState || '').toUpperCase() === 'COMPLETED') &&
      String(booking.paymentStatus || '').toUpperCase() === 'SUCCESS'
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === 'rating' ? Number(value) : value }));
  };

  const resetForm = () => {
    setForm({ rating: 5, title: '', comment: '' });
    setEditingReviewId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!booking) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, form);
        setSuccess('Your review has been updated.');
      } else {
        await api.post(`/reviews/booking/${booking.bookingId}`, form);
        setSuccess('Your review has been submitted.');
      }
      resetForm();
      const [updatedReviews, updatedMyReviews] = await Promise.all([
        api.get(`/reviews/hotel/${hotelId}`),
        api.get('/reviews/my-reviews')
      ]);
      setReviews(updatedReviews.data || []);
      setMyReviews(updatedMyReviews.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'We could not save that review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      const [updatedReviews, updatedMyReviews] = await Promise.all([
        api.get(`/reviews/hotel/${hotelId}`),
        api.get('/reviews/my-reviews')
      ]);
      setReviews(updatedReviews.data || []);
      setMyReviews(updatedMyReviews.data || []);
      setSuccess('Your review has been removed.');
      resetForm();   // <-- ADD THIS LINE
    } catch (err) {
      setError(err.response?.data?.message || 'We could not delete that review.');
    }
  };

  const startEdit = (review) => {
    setEditingReviewId(review.reviewId);
    setForm({ rating: review.rating, title: review.title, comment: review.comment });
  };

  return (
    <section className={compact ? 'mt-3' : 'mt-4'}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p className="text-uppercase fw-bold text-muted mb-2 small" style={{ letterSpacing: '1.5px' }}>GUEST REVIEWS</p>
          <h3 className="fw-bold mb-1">What our guests say</h3>
          <p className="text-muted mb-0">Based on {reviews.length} verified review{reviews.length === 1 ? '' : 's'}</p>
        </div>
        {reviews.length > 0 && (
          <div className="d-flex align-items-center bg-primary-light rounded-pill px-4 py-2 text-primary-custom fw-bold fs-4">
             {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} <i className="bi bi-star-fill fs-5 ms-2"></i>
          </div>
        )}
      </div>

      {error ? <div className="alert alert-danger py-2">{error}</div> : null}
      {success ? <div className="alert alert-success py-2">{success}</div> : null}

      {booking && user ? (
        <div className="card border-0 shadow-sm rounded-4 mb-3">
          <div className="card-body">
            {existingReview && !editingReviewId ? (
              <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                <div>
                  <div className="fw-semibold">You reviewed this stay</div>
                  <div className="text-muted small">{existingReview.title}</div>
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => startEdit(existingReview)}>Edit</button>
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(existingReview.reviewId)}>Delete</button>
                </div>
              </div>
            ) : (isEligibleForReview || editingReviewId) ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-2 fw-semibold">Share your experience</div>
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label small">Rating</label>
                    <select className="form-select" name="rating" value={form.rating} onChange={handleChange}>
                      {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small">Title</label>
                    <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="A short summary" required />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="form-label small">Comment</label>
                  <textarea className="form-control" name="comment" rows="3" value={form.comment} onChange={handleChange} placeholder="Tell future guests what you liked" required />
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-success btn-sm" type="submit" disabled={submitting}>{submitting ? 'Saving…' : editingReviewId ? 'Update review' : 'Submit review'}</button>
                  {editingReviewId ? <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetForm}>Cancel</button> : null}
                </div>
              </form>
            ) : (
              <div className="text-muted small">Reviews unlock for completed stays with successful payment.</div>
            )}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="text-center py-5">
           <div className="spinner-border text-primary-custom" role="status"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="alert alert-light border text-center p-5 rounded-4">
           <i className="bi bi-chat-left-text fs-1 text-muted mb-3 d-block"></i>
           <h5 className="fw-bold">No reviews yet</h5>
           <p className="text-muted mb-0">Be the first to review this property after your stay.</p>
        </div>
      ) : (
        <div className="row g-4">
          {reviews.map((review) => {
            const meta = getReviewMetadata(review.reviewId, review.customerName);
            return (
              <div key={review.reviewId} className="col-12 col-md-6">
                <article className="card border-0 shadow-sm rounded-4 h-100 hover-shadow transition-all">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <img src={meta.avatarUrl} alt="avatar" className="rounded-circle me-3" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                      <div>
                        <div className="fw-bold text-dark">{review.customerName || 'Guest'}</div>
                        <div className="small text-muted d-flex align-items-center">
                          <i className="bi bi-geo-alt-fill me-1"></i> {meta.country}
                        </div>
                      </div>
                      <div className="ms-auto text-end">
                         <span className="badge bg-success-light text-success mb-1"><i className="bi bi-check-circle-fill me-1"></i> Verified</span>
                         <div className="small text-muted">{meta.formattedDate}</div>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center mb-2">
                       <div className="text-gold me-2">
                         {[...Array(5)].map((_, i) => (
                            <i key={i} className={`bi bi-star${i < review.rating ? '-fill' : ''}`}></i>
                         ))}
                       </div>
                       <span className="fw-bold small">{starLabels[review.rating - 1]}</span>
                    </div>
                    
                    <h6 className="fw-bold mb-2">"{review.title}"</h6>
                    <p className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>{review.comment}</p>
                    
                    <div className="mt-auto border-top pt-3 text-muted small d-flex align-items-center">
                      <i className="bi bi-suitcase-fill me-2"></i> {meta.stayType}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ReviewSection;

