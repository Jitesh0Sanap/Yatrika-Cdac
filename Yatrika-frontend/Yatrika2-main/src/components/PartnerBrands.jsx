import React, { useEffect, useState, useRef } from 'react';

const PARTNERS = [
  'Marriott', 'Hilton', 'Hyatt', 'IHG', 'Accor', 'Taj', 'Aman', 'Four Seasons', 'Radisson', 'ITC'
];

const PartnerBrands = () => {
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
            { threshold: 0.2 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="py-5 bg-white border-top border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <div className="page-container text-center">
                <span className="text-uppercase fw-bold text-muted mb-4 d-block" style={{ letterSpacing: '2px', fontSize: '0.75rem' }}>Our Premium Partners</span>
                
                <div className={`d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 ${isVisible ? 'fade-in-up' : ''}`} style={{ opacity: 0, animationDelay: '0.1s' }}>
                    {PARTNERS.map((partner, index) => (
                        <div key={index} className="partner-logo">
                            <h4 className="fw-bold m-0" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '1px' }}>{partner}</h4>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .partner-logo {
                    color: #adb5bd;
                    filter: grayscale(100%);
                    transition: all 0.4s ease;
                    cursor: pointer;
                    opacity: 0.7;
                }
                .partner-logo:hover {
                    color: var(--primary-color);
                    filter: grayscale(0%);
                    transform: scale(1.1);
                    opacity: 1;
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default PartnerBrands;
