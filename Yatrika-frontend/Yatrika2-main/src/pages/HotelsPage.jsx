import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../services/api'
import HotelCard from '../components/HotelCard'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function HotelsPage(){
  const q = useQuery()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(()=>{
    const city = q.get('city')
    const category = q.get('category')
    const params = {}
    if (city) params.city = city
    if (category) params.category = category

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const resp = Object.keys(params).length ? await api.get('/hotels/search', { params }) : await api.get('/hotels')
        setHotels(resp.data || [])
      } catch (e) {
        setHotels([])
        setError('Could not load hotels. Please try again later.');
      } finally { setLoading(false) }
    }
    load()
  }, [useLocation().search])

  const hotelsImage = "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1920&q=80";

  return (
    <main style={{ backgroundColor: 'var(--secondary-color)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Hotels Header */}
      <section 
        className="position-relative d-flex align-items-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(13,92,70,0.7) 0%, rgba(13,92,70,0.9) 100%), url('${hotelsImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '350px',
          paddingTop: '60px'
        }}
      >
        <div className="page-container w-100 text-center text-white" style={{ position: 'relative', zIndex: 2 }}>
          <p className="text-uppercase fw-bold mb-2" style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.9rem' }}>EXPLORE</p>
          <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1px' }}>Find your perfect stay</h1>
          <p className="lead opacity-75 mx-auto" style={{ maxWidth: '600px', fontSize: '1.2rem' }}>
            {q.get('city') ? `Showing luxury options in ${q.get('city')}` : 'Discover the most exquisite hotels and resorts around the world.'}
          </p>
        </div>
      </section>

      <div className="page-container pt-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom">
          <div>
            <h3 className="fw-bold mb-1">Search Results</h3>
            <p className="text-muted small mb-0">{loading ? 'Loading...' : `${hotels.length} properties found`}</p>
          </div>
          
          <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
            <span className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '1px' }}>Sort by:</span>
            <select className="form-select border-0 bg-white shadow-sm" style={{ width: 'auto', minWidth: '150px' }}>
              <option>Recommended</option>
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

        {!loading && !error && hotels.length === 0 && (
          <div className="text-center py-5 my-5">
            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm" style={{ width: '100px', height: '100px', color: 'var(--text-muted)' }}>
              <i className="bi bi-search fs-1"></i>
            </div>
            <h3 className="fw-bold mb-2">No properties found</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>We couldn't find any hotels matching your current search criteria. Try adjusting your filters or destination.</p>
            <a href="/hotels" className="btn-primary-custom">Clear Search</a>
          </div>
        )}

        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3 d-none d-lg-block">
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
              <h5 className="fw-bold mb-4">Filter by</h5>
              
              <div className="mb-4">
                <h6 className="fw-bold mb-3 small text-uppercase text-muted">Price Range</h6>
                <input type="range" className="form-range" min="0" max="50000" id="priceRange" />
                <div className="d-flex justify-content-between text-muted small mt-2">
                  <span>₹0</span>
                  <span>₹50,000+</span>
                </div>
              </div>

              <div className="mb-4 border-top pt-4">
                <h6 className="fw-bold mb-3 small text-uppercase text-muted">Property Type</h6>
                {['Luxury', 'Resort', 'Business', 'Heritage'].map(type => (
                  <div className="form-check mb-2" key={type}>
                    <input className="form-check-input" type="checkbox" id={`type-${type}`} />
                    <label className="form-check-label text-muted" htmlFor={`type-${type}`}>
                      {type}
                    </label>
                  </div>
                ))}
              </div>

              <div className="mb-4 border-top pt-4">
                <h6 className="fw-bold mb-3 small text-uppercase text-muted">Popular Amenities</h6>
                {['Swimming Pool', 'Spa', 'Free Breakfast', 'Pet Friendly', 'Gym'].map(amenity => (
                  <div className="form-check mb-2" key={amenity}>
                    <input className="form-check-input" type="checkbox" id={`amenity-${amenity}`} />
                    <label className="form-check-label text-muted" htmlFor={`amenity-${amenity}`}>
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Hotel Grid */}
          <div className="col-lg-9">
            <div className="row g-4">
              {hotels.map(h => (
                <div key={h.hotelId} className="col-12 col-md-6">
                  <HotelCard hotel={h} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
