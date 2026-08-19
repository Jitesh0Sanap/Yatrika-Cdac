import React from 'react'
import { useNavigate } from 'react-router-dom'

// TravelType values mirror backend enum TravelType: SOLO, COUPLE, FAMILY, BUSINESS
const types = [
  { key: 'SOLO', title: 'Solo', subtitle: 'Independent travel' },
  { key: 'COUPLE', title: 'Couple', subtitle: 'Romantic getaways' },
  { key: 'FAMILY', title: 'Family', subtitle: 'Family-friendly stays' },
  { key: 'BUSINESS', title: 'Business', subtitle: 'Work-friendly hotels' },
]

export default function TravelTypes(){
  const navigate = useNavigate()

  const handleClick = (t) => {
    // RecommendationController expects travelType as query param of type TravelType enum
    navigate(`/recommendations?travelType=${encodeURIComponent(t)}`)
  }

  return (
    <section className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="eyebrow">TRAVEL TYPE</p>
          <h2>Find stays for your trip</h2>
        </div>
      </div>

      <div className="row g-3">
        {types.map(t => (
          <div key={t.key} className="col-6 col-md-3">
            <div role="button" onClick={() => handleClick(t.key)} className="p-3 rounded-3 text-center h-100 shadow-sm" style={{cursor:'pointer'}}>
              <div className="fw-semibold">{t.title}</div>
              <div className="small text-muted">{t.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
