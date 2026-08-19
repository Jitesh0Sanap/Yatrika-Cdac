import React, { useEffect, useState, useRef } from 'react';

const REVIEWS = [
  { name: 'James Wilson', type: 'Solo Traveller', country: 'UK', rating: 5, text: 'An absolutely flawless experience in Rajasthan from start to finish. The concierge anticipated every need before I even had to ask.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { name: 'Sarah & Mark', type: 'Couple', country: 'USA', rating: 5, text: 'We booked our anniversary trip through Yatrika. The beachfront villa in Goa was stunning, and the private dining experience was magical.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { name: 'David Chen', type: 'Business', country: 'Singapore', rating: 4.8, text: 'Perfect balance of luxury and efficiency in Mumbai. The executive lounge access and fast-track services made my business trip seamless.', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' },
  { name: 'The Patel Family', type: 'Family', country: 'Delhi', rating: 5, text: 'Traveling with three kids is usually stressful, but the resort in Coorg had exceptional family facilities and a world-class kids club.', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
  { name: 'Emma Thompson', type: 'Luxury Traveller', country: 'Australia', rating: 5, text: 'The attention to detail in the suite design and the personalized welcome amenities truly set a new standard for luxury hospitality in India.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { name: 'Robert Fox', type: 'Solo Traveller', country: 'Canada', rating: 4.9, text: 'From the helipad transfer to the Michelin-star dining, every moment was orchestrated perfectly. Highly recommend this Indian retreat.', img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80' },
  { name: 'Elena Rodriguez', type: 'Couple', country: 'Spain', rating: 5, text: 'Our honeymoon in Kerala was exactly as we dreamed. Waking up to the backwater view and having our private plunge pool was spectacular.', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
  { name: 'Michael Chang', type: 'Business', country: 'Taiwan', rating: 4.7, text: 'Excellent connectivity, a magnificent boardroom, and the most comfortable bed I have ever slept in during a work trip in Bangalore.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { name: 'The O\'Connor Family', type: 'Family', country: 'Ireland', rating: 4.9, text: 'The multi-bedroom villa in Udaipur gave us the space we needed, and the dedicated butler ensured we never had to worry about reservations.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
  { name: 'Sophie Laurent', type: 'Luxury Traveller', country: 'France', rating: 5, text: 'An exquisite wellness retreat in the Himalayas. The spa treatments were divine and the holistic approach to luxury is unmatched.', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80' },
  { name: 'Daniel Smith', type: 'Solo Traveller', country: 'USA', rating: 4.8, text: 'I travel extensively, and the level of personalized service here in Jaipur ranks among the absolute best in the world.', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
  { name: 'Nina & Tom', type: 'Couple', country: 'Germany', rating: 5, text: 'A truly memorable stay in Agra. The architecture, the bespoke excursions, and the warm Indian hospitality were beyond incredible.', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80' }
];

const Testimonials = () => {
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

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 !== 0;
        const stars = [];
        for(let i=0; i<fullStars; i++) stars.push(<i key={i} className="bi bi-star-fill me-1"></i>);
        if(hasHalf) stars.push(<i key="half" className="bi bi-star-half me-1"></i>);
        return stars;
    };

    return (
        <section ref={sectionRef} className="section-spacing bg-white overflow-hidden">
            <div className="page-container">
                <div className="text-center mb-5">
                    <span className="text-uppercase fw-bold text-gold mb-2 d-block" style={{ letterSpacing: '2px', fontSize: '0.85rem' }}>Guest Stories</span>
                    <h2 className="display-5 fw-bold mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '-1px' }}>Unforgettable Experiences</h2>
                </div>
            </div>

            <div className={`marquee-container ${isVisible ? 'fade-in-up' : ''}`} style={{ opacity: 0, animationDelay: '0.2s' }}>
                <div className="marquee-content gap-4 py-4 px-3">
                    {/* Double the array for infinite smooth scrolling */}
                    {[...REVIEWS, ...REVIEWS].map((rev, index) => (
                        <div key={index} className="testimonial-card flex-shrink-0 bg-light p-4 rounded-4" style={{ width: '400px' }}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="text-gold fs-5">
                                    {renderStars(rev.rating)}
                                </div>
                                <i className="bi bi-quote fs-2" style={{ color: 'rgba(13,92,70,0.1)' }}></i>
                            </div>
                            <p className="mb-4" style={{ fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic', minHeight: '100px' }}>
                                "{rev.text}"
                            </p>
                            <div className="d-flex align-items-center">
                                <img src={rev.img} alt={rev.name} className="rounded-circle object-fit-cover shadow-sm me-3" style={{ width: '50px', height: '50px' }} loading="lazy" />
                                <div>
                                    <h6 className="fw-bold mb-0">{rev.name}</h6>
                                    <span className="small text-muted">{rev.type} &bull; {rev.country}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .marquee-container {
                    width: 100vw;
                    overflow: hidden;
                    position: relative;
                }
                .marquee-content {
                    display: flex;
                    width: max-content;
                    animation: marquee 40s linear infinite;
                }
                .marquee-container:hover .marquee-content {
                    animation-play-state: paused;
                }
                .testimonial-card {
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .testimonial-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.05);
                    background-color: white !important;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default Testimonials;
