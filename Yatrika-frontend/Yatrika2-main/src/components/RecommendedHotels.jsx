import React from 'react';
import { Link } from 'react-router-dom';
import HotelCard from './HotelCard';

function RecommendedHotels({ hotels = [] }) {
  const items = hotels.slice(0, 8); // Showing up to 8 recommended

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-light" style={{ width: '80px', height: '80px', color: 'var(--text-muted)' }}>
          <i className="bi bi-building fs-2"></i>
        </div>
        <p className="text-muted">No recommended hotels available right now.</p>
      </div>
    );
  }

  return (
    <div className="row g-4 mt-2">
      {items.map(hotel => (
        <div className="col-12 col-md-6 col-lg-3" key={hotel.hotelId}>
          <HotelCard hotel={hotel} />
        </div>
      ))}
    </div>
  );
}

export default RecommendedHotels;
