import React, { useState } from 'react';

function SearchCard({ onSearch, amenityOptions = [] }) {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const toggleAmenity = (a) => {
    setSelectedAmenities(curr => curr.includes(a) ? curr.filter(x => x !== a) : [...curr, a]);
  };

  const submit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch({ city: destination, checkIn, checkOut, guests, amenities: selectedAmenities });
  };

  return (
    <div className="container position-relative z-index-10 search-card-container fade-in-up" style={{ marginTop: '-80px', animationDelay: '0.7s' }}>
      <form 
        id="search" 
        className="p-4 p-md-5 mx-auto search-card-glass" 
        onSubmit={submit} 
        style={{ 
          maxWidth: '1100px', 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          borderRadius: '32px', 
          boxShadow: '0 24px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255, 255, 255, 1)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease'
        }}
      >
        <div className="row g-4 align-items-center">
          <div className="col-12 col-md-4 border-end-md" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '1.5px' }}>Where to?</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 ps-0 pe-2">
                <i className="bi bi-geo-alt fs-5" style={{ color: 'var(--primary-color)' }}></i>
              </span>
              <input 
                className="form-control border-0 fw-bold shadow-none bg-transparent ps-0" 
                style={{ fontSize: '1.15rem' }}
                placeholder="City, region, or specific hotel..." 
                value={destination} 
                onChange={(e)=>setDestination(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="col-6 col-md-2 border-end-md" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '1.5px' }}>Check-in</label>
            <input 
              type="date" 
              className="form-control border-0 shadow-none fw-semibold text-dark bg-transparent px-0" 
              style={{ fontSize: '1.05rem', cursor: 'pointer' }}
              value={checkIn} 
              onChange={(e)=>setCheckIn(e.target.value)} 
            />
          </div>
          
          <div className="col-6 col-md-2 border-end-md" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '1.5px' }}>Check-out</label>
            <input 
              type="date" 
              className="form-control border-0 shadow-none fw-semibold text-dark bg-transparent px-0" 
              style={{ fontSize: '1.05rem', cursor: 'pointer' }}
              value={checkOut} 
              onChange={(e)=>setCheckOut(e.target.value)} 
            />
          </div>
          
          <div className="col-6 col-md-2">
            <label className="form-label fw-bold text-uppercase text-muted" style={{ fontSize: '0.75rem', letterSpacing: '1.5px' }}>Guests</label>
            <select 
              className="form-select border-0 shadow-none fw-semibold text-dark bg-transparent px-0" 
              style={{ fontSize: '1.05rem', cursor: 'pointer' }}
              value={guests} 
              onChange={(e)=>setGuests(Number(e.target.value))}
            >
              <option value={1}>1 Guest</option>
              <option value={2}>2 Guests</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests</option>
              <option value={5}>5+ Guests</option>
            </select>
          </div>
          
          <div className="col-6 col-md-2 d-flex align-items-end h-100">
            <button 
              className="btn w-100 py-3 mt-4 mt-md-0 rounded-pill text-white fw-bold shadow-sm" 
              style={{ 
                backgroundColor: 'var(--primary-color)', 
                fontSize: '1.05rem', 
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                backgroundImage: 'linear-gradient(135deg, var(--primary-color) 0%, #094735 100%)'
              }}
            >
              <i className="bi bi-search me-2"></i> SEARCH
            </button>
          </div>
        </div>
        
        {amenityOptions && amenityOptions.length > 0 && (
          <div className="mt-4 pt-4 border-top" style={{ borderColor: 'rgba(0,0,0,0.06) !important' }}>
            <span className="text-muted small fw-bold text-uppercase me-4 d-block d-md-inline mb-3 mb-md-0" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>Refine by:</span>
            <div className="d-flex flex-wrap gap-2 d-inline-flex">
              {amenityOptions.map(opt => (
                <button 
                  type="button" 
                  key={opt} 
                  className={`btn btn-sm rounded-pill transition-all ${selectedAmenities.includes(opt) ? 'bg-primary bg-opacity-10 text-primary-custom fw-bold' : 'bg-transparent text-muted hover-bg-light fw-semibold'}`} 
                  onClick={() => toggleAmenity(opt)}
                  style={{ 
                    padding: '6px 18px', 
                    fontSize: '0.8rem', 
                    border: selectedAmenities.includes(opt) ? '1px solid var(--primary-color)' : '1px solid rgba(0,0,0,0.1)' 
                  }}
                >
                  {selectedAmenities.includes(opt) && <i className="bi bi-check2 me-1"></i>}
                  {opt.replaceAll('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
      
      <style>{`
        .search-card-glass:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06) !important;
        }
        .form-control:focus, .form-select:focus {
          box-shadow: none !important;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.6;
          transition: 0.2s;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        .border-end-md {
          border-right: 1px solid rgba(0,0,0,0.08);
        }
        @media (max-width: 768px) {
          .border-end-md {
            border-right: none;
            border-bottom: 1px solid rgba(0,0,0,0.08);
            padding-bottom: 1rem;
            margin-bottom: 0.5rem;
          }
        }
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .z-index-10 {
          z-index: 10;
        }
      `}</style>
    </div>
  );
}

export default SearchCard;
