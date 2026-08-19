import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomImage } from '../utils/imageUtils';

function RoomCard({ room, hotelId, hotelCategory, hotel }) {
  const navigate = useNavigate();
  const defaultImage = getRoomImage(room, hotelCategory);
  const [imgSrc, setImgSrc] = useState(defaultImage);

  // Generate some realistic fake data for missing room fields based on roomType
  const roomType = room.roomType?.toLowerCase() || '';
  const bedType = room.bedType || (roomType.includes('twin') ? '2 Twin Beds' : roomType.includes('king') ? '1 King Bed' : '1 Queen Bed');
  const roomSize = room.roomSize || (roomType.includes('suite') ? '45 m²' : '25 m²');
  const hasBreakfast = true;
  const isFreeCancellation = true;
  
  // Explicit UI requirements from Phase 5
  const hasBalcony = roomType.includes('suite') || roomType.includes('deluxe') || roomType.includes('balcony');
  const viewType = room.viewType || (roomType.includes('ocean') ? 'Ocean View' : roomType.includes('city') ? 'City View' : 'Garden View');
  const hasSmartTV = true;
  const hasMiniBar = roomType.includes('suite') || roomType.includes('deluxe');

  const parsedHighlights = room.roomHighlights ? room.roomHighlights.split(',').map(s=>s.trim()) : [];
  
  const baseFeatures = Array.isArray(room.features) && room.features.length > 0 
    ? room.features 
    : parsedHighlights.length > 0 ? parsedHighlights : ['Air Conditioning', 'Free WiFi', 'Private Bathroom'];
    
  if (hasBalcony && !baseFeatures.includes('Balcony')) baseFeatures.push('Balcony');
  if (hasSmartTV && !baseFeatures.includes('Smart TV')) baseFeatures.push('Smart TV');
  if (hasMiniBar && !baseFeatures.includes('Mini Bar')) baseFeatures.push('Mini Bar');

  return (
    <article className="card border rounded-4 overflow-hidden shadow-sm hover-lift transition-all bg-white mb-4">
      <div className="row g-0">
        <div className="col-md-4 position-relative">
          <img 
            src={imgSrc} 
            className="img-fluid h-100 w-100 image-fade-in" 
            alt={room.roomType} 
            style={{ objectFit: 'cover', minHeight: '260px' }}
            onError={() => setImgSrc(getRoomImage(null, hotelCategory))}
          />
          <div className="position-absolute top-0 start-0 m-3 px-2 py-1 bg-dark bg-opacity-75 text-white small rounded shadow-sm">
             <i className="bi bi-images me-1"></i> Room Photos
          </div>
        </div>
        <div className="col-md-5 border-end">
          <div className="card-body p-4 h-100 d-flex flex-column">
            <h4 className="card-title fw-bold mb-3 text-dark d-flex justify-content-between align-items-center">
              {room.roomType}
              <span className="badge bg-light text-muted border fw-normal small px-2 py-1"><i className="bi bi-eye me-1"></i> {viewType}</span>
            </h4>
            
            <div className="d-flex gap-3 text-muted small fw-semibold mb-3 flex-wrap">
              <span title="Room Size"><i className="bi bi-arrows-fullscreen me-1 text-primary-custom"></i> {roomSize}</span>
              <span title="Max Guests"><i className="bi bi-people-fill me-1 text-primary-custom"></i> {room.capacity} Guests</span>
              <span title="Bed Type"><i className="bi bi-usb-drive-fill me-1 text-primary-custom" style={{ transform: 'rotate(90deg)', display: 'inline-block' }}></i> {bedType}</span>
            </div>
            
            <div className="mb-3 d-flex flex-wrap gap-2">
              {baseFeatures.slice(0, 6).map((f, idx) => (
                <span className="badge bg-light text-secondary border fw-normal" key={idx}>
                  <i className="bi bi-check2 text-success me-1"></i>{f}
                </span>
              ))}
            </div>
            
            {room.description && (
              <p className="text-muted small mb-0 mt-auto text-truncate-2" title={room.description}>{room.description}</p>
            )}
          </div>
        </div>
        <div className="col-md-3 bg-light">
          <div className="card-body p-4 h-100 d-flex flex-column justify-content-center align-items-md-end text-md-end">
            <div className="mb-3 w-100 text-md-end">
              {hasBreakfast && <div className="text-success small fw-bold mb-1"><i className="bi bi-cup-hot-fill me-1"></i> Breakfast Included</div>}
              {isFreeCancellation && <div className="text-success small fw-bold"><i className="bi bi-check-circle-fill me-1"></i> Free Cancellation</div>}
            </div>
            
            <div className="mt-auto w-100 text-md-end">
              <div className="text-muted small">Price for 1 night</div>
              {room.discountedPrice && (
                <div className="text-danger small text-decoration-line-through mb-1">
                  ₹{Number(room.pricePerNight).toLocaleString('en-IN')}
                </div>
              )}
              <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
                ₹{Number(room.pricePerNight ?? room.price).toLocaleString('en-IN')}
              </div>
              <div className="text-muted small mb-3">+ taxes and charges</div>
              
              <button 
                className="btn btn-primary-custom fw-bold w-100 py-2 shadow-sm ripple"
                onClick={() => navigate(`/hotels/${hotelId}/book`, { state: { roomCategoryId: room.roomCategoryId, hotel } })}
              >
                Select Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default RoomCard;

