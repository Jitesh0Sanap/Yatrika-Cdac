import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import HeroBanner from '../components/HeroBanner';
import SearchCard from '../components/SearchCard';
import TrustStatistics from '../components/TrustStatistics';
import LuxuryDestinations from '../components/LuxuryDestinations';
import FeaturedHotelsDemo from '../components/FeaturedHotelsDemo';
import TravelCollections from '../components/TravelCollections';
import WhyChooseYatrika from '../components/WhyChooseYatrika';
import TrendingDestinations from '../components/TrendingDestinations';
import Testimonials from '../components/Testimonials';
import PartnerBrands from '../components/PartnerBrands';
import NewsletterPremium from '../components/NewsletterPremium';
import '../pages/home.css';

const amenityOptions = ['WIFI', 'SWIMMING_POOL', 'GARDEN', 'BAR', 'SPA', 'GYM', 'RESTAURANT', 'BREAKFAST_INCLUDED', 'AIRPORT_SHUTTLE', 'CHAUFFEUR_SERVICE', 'FREE_PARKING', 'PET_FRIENDLY'];

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredHotels, setFeaturedHotels] = useState([]);
  
  // We no longer need loading state since FeaturedHotelsDemo handles fallback internally instantly

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          // Logged in: Fetch Recommendations
          const resp = await api.get('/recommendations');
          if (resp.data && resp.data.length > 0) {
              setFeaturedHotels(resp.data.slice(0, 12));
          }
        } else {
          // Not logged in: Fetch default popular hotels
          const resp = await api.get('/hotels');
          if (resp.data && resp.data.length > 0) {
              setFeaturedHotels(resp.data.slice(0, 12));
          }
        }
      } catch (e) {
        setFeaturedHotels([]);
      }
    };
    loadData();
  }, [user]);

  const handleSearch = (q) => {
    const city = q?.city?.trim();
    const params = [];
    if (city) params.push(`city=${encodeURIComponent(city)}`);
    const query = params.length ? `?${params.join('&')}` : '';
    navigate(`/hotels${query}`);
  };

  return (
    <main id="top" style={{ backgroundColor: 'var(--secondary-color)', minHeight: '100vh', paddingBottom: '0' }}>
      <HeroBanner user={user} />
      
      <div className="position-relative" style={{ zIndex: 10 }}>
        <SearchCard amenityOptions={amenityOptions} onSearch={handleSearch} />
      </div>

      <TrustStatistics />
      
      <LuxuryDestinations />
      
      <FeaturedHotelsDemo 
        existingHotels={featuredHotels} 
        title={user ? "Recommended For You" : "Trending Hotels"}
        subtitle={user ? "Based on your history" : "Most Popular"}
      />
      
      <TravelCollections />
      
      <WhyChooseYatrika />
      
      <TrendingDestinations />
      
      <Testimonials />
      
      <PartnerBrands />
      
      <NewsletterPremium />

    </main>
  );
};

export default HomePage;
