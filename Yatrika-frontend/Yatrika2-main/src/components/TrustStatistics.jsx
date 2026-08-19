import React, { useEffect, useState, useRef } from 'react';

const TrustStatistics = () => {
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
        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const Counter = ({ end, duration, suffix = '', isVisible }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            if (!isVisible) return;
            let start = 0;
            const increment = end / (duration / 16);
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.ceil(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }, [end, duration, isVisible]);

        return <span>{count.toLocaleString()}{suffix}</span>;
    };

    return (
        <section ref={sectionRef} className="py-5" style={{ backgroundColor: 'var(--secondary-color)' }}>
            <div className="page-container">
                <div className="row g-4 justify-content-center">
                    
                    <div className="col-6 col-md-3">
                        <div className={`text-center trust-card ${isVisible ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                            <div className="mb-3 text-gold fs-3">
                                <i className="bi bi-star-fill me-1"></i>
                                <i className="bi bi-star-fill me-1"></i>
                                <i className="bi bi-star-fill me-1"></i>
                                <i className="bi bi-star-fill me-1"></i>
                                <i className="bi bi-star-half"></i>
                            </div>
                            <h3 className="display-6 fw-bold mb-1" style={{ color: 'var(--primary-color)' }}>
                                <Counter end={4.9} duration={1500} isVisible={isVisible} />
                            </h3>
                            <p className="text-muted text-uppercase fw-semibold mb-0" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>Guest Rating</p>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className={`text-center trust-card ${isVisible ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                            <div className="mb-3" style={{ color: 'var(--gold)', fontSize: '2rem' }}>
                                <i className="bi bi-people-fill"></i>
                            </div>
                            <h3 className="display-6 fw-bold mb-1" style={{ color: 'var(--primary-color)' }}>
                                <Counter end={50000} duration={2000} suffix="+" isVisible={isVisible} />
                            </h3>
                            <p className="text-muted text-uppercase fw-semibold mb-0" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>Happy Travelers</p>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className={`text-center trust-card ${isVisible ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.3s' }}>
                            <div className="mb-3" style={{ color: 'var(--gold)', fontSize: '2rem' }}>
                                <i className="bi bi-building"></i>
                            </div>
                            <h3 className="display-6 fw-bold mb-1" style={{ color: 'var(--primary-color)' }}>
                                <Counter end={2500} duration={1800} suffix="+" isVisible={isVisible} />
                            </h3>
                            <p className="text-muted text-uppercase fw-semibold mb-0" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>Luxury Hotels</p>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className={`text-center trust-card ${isVisible ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.4s' }}>
                            <div className="mb-3" style={{ color: 'var(--gold)', fontSize: '2rem' }}>
                                <i className="bi bi-globe-americas"></i>
                            </div>
                            <h3 className="display-6 fw-bold mb-1" style={{ color: 'var(--primary-color)' }}>
                                <Counter end={150} duration={1500} suffix="+" isVisible={isVisible} />
                            </h3>
                            <p className="text-muted text-uppercase fw-semibold mb-0" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>Destinations</p>
                        </div>
                    </div>

                </div>
            </div>
            <style>{`
                .trust-card {
                    padding: 2rem 1rem;
                    background: rgba(255,255,255,0.6);
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.8);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    opacity: 0;
                }
                .trust-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.06);
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeInUp {
                    to { opacity: 1; transform: translateY(0); }
                    from { opacity: 0; transform: translateY(30px); }
                }
            `}</style>
        </section>
    );
};

export default TrustStatistics;
