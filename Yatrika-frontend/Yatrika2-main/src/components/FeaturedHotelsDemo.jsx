import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateImageModel } from '../utils/imageUtils';

const DEMO_HOTELS = [
  { id: 101, name: 'The Oberoi Udaivilas', city: 'Udaipur', category: 'LUXURY', price: 950, rating: 4.9, reviews: 1240, img: 'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=600&q=80', desc: 'Experience the grandeur of Rajasthan with unparalleled views of Lake Pichola.' },
  { id: 102, name: 'Taj Lake Palace', city: 'Udaipur', category: 'LUXURY', price: 1500, rating: 5.0, reviews: 3420, img: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80', desc: 'A white marble palace floating in the middle of Lake Pichola.' },
  { id: 103, name: 'The Oberoi Amarvilas', city: 'Agra', category: 'LUXURY', price: 1200, rating: 4.9, reviews: 890, img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80', desc: 'Uninterrupted views of the iconic Taj Mahal from every room.' },
  { id: 104, name: 'ITC Grand Chola', city: 'Chennai', category: 'LUXURY', price: 850, rating: 4.8, reviews: 8500, img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80', desc: 'A palatial tribute to Southern India\'s greatest empires.' },
  { id: 105, name: 'The Leela Palace', city: 'Jaipur', category: 'RESORT', price: 780, rating: 4.7, reviews: 6200, img: 'https://images.unsplash.com/photo-1605553075677-17eb481fb2e3?auto=format&fit=crop&w=600&q=80', desc: 'Majestic architecture and modern luxury in the Pink City.' },
  { id: 106, name: 'JW Marriott', city: 'Goa', category: 'RESORT', price: 650, rating: 4.9, reviews: 1120, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', desc: 'Unwind at this beachfront luxury resort with world-class amenities.' },
  { id: 107, name: 'Taj Mahal Palace', city: 'Mumbai', category: 'LUXURY', price: 890, rating: 4.9, reviews: 2150, img: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=600&q=80', desc: 'Mumbai\'s most iconic hotel overlooking the Gateway of India.' },
  { id: 108, name: 'Evolve Back', city: 'Coorg', category: 'RESORT', price: 1150, rating: 4.9, reviews: 980, img: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80', desc: 'A serene plantation resort nestled amidst coffee estates.' },
  { id: 109, name: 'Rambagh Palace', city: 'Jaipur', category: 'LUXURY', price: 1400, rating: 4.8, reviews: 1560, img: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80', desc: 'Experience the regal lifestyle of the erstwhile Maharajas.' },
  { id: 110, name: 'W', city: 'Goa', category: 'RESORT', price: 350, rating: 4.6, reviews: 3400, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', desc: 'Vibrant luxury steps away from Vagator Beach.' },
  { id: 111, name: 'The Leela Palace', city: 'New Delhi', category: 'BUSINESS', price: 420, rating: 4.8, reviews: 2200, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', desc: 'Experience the regal lifestyle at this architectural masterpiece.' },
  { id: 112, name: 'Wildflower Hall', city: 'Shimla', category: 'LUXURY', price: 1800, rating: 4.9, reviews: 740, img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80', desc: 'A fairy-tale resort set amidst pine and cedar forests.' },
  { id: 113, name: 'Taj Falaknuma Palace', city: 'Hyderabad', category: 'RESORT', price: 1650, rating: 5.0, reviews: 420, img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80', desc: 'Relive the Nizam\'s era in this magnificent elevated palace.' },
  { id: 114, name: 'Kumarakom Lake Resort', city: 'Kerala', category: 'LUXURY', price: 980, rating: 4.7, reviews: 4500, img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80', desc: 'Backwater luxury with traditional Kerala heritage villas.' },
  { id: 115, name: 'The Khyber Himalayan Resort', city: 'Gulmarg', category: 'LUXURY', price: 890, rating: 4.8, reviews: 2750, img: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?auto=format&fit=crop&w=600&q=80', desc: 'Breathtaking views of the Affarwat Peaks in Kashmir.' },
  { id: 116, name: 'Barefoot at Havelock', city: 'Andaman', category: 'RESORT', price: 2100, rating: 4.9, reviews: 310, img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80', desc: 'Eco-friendly luxury amidst pristine white sand beaches.' },
  { id: 117, name: 'Ananda in the Himalayas', city: 'Rishikesh', category: 'LUXURY', price: 1100, rating: 4.8, reviews: 3900, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', desc: 'A destination spa offering holistic wellness and breathtaking views.' },
  { id: 118, name: 'The Oberoi Vanyavilas', city: 'Ranthambore', category: 'LUXURY', price: 920, rating: 4.9, reviews: 1850, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', desc: 'India\'s leading luxury jungle resort with tented accommodation.' },
  { id: 119, name: 'Taj Exotica', city: 'Andaman', category: 'RESORT', price: 1950, rating: 4.9, reviews: 620, img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80', desc: 'Unprecedented privacy on Radhanagar Beach.' },
  { id: 120, name: 'ITC Grand Bharat', city: 'Gurgaon', category: 'RESORT', price: 450, rating: 4.7, reviews: 1100, img: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=600&q=80', desc: 'India’s first all-suite luxury retreat with a classic 27-hole golf course.' },
  { id: 121, name: 'The Leela', city: 'Kovalam', category: 'LUXURY', price: 680, rating: 4.8, reviews: 2900, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80', desc: 'Cliff-top luxury overlooking the Arabian Sea.' },
  { id: 122, name: 'Evolve Back', city: 'Kabini', category: 'RESORT', price: 820, rating: 4.9, reviews: 840, img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80', desc: 'Wilderness retreat offering unforgettable safari experiences.' },
  { id: 123, name: 'Taj Madikeri Resort', city: 'Coorg', category: 'RESORT', price: 790, rating: 4.8, reviews: 920, img: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80', desc: 'Stunning rainforest retreat with panoramic hill views.' },
  { id: 124, name: 'Alila Fort Bishangarh', city: 'Jaipur', category: 'LUXURY', price: 1050, rating: 4.9, reviews: 1600, img: 'https://images.unsplash.com/photo-1605553075677-17eb481fb2e3?auto=format&fit=crop&w=600&q=80', desc: 'A majestic heritage fortress converted into a grand resort.' }
];

const HotelImage = ({ hotel }) => {
  const images = generateImageModel(hotel);
  const [imgSrc, setImgSrc] = useState(hotel.img || images.heroImage);
  return (
    <img 
      src={imgSrc} 
      alt={hotel.name}
      className="w-100 h-100 object-fit-cover hotel-img"
      onError={() => setImgSrc(images.fallbackImage)}
      loading="lazy"
    />
  );
};

const FeaturedHotelsDemo = ({ existingHotels = [], title = "Featured Properties", subtitle = "Curated Collection" }) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    
    const hotelsToDisplay = existingHotels.length > 0 ? existingHotels : DEMO_HOTELS;

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

    const renderStars = (rating) => {
        return (
            <div className="d-flex align-items-center text-gold" style={{ fontSize: '0.9rem' }}>
                <i className="bi bi-star-fill me-1"></i>
                <span className="fw-bold text-dark ms-1">{rating.toFixed(1)}</span>
            </div>
        );
    };

    return (
        <section ref={sectionRef} className="section-spacing bg-white">
            <div className="page-container">
                <div className="d-flex justify-content-between align-items-end mb-5">
                    <div>
                        <span className="text-uppercase fw-bold text-gold mb-2 d-block" style={{ letterSpacing: '2px', fontSize: '0.85rem' }}>{subtitle}</span>
                        <h2 className="display-5 fw-bold mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '-1px' }}>{title}</h2>
                    </div>
                    <button className="btn btn-outline-custom rounded-pill px-4 d-none d-md-block" onClick={() => navigate('/hotels')}>
                        View All Experiences <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                </div>

                <div className="row g-4">
                    {hotelsToDisplay.map((hotel, index) => (
                        <div key={hotel.id || hotel.hotelId || index} className="col-12 col-md-6 col-lg-4 col-xl-3">
                            <div 
                                className={`card hotel-card h-100 border-0 shadow-sm ${isVisible ? 'fade-in-up' : ''}`}
                                style={{ borderRadius: '20px', cursor: 'pointer', opacity: 0, animationDelay: `${0.05 * (index % 4)}s` }}
                                onClick={() => navigate(hotel.id || hotel.hotelId ? `/hotels/${hotel.id || hotel.hotelId}` : '/hotels')}
                            >
                                <div className="position-relative overflow-hidden" style={{ height: '220px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                                    <HotelImage hotel={hotel} />
                                    <div className="position-absolute top-0 end-0 m-3">
                                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '35px', height: '35px' }}>
                                            <i className="bi bi-heart text-muted"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <span className="badge bg-light text-primary-custom px-2 py-1 rounded-pill small fw-semibold">
                                            {hotel.category || 'LUXURY'}
                                        </span>
                                        {renderStars(hotel.rating || hotel.avgRating || 4.5)}
                                    </div>
                                    <h4 className="card-title fw-bold mb-1" style={{ fontSize: '1.2rem', color: 'var(--text-dark)' }}>{hotel.name}</h4>
                                    <p className="text-muted small mb-3"><i className="bi bi-geo-alt me-1"></i> {hotel.city}</p>
                                    <p className="text-muted small text-truncate-2" style={{ minHeight: '40px' }}>{hotel.desc || hotel.description || 'Experience world-class luxury and comfort.'}</p>
                                    <hr className="opacity-10 my-3" />
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small text-muted">{hotel.reviews || hotel.reviewCount || 120} reviews</span>
                                        <div>
                                            <span className="small text-muted me-1">from</span>
                                            <span className="fw-bold fs-5 text-dark">₹{Number(hotel.price || hotel.pricePerNight || hotel.minPrice || 5000).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="text-center mt-5 d-md-none">
                    <button className="btn btn-outline-custom rounded-pill px-4 w-100" onClick={() => navigate('/hotels')}>
                        View All Experiences
                    </button>
                </div>
            </div>

            <style>{`
                .hotel-card {
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hotel-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                }
                .hotel-img {
                    transition: transform 0.6s ease;
                }
                .hotel-card:hover .hotel-img {
                    transform: scale(1.08);
                }
                .text-truncate-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default FeaturedHotelsDemo;
