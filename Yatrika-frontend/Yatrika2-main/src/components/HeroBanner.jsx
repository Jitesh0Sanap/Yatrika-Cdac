import React, { useState, useEffect } from 'react';

const IMAGES = [
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=2000&q=80', // Maldives
  'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=2000&q=80', // Swiss/Forest
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2000&q=80', // Resort
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=80', // Premium Hotel
  'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=2000&q=80'  // Beach
];

function HeroBanner({ user }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Preload images
    IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="position-relative d-flex flex-column align-items-center justify-content-center overflow-hidden" style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      
      {/* Background Slideshow */}
      {IMAGES.map((src, index) => (
        <div
          key={src}
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url('${src}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            animation: index === currentIndex ? 'kenBurns 10s ease-out forwards' : 'none',
            zIndex: 0
          }}
        />
      ))}

      {/* Premium Overlay: warm black gradient + vignette */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100" 
        style={{
          background: 'linear-gradient(to bottom, rgba(15,20,25,0.4) 0%, rgba(15,20,25,0.7) 100%)',
          boxShadow: 'inset 0 0 150px rgba(0,0,0,0.5)',
          zIndex: 1
        }}
      />

      <div className="page-container w-100 position-relative d-flex flex-column align-items-center text-center text-white" style={{ zIndex: 2, paddingBottom: '120px' }}>
        
        {/* Top Badge */}
        <div className="d-inline-flex align-items-center px-4 py-2 mb-4 rounded-pill shadow-lg fade-in-up" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', animationDelay: '0.2s' }}>
          <span className="me-2 text-gold">★★★★★</span>
          <span className="small fw-semibold" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>Rated 4.9 by 50,000+ Travelers</span>
        </div>
        
        {/* Large Heading */}
        <h1 className="display-2 mb-4 fade-in-up luxury-heading" style={{ animationDelay: '0.4s', maxWidth: '1000px', margin: '0 auto' }}>
          Luxury Stays Crafted For Extraordinary Journeys
        </h1>
        
        {/* Description */}
        <p className="lead mb-5 fade-in-up" style={{ opacity: 0.9, maxWidth: '700px', fontSize: '1.25rem', lineHeight: 1.8, animationDelay: '0.6s', margin: '0 auto' }}>
          Discover handpicked luxury resorts, boutique hotels, and unforgettable destinations across the globe. Elevate your travel experience with Yatrika.
        </p>

        {/* CTA Buttons */}
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center fade-in-up" style={{ animationDelay: '0.8s' }}>
          <button className="btn btn-lg px-5 py-3 rounded-pill fw-bold btn-gold-gradient hover-lift">
            Explore Hotels
          </button>
          <button className="btn btn-lg px-5 py-3 rounded-pill fw-bold btn-glass hover-lift">
            <i className="bi bi-play-circle me-2"></i> Watch Experience
          </button>
        </div>

      </div>
      
      {/* Scroll Indicator */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 pb-2 fade-in-up d-none d-md-flex flex-column align-items-center" style={{ animationDelay: '1.2s', zIndex: 2 }}>
        <span className="text-white small fw-bold text-uppercase mb-2" style={{ letterSpacing: '3px', opacity: 0.8, fontSize: '0.75rem' }}>Scroll</span>
        <div className="mouse-scroll-indicator">
          <div className="mouse-scroll-dot"></div>
        </div>
      </div>

      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        .luxury-heading {
          font-family: 'Playfair Display', 'Georgia', serif;
          font-weight: 700;
          line-height: 1.15;
          text-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .btn-gold-gradient {
          background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%);
          color: #fff;
          border: none;
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
          transition: all 0.3s ease;
        }
        .btn-gold-gradient:hover {
          background: linear-gradient(135deg, #e6c555 0%, #b89830 100%);
          color: #fff;
          box-shadow: 0 12px 25px rgba(212, 175, 55, 0.4);
        }
        .btn-glass {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }
        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.25);
          color: #fff;
        }
        .hover-lift:hover {
          transform: translateY(-3px);
        }
        .mouse-scroll-indicator {
          width: 24px;
          height: 40px;
          border: 2px solid rgba(255,255,255,0.6);
          border-radius: 20px;
          position: relative;
        }
        .mouse-scroll-dot {
          width: 4px;
          height: 8px;
          background-color: white;
          border-radius: 4px;
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          animation: scrollDown 2s infinite;
        }
        @keyframes scrollDown {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, 15px); opacity: 0; }
        }
        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

export default HeroBanner;
