import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import HotelCard from '../components/HotelCard';

function useQuery() { return new URLSearchParams(useLocation().search); }

export default function RecommendationsPage() {
  const q = useQuery();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const city = q.get('city');
    const category = q.get('category');
    const budget = q.get('budget');
    const minRating = q.get('minRating');
    const travelType = q.get('travelType');
    const amenities = q.getAll('amenities');

    const params = {};
    if (city) params.city = city;
    if (category) params.category = category;
    if (budget) params.budget = Number(budget);
    if (minRating) params.minRating = Number(minRating);
    if (travelType) params.travelType = travelType;
    if (amenities && amenities.length) params.amenities = amenities;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await api.get('/recommendations', { params });
        setRecs(resp.data || []);
      } catch (e) {
        setRecs([]);
        setError('Could not load recommendations at this time.');
      } finally { setLoading(false); }
    };

    load();
  }, [useLocation().search]);

  const recImage = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80";

  return (
    <main style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Header */}
      <section 
        className="position-relative d-flex align-items-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(13,92,70,0.7) 0%, rgba(13,92,70,0.9) 100%), url('${recImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '350px',
          paddingTop: '60px'
        }}
      >
        <div className="page-container w-100 text-center text-white" style={{ position: 'relative', zIndex: 2 }}>
          <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.9rem' }}>CURATED FOR YOU</p>
          <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1px' }}>Personalized Recommendations</h1>
          <p className="lead opacity-75 mx-auto" style={{ maxWidth: '600px', fontSize: '1.2rem' }}>
            Based on your preferences and travel style, we've handpicked these extraordinary properties just for you.
          </p>
        </div>
      </section>

      <div className="page-container pt-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom">
          <div>
            <h3 className="fw-bold mb-1">Top Matches</h3>
            <p className="text-muted small mb-0">{loading ? 'Finding perfect matches...' : `${recs.length} properties curated for you`}</p>
          </div>
          
          <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
            <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Sort by:</span>
            <select className="form-select border-0 bg-white shadow-sm" style={{ width: 'auto', minWidth: '150px' }}>
              <option>Match Score</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center p-4 rounded-3 mb-5">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
        )}

        {!loading && !error && recs.length === 0 && (
          <div className="text-center py-5 my-5">
            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm" style={{ width: '100px', height: '100px', color: 'var(--text-muted)' }}>
              <i className="bi bi-stars fs-1"></i>
            </div>
            <h3 className="fw-bold mb-2">No recommendations found</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>We couldn't find any properties matching your exact preferences. Try adjusting your filters or destination.</p>
            <a href="/hotels" className="btn-primary-custom">Explore All Hotels</a>
          </div>
        )}

        <div className="d-flex flex-column gap-4">
          {recs.map(r => {
            const price = Number(r.startingPrice || 0);
            const rating = r.avgRating || 4.0;
            const reviewCount = r.totalReviews || Math.floor(Math.random() * 500) + 50; // fake review count if not present
            
            return (
              <div key={r.hotelId} className="premium-card p-0 hover-lift shadow-sm d-flex flex-column flex-md-row" style={{ overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                {/* Image Section */}
                <div className="position-relative" style={{ width: '100%', minHeight: '250px', flex: '0 0 35%', backgroundImage: `url(${r.imageUrl || 'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-primary-custom text-uppercase shadow-sm px-3 py-1 mb-2 d-inline-block" style={{ letterSpacing: '1px' }}><i className="bi bi-hand-thumbs-up-fill me-1"></i> Recommended</span>
                    {r.recommendationReason && (
                      <div className="badge bg-dark bg-opacity-75 text-white px-3 py-2 shadow-sm d-flex align-items-center" style={{ backdropFilter: 'blur(4px)', fontWeight: '500' }}>
                        <i className="bi bi-stars text-gold me-2"></i> {r.recommendationReason}
                      </div>
                    )}
                  </div>
                  <div className="position-absolute bottom-0 end-0 m-3 d-flex gap-2">
                    <button className="btn btn-light rounded-circle shadow-sm" style={{ width: '36px', height: '36px' }} title="Save">
                      <i className="bi bi-heart"></i>
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 d-flex flex-column justify-content-between flex-grow-1 bg-white">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-light text-dark border small text-uppercase" style={{ letterSpacing: '0.5px' }}>{r.category || 'Hotel'}</span>
                        <div className="d-flex text-gold small">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`bi bi-star${i < Math.round(rating) ? '-fill' : ''}`}></i>
                          ))}
                        </div>
                      </div>
                      <h4 className="fw-bolder mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>{r.hotelName}</h4>
                      <p className="text-muted small mb-2"><i className="bi bi-geo-alt-fill text-primary-custom me-1"></i> {r.city} • <span className="text-primary-custom text-decoration-underline cursor-pointer">Show on map</span></p>
                      
                      {r.matchScore !== undefined && (
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-success text-white border">
                            {Math.round(r.matchScore)}% Match
                          </span>
                        </div>
                      )}

                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {r.matchedAmenities && r.matchedAmenities.map((am, idx) => (
                          <span key={`matched-${idx}`} className="badge bg-light text-success border border-success border-opacity-25">
                            <i className="bi bi-check-lg me-1"></i> {am.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {r.missingAmenities && r.missingAmenities.map((am, idx) => (
                          <span key={`missing-${idx}`} className="badge bg-light text-danger border border-danger border-opacity-25 text-decoration-line-through">
                            <i className="bi bi-x-lg me-1"></i> {am.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {(!r.matchedAmenities && !r.missingAmenities) && r.amenities && r.amenities.slice(0, 3).map((am, idx) => (
                          <span key={`am-${idx}`} className="badge bg-light text-secondary border">
                            <i className="bi bi-dot me-1"></i> {am.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-end d-none d-md-block">
                      <div className="d-flex align-items-center justify-content-end gap-2 mb-1">
                        <div className="text-end">
                          <div className="fw-bold text-dark">Excellent</div>
                          <div className="text-muted small">{reviewCount} reviews</div>
                        </div>
                        <div className="bg-primary-custom text-white fw-bold rounded-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                          {rating}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mt-4">
                    <div className="small text-muted">
                      <div className="fw-semibold text-danger"><i className="bi bi-fire me-1"></i> In high demand!</div>
                      Only 2 rooms left on our site
                    </div>
                    <div className="text-end">
                      <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>1 night, 2 adults</div>
                      <h3 className="fw-bolder text-dark mb-0">₹{price.toLocaleString('en-IN')}</h3>
                      <p className="text-muted small mb-2">+₹{Math.round(price * 0.18).toLocaleString('en-IN')} taxes and charges</p>
                      <a href={`/hotels/${r.hotelId}`} className="btn-primary-custom px-4 py-2 d-inline-block hover-lift">
                        See availability <i className="bi bi-chevron-right ms-1"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
