import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getHotelPrice } from '../utils/hotelUtils';
import { generateImageModel } from '../utils/imageUtils';

export default function HotelCard({ hotel }) {
  const images = generateImageModel(hotel);
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  const price = getHotelPrice(hotel);
  const [imgSrc, setImgSrc] = useState(images.heroImage);

  return (
    <Link to={`/hotels/${hotel.hotelId}`} className="text-decoration-none h-100 d-block">
      <article 
        className="premium-card h-100 d-flex flex-column bg-white" 
        style={{ 
          borderRadius: 'var(--border-radius-lg)', 
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
        }}
      >
        <div className="position-relative overflow-hidden" style={{ height: '240px' }}>
          <img 
            src={imgSrc} 
            alt={hotel.name}
            className="w-100 h-100"
            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onError={() => setImgSrc(images.fallbackImage)}
            loading="lazy"
          />
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none' }}></div>
          
          {hotel.category && (
            <div className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill bg-white text-dark shadow-sm fw-bold small text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
              {hotel.category}
            </div>
          )}
          <div className="position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm" style={{ width: '36px', height: '36px', cursor: 'pointer', zIndex: 2 }}>
            <i className="bi bi-heart text-muted"></i>
          </div>
        </div>
        
        <div className="p-4 d-flex flex-column flex-grow-1">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <p className="text-muted small fw-semibold text-uppercase mb-0" style={{ letterSpacing: '0.5px' }}><i className="bi bi-geo-alt-fill text-primary-custom me-1"></i> {hotel.city}{hotel.state ? `, ${hotel.state}` : ''}</p>
            <div className="d-flex align-items-center rounded px-2 py-1" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
              <span className="fw-bold small">{hotel.avgRating ? Number(hotel.avgRating).toFixed(1) : 'New'}</span>
            </div>
          </div>
          
          <h5 className="fw-bold mb-2 text-dark" style={{ fontSize: '1.25rem', lineHeight: '1.4' }}>{hotel.name}</h5>
          
          {hotel.matchScore !== undefined && (
            <div className="mb-2 d-flex align-items-center gap-2">
              <span className="badge bg-success bg-opacity-10 text-success border border-success">
                {Math.round(hotel.matchScore)}% Match
              </span>
              {hotel.recommendationReason && (
                <span className="text-muted small fst-italic">
                  <i className="bi bi-stars text-gold me-1"></i>
                  {hotel.recommendationReason}
                </span>
              )}
            </div>
          )}
          
          <div className="mb-3 d-flex flex-wrap gap-2">
            {amenities.slice(0, 3).map((am, i) => (
              <span key={i} className="badge bg-light text-secondary border fw-normal" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-check2 me-1 text-success"></i>{am.replace(/_/g, ' ')}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="badge bg-light text-secondary border fw-normal" style={{ fontSize: '0.75rem' }}>
                +{amenities.length - 3} more
              </span>
            )}
          </div>
          
          <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-end">
            <div>
              <span className="text-muted small d-block mb-1">Price per night</span>
              <div className="text-dark fw-bold" style={{ fontSize: '1.4rem' }}>
                {price ? `₹${Number(price).toLocaleString('en-IN')}` : 'View Rates'}
              </div>
            </div>
            <button className="btn btn-sm btn-primary-custom fw-bold px-3 py-2">
              View Details
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}

