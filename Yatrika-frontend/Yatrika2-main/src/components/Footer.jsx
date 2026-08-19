import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-premium" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--white)', paddingTop: '80px', paddingBottom: '40px', marginTop: 'auto' }}>
      <div className="page-container">
        <div className="row g-5 mb-5">
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="text-decoration-none d-flex align-items-center mb-4">
                <i className="bi bi-compass-fill me-2" style={{ color: 'var(--gold)', fontSize: '2rem' }}></i>
                <span style={{ color: 'var(--white)', fontWeight: 800, letterSpacing: '-0.5px', fontSize: '1.8rem' }}>Yatrika</span>
            </Link>
            <p style={{ opacity: 0.8, maxWidth: '320px', lineHeight: 1.8, fontSize: '0.95rem' }}>
              We curate the world’s finest luxury hotels and resorts, crafting extraordinary travel experiences for the discerning global explorer.
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="social-link"><i className="bi bi-instagram"></i></a>
              <a href="#" className="social-link"><i className="bi bi-facebook"></i></a>
              <a href="#" className="social-link"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="social-link"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="social-link"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="mb-4 text-gold fw-bold" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>Company</h5>
            <ul className="list-unstyled footer-links" style={{ lineHeight: '2.2', fontSize: '0.95rem' }}>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
              <li><Link to="/sustainability">Sustainability</Link></li>
              <li><Link to="/register-owner">List Your Property</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="mb-4 text-gold fw-bold" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>Support</h5>
            <ul className="list-unstyled footer-links" style={{ lineHeight: '2.2', fontSize: '0.95rem' }}>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/concierge">24/7 Concierge</Link></li>
              <li><Link to="/covid-19">Safety Guidelines</Link></li>
              <li><Link to="/sitemap">Sitemap</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="mb-4 text-gold fw-bold" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>Policies</h5>
            <ul className="list-unstyled footer-links" style={{ lineHeight: '2.2', fontSize: '0.95rem' }}>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
              <li><Link to="/accessibility">Accessibility</Link></li>
              <li><Link to="/refunds">Refund Policy</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="mb-4 text-gold fw-bold" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>Mobile App</h5>
            <div className="d-flex flex-column gap-3 mt-3">
              <a href="#" className="app-btn border rounded p-2 d-flex align-items-center text-decoration-none text-white transition-all">
                <i className="bi bi-apple fs-4 me-2"></i>
                <div className="lh-1 text-start">
                    <small style={{ fontSize: '0.65rem', opacity: 0.8 }}>Download on the</small>
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>App Store</div>
                </div>
              </a>
              <a href="#" className="app-btn border rounded p-2 d-flex align-items-center text-decoration-none text-white transition-all">
                <i className="bi bi-google-play fs-4 me-2"></i>
                <div className="lh-1 text-start">
                    <small style={{ fontSize: '0.65rem', opacity: 0.8 }}>GET IT ON</small>
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-top pt-4 mt-5 d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ borderColor: 'rgba(255,255,255,0.1) !important', opacity: 0.7, fontSize: '0.85rem' }}>
          <div className="mb-3 mb-md-0">
            &copy; {new Date().getFullYear()} Yatrika Luxury Stays. All rights reserved.
          </div>
          <div className="d-flex gap-4">
             <span className="d-flex align-items-center"><i className="bi bi-globe me-2"></i> English (US)</span>
             <span className="d-flex align-items-center"><i className="bi bi-currency-dollar me-1"></i> USD</span>
          </div>
        </div>
      </div>

      <style>{`
        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.05);
          color: var(--white);
          font-size: 1.2rem;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .social-link:hover {
          background-color: var(--gold);
          color: var(--text-dark);
          transform: translateY(-3px);
        }
        .footer-links a {
          color: var(--white);
          opacity: 0.8;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }
        .footer-links a:hover {
          opacity: 1;
          color: var(--gold);
          padding-left: 5px;
        }
        .app-btn {
          border-color: rgba(255,255,255,0.2) !important;
          background: rgba(255,255,255,0.05);
        }
        .app-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.4) !important;
        }
      `}</style>
    </footer>
  );
}
