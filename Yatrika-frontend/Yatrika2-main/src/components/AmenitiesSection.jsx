import React from 'react'

function AmenityChip({ amenity }) {
  const iconMap = {
    pool: 'bi-water',
    wifi: 'bi-wifi',
    gym: 'bi-heart-pulse',
    restaurant: 'bi-cup-hot',
    parking: 'bi-p-square',
    spa: 'bi-flower1',
    pet_friendly: 'bi-emoji-smile',
    ac: 'bi-snow'
  }
  const key = amenity?.toLowerCase().replace(/\s+/g,'_')
  const icon = iconMap[key] || 'bi-check2'
  return (
    <div className="amenity-chip d-flex align-items-center">
      <i className={`bi ${icon} me-2 text-success`} />
      <span className="text">{amenity.replaceAll('_',' ')}</span>
    </div>
  )
}

function AmenitiesSection({ amenities = [] }) {
  if (!amenities || amenities.length === 0) return null

  return (
    <section className="amenities-section mt-5">
      <h2>What this place offers</h2>
      <div className="amenities-grid mt-3">
        {amenities.map((a) => <AmenityChip amenity={a} key={a} />)}
      </div>
    </section>
  )
}

export default AmenitiesSection
