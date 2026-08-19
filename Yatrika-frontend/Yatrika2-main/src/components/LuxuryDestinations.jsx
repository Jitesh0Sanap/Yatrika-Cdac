import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const DESTINATIONS = [
  { name: 'Goa', count: 180, price: '$220', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Jaipur', count: 130, price: '$210', img: 'https://images.unsplash.com/photo-1605553075677-17eb481fb2e3?auto=format&fit=crop&w=600&q=80' },
  { name: 'Udaipur', count: 85, price: '$280', img: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80' },
  { name: 'Leh', count: 42, price: '$190', img: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Manali', count: 92, price: '$150', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80' },
  { name: 'Munnar', count: 88, price: '$130', img: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Kochi', count: 110, price: '$180', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80' },
  { name: 'Ooty', count: 75, price: '$140', img: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=600&q=80' },
  { name: 'Andaman', count: 45, price: '$350', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Shimla', count: 105, price: '$160', img: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=600&q=80' },
  { name: 'Varanasi', count: 150, price: '$120', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Agra', count: 95, price: '$140', img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80' },
  { name: 'Rishikesh', count: 80, price: '$110', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80' },
  { name: 'Darjeeling', count: 65, price: '$135', img: 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Coorg', count: 74, price: '$160', img: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Jodhpur', count: 82, price: '$190', img: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80' },
  { name: 'Jaisalmer', count: 55, price: '$220', img: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pondicherry', count: 90, price: '$150', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Gokarna', count: 40, price: '$110', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Srinagar', count: 70, price: '$210', img: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=600&q=80' }
];

const LuxuryDestinations = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.05 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const handleSearch = (city) => {
        navigate(`/hotels?city=${encodeURIComponent(city)}`);
    };

    return (
        <section ref={sectionRef} className="section-spacing bg-light">
            <div className="page-container">
                <div className="d-flex justify-content-between align-items-end mb-5">
                    <div>
                        <span className="text-uppercase fw-bold text-gold mb-2 d-block" style={{ letterSpacing: '2px', fontSize: '0.85rem' }}>Explore The World</span>
                        <h2 className="display-5 fw-bold mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '-1px' }}>Popular Destinations</h2>
                    </div>
                </div>

                <div className="row g-4">
                    {DESTINATIONS.map((dest, index) => (
                        <div key={index} className="col-12 col-sm-6 col-lg-3">
                            <div 
                                className={`destination-card rounded-4 overflow-hidden position-relative shadow-sm ${isVisible ? 'fade-in-up' : ''}`}
                                style={{ height: '320px', cursor: 'pointer', animationDelay: `${0.05 * (index % 4)}s`, opacity: 0 }}
                                onClick={() => handleSearch(dest.name)}
                            >
                                <img 
                                    src={dest.img} 
                                    alt={dest.name} 
                                    className="w-100 h-100 object-fit-cover dest-img" 
                                    loading="lazy"
                                />
                                <div className="position-absolute top-0 start-0 w-100 h-100 overlay-gradient"></div>
                                <div className="position-absolute bottom-0 start-0 w-100 p-4 text-white z-2">
                                    <h4 className="fw-bold mb-1 display-6" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>{dest.name}</h4>
                                    <div className="d-flex justify-content-between align-items-center opacity-90">
                                        <span className="small fw-semibold"><i className="bi bi-building me-1"></i> {dest.count} Hotels</span>
                                        <span className="small fw-bold">From {dest.price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .destination-card .dest-img {
                    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .destination-card:hover .dest-img {
                    transform: scale(1.08);
                }
                .overlay-gradient {
                    background: linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%);
                    transition: background 0.3s ease;
                }
                .destination-card:hover .overlay-gradient {
                    background: linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.9) 100%);
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default LuxuryDestinations;
