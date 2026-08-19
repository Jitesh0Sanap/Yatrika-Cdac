import React from 'react';
import { getHotelPrice } from '../utils/hotelUtils';

function BookingSummaryCard({ hotel }) {
  const price = getHotelPrice(hotel);

  return (
    <div className="premium-card p-4 sticky-top" style={{ top: '100px', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ letterSpacing: '1px' }}>Starting from</div>
          <div className="fw-bold" style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>
            {price ? `₹${Number(price).toLocaleString('en-IN')}` : 'View Rates'}
          </div>
        </div>
        <div className="text-muted pb-1">/ night</div>
      </div>

      <div className="d-flex align-items-center mb-4">
        <div className="d-flex align-items-center justify-content-center bg-light rounded px-2 py-1 me-2" style={{ border: '1px solid var(--border-color)' }}>
          <i className="bi bi-star-fill text-gold small me-1"></i>
          <span className="fw-bold small">{hotel?.avgRating ? Number(hotel.avgRating).toFixed(1) : 'New'}</span>
        </div>
        <a href="#reviews" className="text-decoration-none text-muted small hover-primary transition">
          {hotel?.reviewCount ?? 0} reviews
        </a>
      </div>

      <div className="alert alert-light border d-flex align-items-start p-3 mb-4 rounded-3">
        <i className="bi bi-info-circle text-primary-custom fs-5 me-3"></i>
        <div className="small text-muted">
          Select a room category below to check availability and proceed with your booking.
        </div>
      </div>

      <button className="btn-primary-custom w-100 py-3 mb-3 text-uppercase fw-bold" style={{ letterSpacing: '1px' }} onClick={() => {
        document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
      }}>
        Check Availability
      </button>

      <div className="text-center text-muted small fw-semibold">
        <i className="bi bi-shield-check text-success me-1"></i> 100% Secure Checkout
      </div>
    </div>
  );
}

export default BookingSummaryCard;
