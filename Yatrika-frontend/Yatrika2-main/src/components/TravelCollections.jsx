import React, { useEffect, useState, useRef } from 'react';

const COLLECTIONS = [
  { title: 'Beach Escapes', sub: 'Sun, sand, and serenity', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { title: 'Luxury Villas', sub: 'Private and exclusive', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
  { title: 'Mountain Retreats', sub: 'Elevate your senses', img: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=800&q=80' },
  { title: 'Romantic Getaways', sub: 'Crafted for couples', img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80' },
  { title: 'Business Hotels', sub: 'Work in ultimate luxury', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  { title: 'Wellness Retreats', sub: 'Rejuvenate your soul', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' }
];

const TravelCollections = () => {
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
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="section-spacing bg-white">
            <div className="page-container">
                <div className="text-center mb-5">
                    <span className="text-uppercase fw-bold text-gold mb-2 d-block" style={{ letterSpacing: '2px', fontSize: '0.85rem' }}>Tailored Experiences</span>
                    <h2 className="display-5 fw-bold mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '-1px' }}>Travel Collections</h2>
                </div>

                <div className="row g-4 justify-content-center">
                    {COLLECTIONS.map((col, index) => (
                        <div key={index} className="col-12 col-md-6 col-lg-4">
                            <div 
                                className={`collection-card rounded-4 overflow-hidden position-relative ${isVisible ? 'fade-in-up' : ''}`}
                                style={{ height: '400px', cursor: 'pointer', animationDelay: `${0.1 * (index % 3)}s`, opacity: 0 }}
                            >
                                <img 
                                    src={col.img} 
                                    alt={col.title} 
                                    className="w-100 h-100 object-fit-cover col-img" 
                                    loading="lazy"
                                />
                                <div className="position-absolute top-0 start-0 w-100 h-100 overlay-dark"></div>
                                <div className="position-absolute top-50 start-50 translate-middle text-center text-white w-100 px-4 content-box">
                                    <h3 className="fw-bold display-6 mb-2">{col.title}</h3>
                                    <p className="fs-5 mb-0 opacity-90">{col.sub}</p>
                                    <div className="explore-btn mt-3 opacity-0">
                                        <span className="btn btn-outline-light rounded-pill px-4">Explore</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .collection-card .col-img {
                    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .collection-card:hover .col-img {
                    transform: scale(1.1);
                }
                .overlay-dark {
                    background: rgba(0,0,0,0.3);
                    transition: background 0.4s ease;
                }
                .collection-card:hover .overlay-dark {
                    background: rgba(0,0,0,0.5);
                }
                .content-box {
                    transition: transform 0.4s ease;
                }
                .collection-card:hover .content-box {
                    transform: translate(-50%, -60%);
                }
                .explore-btn {
                    transition: all 0.4s ease;
                    transform: translateY(20px);
                }
                .collection-card:hover .explore-btn {
                    opacity: 1 !important;
                    transform: translateY(0);
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default TravelCollections;
