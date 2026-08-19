import React from 'react'
import { Link } from 'react-router-dom'

function PopularCategories({ onSelectCategory }){
  const cats = [
    {name:'Luxury', icon:'bi-bank', subtitle:'Premium stays', image:'https://images.unsplash.com/photo-1501117716987-c8e62b62a50b?auto=format&fit=crop&w=900&q=80'},
    {name:'Business', icon:'bi-briefcase', subtitle:'Work-ready hotels', image:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'},
    {name:'Family', icon:'bi-people-fill', subtitle:'Perfect for vacations', image:'https://images.unsplash.com/photo-1505691723518-36d6b4b7ca6a?auto=format&fit=crop&w=900&q=80'},
    {name:'Resort', icon:'bi-sun', subtitle:'Relax & unwind', image:'https://images.unsplash.com/photo-1501117716987-c8e62b62a50b?auto=format&fit=crop&w=900&q=80'},
    {name:'Budget', icon:'bi-wallet2', subtitle:'Affordable comfort', image:'https://images.unsplash.com/photo-1505691723518-36d6b4b7ca6a?auto=format&fit=crop&w=900&q=80'}
  ]
  return (
    <section className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="eyebrow">CATEGORIES</p>
          <h2>Popular categories</h2>
        </div>
      </div>
      <div className="row g-3">
        {cats.map((c,idx)=> (
          <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-2">
            <div role="button" onClick={() => onSelectCategory ? onSelectCategory(c.name) : null} className="cat-card p-0 rounded-3 text-center h-100 shadow-sm overflow-hidden" style={{cursor: onSelectCategory ? 'pointer' : 'default'}}>
              <div style={{height:120, backgroundImage:`url(${c.image})`, backgroundSize:'cover', backgroundPosition:'center'}} />
              <div className="p-3">
                <i className={`bi ${c.icon} fs-3 text-success mb-1`}/>
                <div className="fw-semibold">{c.name}</div>
                <div className="small text-muted">{c.subtitle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PopularCategories
