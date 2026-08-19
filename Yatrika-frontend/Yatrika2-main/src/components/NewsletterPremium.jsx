import React, { useEffect, useState, useRef } from 'react';

const NewsletterPremium = () => {
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

    const imgUrl = 'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=1920&q=80';

    return (
        <section 
            ref={sectionRef} 
            className="position-relative d-flex align-items-center justify-content-center"
            style={{
                backgroundImage: `url('${imgUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                minHeight: '500px',
                padding: '100px 0'
            }}
        >
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(rgba(10,20,25,0.7), rgba(10,20,25,0.8))' }}></div>
            
            <div className={`page-container position-relative z-2 text-center text-white ${isVisible ? 'fade-in-up' : ''}`} style={{ opacity: 0, maxWidth: '800px' }}>
                <i className="bi bi-envelope-paper fs-1 text-gold mb-3"></i>
                <h2 className="display-4 fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-1px' }}>Join The Inner Circle</h2>
                <p className="fs-5 mb-5 opacity-90" style={{ fontWeight: 300, lineHeight: 1.6 }}>
                    Subscribe to receive exclusive access to secret sales, travel inspiration, and curated luxury experiences delivered directly to your inbox.
                </p>
                
                <form className="d-flex flex-column flex-md-row gap-3 justify-content-center mx-auto" style={{ maxWidth: '600px' }}>
                    <div className="input-group input-group-lg bg-transparent border-bottom" style={{ borderColor: 'rgba(255,255,255,0.4) !important', flexGrow: 1 }}>
                        <span className="input-group-text bg-transparent border-0 text-white px-0"><i className="bi bi-envelope"></i></span>
                        <input 
                            type="email" 
                            className="form-control bg-transparent border-0 text-white shadow-none placeholder-white" 
                            placeholder="Your email address" 
                            required 
                            style={{ fontSize: '1.1rem' }}
                        />
                    </div>
                    <button type="button" className="btn px-5 rounded-pill fw-bold text-dark mt-3 mt-md-0 btn-gold-solid hover-lift">
                        Subscribe
                    </button>
                </form>
                <p className="small mt-4 opacity-50">By subscribing, you agree to our Terms & Privacy Policy.</p>
            </div>

            <style>{`
                .placeholder-white::placeholder {
                    color: rgba(255,255,255,0.6);
                }
                .input-group:focus-within {
                    border-color: var(--gold) !important;
                }
                .btn-gold-solid {
                    background-color: var(--gold);
                    transition: all 0.3s ease;
                }
                .btn-gold-solid:hover {
                    background-color: #f2ce55;
                    box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3);
                }
                .hover-lift:hover {
                    transform: translateY(-3px);
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default NewsletterPremium;
