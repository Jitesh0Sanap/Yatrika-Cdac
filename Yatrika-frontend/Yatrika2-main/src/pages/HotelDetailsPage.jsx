import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ImageGallery from '../components/ImageGallery';
import HotelInfoSection from '../components/HotelInfoSection';
import AmenitiesSection from '../components/AmenitiesSection';
import RoomCard from '../components/RoomCard';
import ReviewSection from '../components/ReviewSection';
import BookingSummaryCard from '../components/BookingSummaryCard';
import { generateImageModel } from '../utils/imageUtils';

function HotelDetailsPage() {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [roomCategories, setRoomCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hotelId) return;
    Promise.all([
      api.get(`/hotels/${hotelId}`),
      api.get(`/hotels/${hotelId}/room-categories`)
    ])
      .then(([hotelResponse, categoriesResponse]) => {
        setHotel(hotelResponse.data);
        setRoomCategories(categoriesResponse.data || []);
      })
      .catch(() => setError('Hotel details could not be loaded. Please try again later.'));
  }, [hotelId]);

  if (error) {
    return (
      <main className="page-container py-5" style={{ minHeight: '80vh' }}>
        <div className="alert alert-danger border-0 shadow-sm p-4 d-flex align-items-center rounded-3">
          <i className="bi bi-exclamation-triangle fs-3 me-3"></i>
          <div>{error}</div>
        </div>
        <Link to="/hotels" className="btn-outline-custom mt-4 d-inline-block"><i className="bi bi-arrow-left me-2"></i> Back to search</Link>
      </main>
    );
  }

  if (!hotel) {
    return (
      <main className="page-container py-5 text-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary-custom" role="status" style={{ width: '3rem', height: '3rem', marginTop: '15vh' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </main>
    );
  }

  const imageModel = generateImageModel(hotel);

  return (
    <main className="pb-5" style={{ backgroundColor: 'var(--bg-light)' }}>
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-bottom pt-3 pb-2 mb-4">
        <div className="page-container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted hover-opacity">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/hotels" className="text-decoration-none text-muted hover-opacity">Hotels</Link></li>
              <li className="breadcrumb-item"><Link to={`/hotels?city=${hotel.city}`} className="text-decoration-none text-muted hover-opacity">{hotel.city}</Link></li>
              <li className="breadcrumb-item active text-dark fw-bold" aria-current="page" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{hotel.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="page-container">
        {/* Title and Gallery */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <span className="badge bg-primary-custom text-uppercase shadow-sm px-3 py-2 rounded-pill" style={{ letterSpacing: '1px' }}>
                  <i className="bi bi-patch-check-fill me-1"></i> {hotel.category || 'Premium Property'}
                </span>
                <div className="d-flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi bi-star${i < Math.round(hotel.avgRating || 4) ? '-fill' : ''} fs-5`}></i>
                  ))}
                </div>
              </div>
              <h1 className="fw-bolder mb-1 text-dark" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px' }}>{hotel.name}</h1>
              <p className="text-muted mb-0 fs-6">
                <i className="bi bi-geo-alt-fill text-primary-custom me-1"></i> 
                {hotel.address || hotel.city}, {hotel.state} {hotel.zipCode}
                <span className="ms-3 badge bg-light text-muted border fw-normal"><i className="bi bi-signpost-2"></i> 2.5 km from center</span>
              </p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-light border rounded-circle shadow-sm hover-lift d-flex align-items-center justify-content-center text-primary-custom" style={{ width: '48px', height: '48px' }} title="Share">
                <i className="bi bi-share-fill"></i>
              </button>
              <button className="btn btn-light border rounded-circle shadow-sm hover-lift d-flex align-items-center justify-content-center text-danger" style={{ width: '48px', height: '48px' }} title="Save">
                <i className="bi bi-heart-fill"></i>
              </button>
            </div>
          </div>
          <ImageGallery images={imageModel.galleryImages} fallbackImage={imageModel.fallbackImage} />
        </div>

        <div className="row gx-lg-5">
          {/* Left Column: Details */}
          <div className="col-12 col-lg-8">
            <HotelInfoSection hotel={hotel} />
            
            <div className="py-4 border-bottom">
              <AmenitiesSection amenities={hotel.amenities || []} />
            </div>

            <section id="rooms-section" className="py-5 border-bottom">
              <p className="text-uppercase fw-bold text-muted mb-2 small" style={{ letterSpacing: '1.5px' }}>AVAILABILITY</p>
              <h3 className="fw-bold mb-4">Select your room</h3>

              <div className="d-flex flex-column gap-4">
                {roomCategories.length === 0 ? (
                  <div className="alert alert-light border p-4 text-center rounded-3">
                    <i className="bi bi-calendar-x fs-1 text-muted mb-3 d-block"></i>
                    <h5 className="fw-bold">No rooms available</h5>
                    <p className="text-muted mb-0">This property currently has no room categories listed.</p>
                  </div>
                ) : (
                  roomCategories.map((room) => (
                    <RoomCard key={room.roomCategoryId} room={room} hotelId={hotelId} hotelCategory={hotel.category} />
                  ))
                )}
              </div>
            </section>

            <section id="reviews" className="py-5 border-bottom">
              <ReviewSection hotelId={hotel.hotelId} booking={null} compact={false} />
            </section>
            
            <section id="map" className="py-5">
               <p className="text-uppercase fw-bold text-muted mb-2 small" style={{ letterSpacing: '1.5px' }}>LOCATION</p>
               <h3 className="fw-bold mb-4">Neighborhood & Map</h3>
               <div className="bg-light rounded-4 border overflow-hidden" style={{ height: '400px', position: 'relative' }}>
                 <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                    <i className="bi bi-map fs-1 mb-3"></i>
                    <h5 className="fw-bold text-dark">Map View Available Soon</h5>
                    <p>Explore nearby attractions in {hotel.city}</p>
                 </div>
               </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking Summary */}
          <div className="col-12 col-lg-4 mt-5 mt-lg-0">
            <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
              <BookingSummaryCard hotel={hotel} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default HotelDetailsPage;

