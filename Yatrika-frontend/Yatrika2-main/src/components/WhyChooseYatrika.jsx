import React, { useEffect, useState, useRef } from 'react';

const WhyChooseYatrika = () => {
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

    const features = [
        {
            icon: 'bi-gem',
            title: 'Verified Luxury Hotels',
            desc: 'Every property is handpicked and rigorously inspected to ensure it meets our world-class luxury standards.'
        },
        {
            icon: 'bi-headset',
            title: '24×7 Concierge',
            desc: 'Our dedicated travel experts are available around the clock to assist you with every detail of your journey.'
        },
        {
            icon: 'bi-shield-check',
            title: 'Secure Payments',
            desc: 'Experience complete peace of mind with our bank-grade encrypted payment gateway for all bookings.'
        },
        {
            icon: 'bi-award',
            title: 'Best Price Guarantee',
            desc: 'We guarantee the best rates for premium stays, ensuring exceptional value without compromising luxury.'
        }
    ];

    return (
        <section ref={sectionRef} className="section-spacing bg-white">
            <div className="page-container">
                <div className="text-center mb-5">
                    <span className="text-uppercase fw-bold text-gold mb-2 d-block" style={{ letterSpacing: '2px', fontSize: '0.85rem' }}>The Yatrika Difference</span>
                    <h2 className="display-5 fw-bold" style={{ color: 'var(--primary-color)', letterSpacing: '-1px' }}>Why Choose Us</h2>
                    <p className="text-muted mx-auto mt-3" style={{ maxWidth: '600px', fontSize: '1.1rem' }}>
                        We redefine luxury travel by offering an unparalleled booking experience crafted exclusively for the discerning traveler.
                    </p>
                </div>

                <div className="row g-4 justify-content-center">
                    {features.map((feat, index) => (
                        <div key={index} className="col-12 col-md-6 col-lg-3">
                            <div 
                                className={`feature-card text-center p-4 h-100 ${isVisible ? 'fade-in-up' : ''}`} 
                                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                            >
                                <div 
                                    className="icon-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                                    style={{ width: '80px', height: '80px', backgroundColor: 'rgba(13,92,70,0.05)', color: 'var(--primary-color)', transition: 'all 0.3s ease' }}
                                >
                                    <i className={`bi ${feat.icon} fs-2`}></i>
                                </div>
                                <h4 className="fw-bold mb-3" style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>{feat.title}</h4>
                                <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .feature-card {
                    background: #fff;
                    border-radius: 24px;
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    opacity: 0;
                }
                .feature-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                    border-color: rgba(0,0,0,0.08);
                }
                .feature-card:hover .icon-wrapper {
                    background-color: var(--primary-color) !important;
                    color: white !important;
                    transform: scale(1.1);
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default WhyChooseYatrika;
