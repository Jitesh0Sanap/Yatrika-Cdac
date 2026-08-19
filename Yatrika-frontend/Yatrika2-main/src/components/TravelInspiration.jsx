import React from 'react'
import { Link } from 'react-router-dom'

function TravelInspiration(){
  const cards = [
    {title:'Weekend Getaways', subtitle:'Short escapes close to home', img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80'},
    {title:'Luxury Escapes', subtitle:'Treat yourself', img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80'},
    {title:'Beach Holidays', subtitle:'Sun, sand, and sea', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'}
  ]
  return (
    <section className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="eyebrow">INSPIRATION</p>
          <h2>Travel inspiration</h2>
        </div>
      </div>
      <div className="row g-3">
        {cards.map((c,idx) => (
          <div key={idx} className="col-12 col-md-4">
            <Link to="/" className="insp-card d-block rounded-3 overflow-hidden text-decoration-none">
              <div className="insp-img" style={{ backgroundImage: `url(${c.img})` }} />
              <div className="p-3 bg-white">
                <h5 className="mb-1">{c.title}</h5>
                <div className="text-muted small">{c.subtitle}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TravelInspiration
