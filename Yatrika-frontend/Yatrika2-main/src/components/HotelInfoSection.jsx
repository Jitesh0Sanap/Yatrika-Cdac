import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HotelInfoSection({ hotel }) {
  const [expanded, setExpanded] = useState(false);
  const amenitiesPreview = Array.isArray(hotel?.amenities) ? hotel.amenities.slice(0,5) : [];

  return (
    <div className="hotel-info py-4 border-bottom">
      <div className="d-flex justify-content-between align-items-start mb-2">
        {hotel?.category && (
          <span className="badge rounded-pill bg-light text-dark border px-3 py-2 text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            {hotel.category}
          </span>
        )}
      </div>
      
      <h1 className="fw-bold mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>{hotel?.name}</h1>
      {hotel?.tagline && <p className="text-muted fs-5 fst-italic mb-3">{hotel.tagline}</p>}

      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1">
          <i className="bi bi-star-fill text-gold me-2"></i>
          <span className="fw-bold">{hotel?.avgRating ? Number(hotel.avgRating).toFixed(1) : 'New'}</span>
          <span className="text-muted ms-1">({hotel?.reviewCount ?? 0} reviews)</span>
        </div>
        
        <div className="d-flex align-items-center text-muted fw-semibold">
          <i className="bi bi-geo-alt-fill text-primary-custom me-2"></i>
          {hotel?.city}{hotel?.location ? `, ${hotel.location}` : ''}
        </div>
        
        <a href="#reviews" className="text-decoration-none text-primary-custom fw-semibold small">Read reviews</a>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {amenitiesPreview.map((a) => (
          <div className="d-inline-flex align-items-center bg-light border rounded px-3 py-2 text-muted small fw-semibold" key={a}>
            <i className="bi bi-check2-circle text-success me-2 fs-6"></i>
            {a.replaceAll('_',' ')}
          </div>
        ))}
        {hotel?.amenities?.length > 5 && (
          <div className="d-inline-flex align-items-center bg-light border rounded px-3 py-2 text-muted small fw-semibold cursor-pointer">
             +{hotel.amenities.length - 5} more
          </div>
        )}
      </div>

      <div className="description mt-4">
        <h4 className="fw-bold mb-3">About this hotel</h4>
        <div 
          className={`text-muted ${expanded ? '' : 'overflow-hidden'}`} 
          style={{ 
            lineHeight: '1.8', 
            fontSize: '1.1rem',
            maxHeight: expanded ? 'none' : '150px',
            position: 'relative'
          }}
        >
          {hotel?.about || hotel?.description || 'No description available for this property.'}
          
          {!expanded && (hotel?.about?.length > 250 || hotel?.description?.length > 250) && (
            <div 
              className="position-absolute bottom-0 start-0 w-100" 
              style={{ height: '80px', background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))' }}
            ></div>
          )}
        </div>
        
        {(hotel?.about?.length > 250 || hotel?.description?.length > 250) && (
          <button 
            className="btn btn-link px-0 text-primary-custom text-decoration-none fw-bold mt-2" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Show more'} <i className={`bi bi-chevron-${expanded ? 'up' : 'down'} ms-1`}></i>
          </button>
        )}
      </div>

      {(hotel?.distanceFromAirport || hotel?.distanceFromCityCenter || hotel?.establishedYear) && (
        <div className="mt-4 pt-4 border-top">
          <h5 className="fw-bold mb-3">Property Highlights</h5>
          <div className="d-flex flex-wrap gap-4 text-muted">
            {hotel.establishedYear && (
              <div><i className="bi bi-building-check me-2"></i> Established {hotel.establishedYear}</div>
            )}
            {hotel.distanceFromAirport && (
              <div><i className="bi bi-airplane me-2"></i> {hotel.distanceFromAirport.toFixed(1)} km from airport</div>
            )}
            {hotel.distanceFromCityCenter && (
              <div><i className="bi bi-signpost-split me-2"></i> {hotel.distanceFromCityCenter.toFixed(1)} km from city center</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelInfoSection;
