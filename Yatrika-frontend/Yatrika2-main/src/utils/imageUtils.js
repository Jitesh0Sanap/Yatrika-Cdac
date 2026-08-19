export const HOTEL_CATEGORIES = {
  LUXURY: 'LUXURY',
  RESORT: 'RESORT',
  BUSINESS: 'BUSINESS',
  BUDGET: 'BUDGET',
  BOUTIQUE: 'BOUTIQUE',
  DEFAULT: 'DEFAULT',
};

const FALLBACK_IMAGES = {
  [HOTEL_CATEGORIES.LUXURY]: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  ],
  [HOTEL_CATEGORIES.RESORT]: [
    'https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512356181159-2511195ebf06?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533816654877-6d60c40e53a3?auto=format&fit=crop&w=800&q=80',
  ],
  [HOTEL_CATEGORIES.BUSINESS]: [
    'https://images.unsplash.com/photo-1551882547-ff40c0d5e9ce?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c894087b3252?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590490359854-dfba196ce0cb?auto=format&fit=crop&w=800&q=80',
  ],
  [HOTEL_CATEGORIES.DEFAULT]: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  ]
};

const resolveCategory = (categoryStr) => {
  if (!categoryStr) return HOTEL_CATEGORIES.DEFAULT;
  const upper = categoryStr.toUpperCase();
  if (upper.includes('LUXURY') || upper.includes('5 STAR')) return HOTEL_CATEGORIES.LUXURY;
  if (upper.includes('RESORT')) return HOTEL_CATEGORIES.RESORT;
  if (upper.includes('BUSINESS') || upper.includes('CITY')) return HOTEL_CATEGORIES.BUSINESS;
  if (upper.includes('BUDGET') || upper.includes('HOSTEL')) return HOTEL_CATEGORIES.BUDGET;
  if (upper.includes('BOUTIQUE')) return HOTEL_CATEGORIES.BOUTIQUE;
  return HOTEL_CATEGORIES.DEFAULT;
};

export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/api/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return `${baseUrl}${url}`;
  }
  return url;
};

export const generateImageModel = (hotel) => {
  const category = resolveCategory(hotel?.category);
  const fallbacks = FALLBACK_IMAGES[category] || FALLBACK_IMAGES[HOTEL_CATEGORIES.DEFAULT];
  
  let primaryDbImage = resolveImageUrl(hotel?.imageUrl);

  if (!primaryDbImage || primaryDbImage.includes('source.unsplash.com')) {
    primaryDbImage = fallbacks[0];
  }

  const galleryImages = [
    primaryDbImage,
    fallbacks[1],
    fallbacks[2],
    fallbacks[3],
    fallbacks[4],
  ];

  return {
    heroImage: primaryDbImage,
    galleryImages,
    roomImages: [fallbacks[1], fallbacks[2]],
    reception: fallbacks[2],
    restaurant: fallbacks[4],
    swimmingPool: fallbacks[1],
    bathroom: fallbacks[3],
    fallbackImage: fallbacks[0]
  };
};

export const getRoomImage = (room, hotelCategory) => {
  const category = resolveCategory(hotelCategory);
  const fallbacks = FALLBACK_IMAGES[category] || FALLBACK_IMAGES[HOTEL_CATEGORIES.DEFAULT];
  
  let primaryDbImage = resolveImageUrl(room?.imageUrl);
  if (!primaryDbImage || primaryDbImage.includes('source.unsplash.com')) {
    primaryDbImage = fallbacks[2];
  }
  return primaryDbImage;
};
