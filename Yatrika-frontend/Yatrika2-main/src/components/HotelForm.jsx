import { useEffect, useState } from 'react';
import { imageService } from '../services/api';

const categories = ['BUDGET', 'LUXURY', 'RESORT', 'BUSINESS'];
const amenityOptions = ['WIFI', 'SWIMMING_POOL', 'GARDEN', 'BAR', 'SPA', 'GYM', 'RESTAURANT', 'BREAKFAST_INCLUDED', 'AIRPORT_SHUTTLE', 'CHAUFFEUR_SERVICE', 'FREE_PARKING', 'PET_FRIENDLY'];
const emptyHotel = { name: '', city: '', location: '', category: 'BUDGET', amenities: [], pricePerNight: '', imageUrl: '' };

function HotelForm({ initialHotel, submitLabel, onSubmit, saving }) {
  const [form, setForm] = useState(emptyHotel);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setForm({ ...emptyHotel, ...initialHotel, amenities: initialHotel?.amenities || [] });
  }, [initialHotel]);

  const toggleAmenity = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');
    try {
      const data = await imageService.uploadImage(file);
      setForm((current) => ({ ...current, imageUrl: data.url }));
    } catch (err) {
      setUploadError(err?.response?.data?.error || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, pricePerNight: Number(form.pricePerNight) });
  };

  return (
    <form className="p-4 p-md-5 bg-white rounded-4 shadow-sm border" onSubmit={submit}>
      <h3 className="fw-bold mb-4 pb-3 border-bottom">Property Details</h3>
      
      <div className="row g-4 mb-5">
        <div className="col-12">
          <div className="form-floating shadow-sm rounded-3">
            <input className="form-control bg-light border-0" id="hotelName" style={{ height: '64px' }} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter property name" />
            <label htmlFor="hotelName" className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}><i className="bi bi-building me-1"></i> Hotel Name</label>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-floating shadow-sm rounded-3">
            <input className="form-control bg-light border-0" id="hotelCity" style={{ height: '64px' }} required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Mumbai" />
            <label htmlFor="hotelCity" className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}><i className="bi bi-geo-alt me-1"></i> City</label>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-floating shadow-sm rounded-3">
            <input className="form-control bg-light border-0" id="hotelLoc" style={{ height: '64px' }} required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bandra West" />
            <label htmlFor="hotelLoc" className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}><i className="bi bi-pin-map me-1"></i> Location/Area</label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating shadow-sm rounded-3">
            <select className="form-select bg-light border-0" id="hotelCategory" style={{ height: '64px' }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <label htmlFor="hotelCategory" className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}><i className="bi bi-tags me-1"></i> Category</label>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-floating shadow-sm rounded-3">
            <input className="form-control bg-light border-0" id="hotelPrice" style={{ height: '64px' }} required type="number" min="1" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} placeholder="1500" />
            <label htmlFor="hotelPrice" className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}><i className="bi bi-currency-rupee me-1"></i> Starting Price (per night)</label>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <label className="form-label small fw-bold text-uppercase text-muted d-block mb-3" style={{ letterSpacing: '1px' }}><i className="bi bi-stars me-1"></i> Amenities & Facilities</label>
        <div className="row g-3">
          {amenityOptions.map((amenity) => {
            const isSelected = form.amenities.includes(amenity);
            return (
              <div className="col-6 col-md-4 col-lg-3" key={amenity}>
                <div 
                  className={`border rounded-4 p-3 cursor-pointer text-center hover-lift ${isSelected ? 'border-primary-custom bg-primary-custom bg-opacity-10 shadow-sm' : 'bg-light bg-opacity-50'}`}
                  onClick={() => toggleAmenity(amenity)}
                >
                  <div className="form-check d-flex justify-content-center align-items-center mb-0 pointer-events-none">
                    <input className="form-check-input mt-0 me-2" type="checkbox" checked={isSelected} readOnly />
                    <label className="form-check-label small fw-bolder text-truncate text-dark">
                      {amenity.replaceAll('_', ' ')}
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-5">
        <label className="form-label small fw-bold text-uppercase text-muted d-block mb-3" style={{ letterSpacing: '1px' }}>Property Image</label>
        
        <div className="d-flex flex-column flex-md-row gap-4 align-items-start">
          <div className="flex-grow-1 w-100">
            <div className="border rounded-3 p-4 bg-light text-center border-dashed position-relative" style={{ borderStyle: 'dashed' }}>
              <i className="bi bi-cloud-arrow-up fs-1 text-muted mb-2"></i>
              <div className="fw-semibold">Click to upload image</div>
              <div className="text-muted small mb-3">JPG, PNG, WEBP (Max 5MB)</div>
              
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleImageChange}
                disabled={uploadingImage}
                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
              />
              
              {uploadingImage && <div className="mt-2 text-primary-custom small fw-bold"><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</div>}
              {uploadError && <div className="mt-2 text-danger small fw-bold"><i className="bi bi-exclamation-triangle me-1"></i>{uploadError}</div>}
            </div>
          </div>
          
          <div className="rounded-3 overflow-hidden bg-light border d-flex align-items-center justify-content-center" style={{ width: '100%', maxWidth: '300px', height: '180px', flexShrink: 0 }}>
            {form.imageUrl ? (
              <img 
                src={form.imageUrl} 
                alt="Hotel Preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' }}
              />
            ) : (
              <div className="text-muted small"><i className="bi bi-image fs-1 d-block mb-2 text-center"></i> Image Preview</div>
            )}
          </div>
        </div>
      </div>

      <hr className="my-4" />
      
      <div className="d-flex justify-content-end">
        <button className="btn-primary-custom px-5 py-3 text-uppercase fw-bold" disabled={saving || uploadingImage} type="submit" style={{ letterSpacing: '1px' }}>
          {saving ? (
            <><span className="spinner-border spinner-border-sm me-2"></span> Saving Property...</>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}

export default HotelForm;
