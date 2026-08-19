import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TRENDING = [
  { name: 'Shimla', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80', tag: 'Hill Station' },
  { name: 'Rishikesh', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', tag: 'Spiritual Retreat' },
  { name: 'Gokarna', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80', tag: 'Coastal Charm' },
  { name: 'Gulmarg', img: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=800&q=80', tag: 'Winter Wonderland' },
  { name: 'Munnar', img: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80', tag: 'Tea Gardens' },
  { name: 'Hampi', img: 'https://images.unsplash.com/photo-1605553075677-17eb481fb2e3?auto=format&fit=crop&w=800&q=80', tag: 'Heritage Ruins' }
];

const TrendingDestinations = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section ref={sectionRef} className="section-spacing bg-light overflow-hidden">
            <div className="page-container position-relative">
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <span className="text-uppercase fw-bold text-gold mb-2 d-block" style={{ letterSpacing: '2px', fontSize: '0.85rem' }}>Now Trending</span>
                        <h2 className="display-5 fw-bold mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '-1px' }}>Global Hotspots</h2>
                    </div>
                    <div className="d-flex gap-2 d-none d-md-flex">
                        <button className="btn btn-outline-custom rounded-circle" style={{ width: '45px', height: '45px' }} onClick={() => scroll('left')}>
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <button className="btn btn-outline-custom rounded-circle" style={{ width: '45px', height: '45px' }} onClick={() => scroll('right')}>
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className={`d-flex gap-4 overflow-x-auto pb-4 hide-scrollbar ${isVisible ? 'fade-in-up' : ''}`}
                    style={{ scrollSnapType: 'x mandatory', opacity: 0 }}
                >
                    {TRENDING.map((item, index) => (
                        <div 
                            key={index} 
                            className="trending-card position-relative rounded-4 overflow-hidden flex-shrink-0"
                            style={{ width: '350px', height: '450px', scrollSnapAlign: 'start', cursor: 'pointer' }}
                            onClick={() => navigate(`/hotels?city=${encodeURIComponent(item.name)}`)}
                        >
                            <img 
                                src={item.img} 
                                alt={item.name} 
                                className="w-100 h-100 object-fit-cover trending-img"
                                loading="lazy"
                            />
                            <div className="position-absolute top-0 start-0 w-100 h-100 overlay-dark"></div>
                            <div className="position-absolute bottom-0 start-0 w-100 p-4 text-white">
                                <span className="badge bg-gold text-dark mb-2 rounded-pill px-3 py-2 fw-bold">{item.tag}</span>
                                <h3 className="display-6 fw-bold mb-0">{item.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .trending-card .trending-img {
                    transition: transform 0.8s ease;
                }
                .trending-card:hover .trending-img {
                    transform: scale(1.1);
                }
                .overlay-dark {
                    background: linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%);
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .bg-gold {
                    background-color: var(--gold) !important;
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default TrendingDestinations;
