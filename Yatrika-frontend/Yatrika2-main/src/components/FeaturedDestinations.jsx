import React from 'react'
import { Link } from 'react-router-dom'

function FeaturedDestinations({ cities = [] }) {
  const imageMap = {
    Goa: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    Jaipur: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
    Pune: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    Udaipur: 'https://images.unsplash.com/photo-1533587851505-755f0c0e0c97?auto=format&fit=crop&w=900&q=80',
  }

  const taglineMap = {
    Goa: 'Beach escapes',
    Jaipur: 'Royal heritage',
    Pune: 'City retreats',
    Udaipur: 'Lakefront stays'
  }

  const fallbackImages = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1519821172141-b5d8a0f1ccf4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  ]

  const items = cities.length ? cities.map((it, idx) => ({
    ...it,
    imageUrl: imageMap[it.city] || fallbackImages[idx % fallbackImages.length],
    tagline: taglineMap[it.city] || 'Explore nearby stays'
  })) : [
    { city: 'Goa', count: 124, imageUrl: imageMap.Goa, tagline: 'Beach escapes' },
    { city: 'Jaipur', count: 58, imageUrl: imageMap.Jaipur, tagline: 'Royal heritage' },
    { city: 'Pune', count: 92, imageUrl: imageMap.Pune, tagline: 'City retreats' },
    { city: 'Udaipur', count: 34, imageUrl: imageMap.Udaipur, tagline: 'Lakefront stays' }
  ]

  return (
    <section id="featured" className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="eyebrow">POPULAR</p>
          <h2>Featured destinations</h2>
        </div>
        <Link to="/" className="text-decoration-none">See all</Link>
      </div>

      <div className="row g-3">
        {items.map((it, idx) => (
          <div key={idx} className="col-12 col-md-6 col-xl-3">
            <div className="dest-card text-decoration-none d-block rounded-3 overflow-hidden shadow-sm">
              <div className="dest-image" style={{ backgroundImage: `url(${it.imageUrl})`, height: 180 }} />
              <div className="p-3 bg-white d-flex flex-column">
                <div>
                  <h5 className="mb-1">{it.city}</h5>
                  <div className="text-muted small">{it.count} hotels • {it.tagline}</div>
                </div>
                <div className="mt-3 d-flex justify-content-end">
                  <Link to={`/hotels?city=${encodeURIComponent(it.city)}`} className="btn btn-sm btn-outline-primary">Explore</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturedDestinations
