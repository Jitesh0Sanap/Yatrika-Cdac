import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function ImageGallery({ images = [], fallbackImage }) {
  const slots = [0, 1, 2, 3, 4].map(i => images[i] || fallbackImage);
  const [imgSources, setImgSources] = useState(slots);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleError = (index) => {
    setImgSources(prev => {
      const newSrc = [...prev];
      newSrc[index] = fallbackImage;
      return newSrc;
    });
  };

  const openModal = (index) => {
    setActiveImageIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const displayImages = images.length > 0 ? images : imgSources;

  return (
    <>
      <div className="image-gallery mb-5">
        <div className="d-none d-md-flex position-relative" style={{ gap: '8px', height: '480px', borderRadius: 'var(--border-radius-xl)', overflow: 'hidden' }}>
          <div className="flex-grow-1 overflow-hidden" onClick={() => openModal(0)} style={{ cursor: 'pointer' }}>
            <img 
              src={imgSources[0]} 
              alt="Main View"
              className="w-100 h-100 image-fade-in"
              style={{ objectFit: 'cover', transition: 'transform 0.5s ease, filter 0.3s' }}
              onError={() => handleError(0)}
              onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseOut={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
            />
          </div>
          
          <div className="d-flex flex-column" style={{ width: '25%', gap: '8px' }}>
            <div className="flex-grow-1 overflow-hidden" onClick={() => openModal(1)} style={{ cursor: 'pointer' }}>
              <img src={imgSources[1]} alt="View 2" className="w-100 h-100 image-fade-in" style={{ objectFit: 'cover', transition: 'filter 0.3s' }} onError={() => handleError(1)} onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(0.85)'} onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'} />
            </div>
            <div className="flex-grow-1 overflow-hidden" onClick={() => openModal(2)} style={{ cursor: 'pointer' }}>
              <img src={imgSources[2]} alt="View 3" className="w-100 h-100 image-fade-in" style={{ objectFit: 'cover', transition: 'filter 0.3s' }} onError={() => handleError(2)} onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(0.85)'} onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'} />
            </div>
          </div>
          
          <div className="d-flex flex-column" style={{ width: '25%', gap: '8px' }}>
            <div className="flex-grow-1 overflow-hidden" onClick={() => openModal(3)} style={{ cursor: 'pointer' }}>
              <img src={imgSources[3]} alt="View 4" className="w-100 h-100 image-fade-in" style={{ objectFit: 'cover', transition: 'filter 0.3s' }} onError={() => handleError(3)} onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(0.85)'} onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'} />
            </div>
            <div className="flex-grow-1 position-relative overflow-hidden" onClick={() => openModal(4)} style={{ cursor: 'pointer' }}>
              <img src={imgSources[4]} alt="View 5" className="w-100 h-100 image-fade-in" style={{ objectFit: 'cover', transition: 'filter 0.3s' }} onError={() => handleError(4)} onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(0.85)'} onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'} />
            </div>
          </div>

          <button onClick={() => openModal(0)} className="btn btn-light position-absolute shadow-sm fw-bold hover-lift" style={{ bottom: '16px', right: '16px', borderRadius: '8px', zIndex: 10 }}>
            <i className="bi bi-grid-3x3-gap-fill me-2"></i> Show all photos
          </button>
        </div>

        <div className="mobile-carousel d-md-none position-relative" style={{ borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <div id="hotelCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner" style={{ height: '320px' }}>
              {imgSources.map((src, idx) => (
                <div key={idx} className={`carousel-item h-100 ${idx === 0 ? 'active' : ''}`} onClick={() => openModal(idx)}>
                  <img src={src} alt={`Slide ${idx + 1}`} className="d-block w-100 h-100 image-fade-in" style={{ objectFit: 'cover' }} onError={() => handleError(idx)} />
                </div>
              ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#hotelCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon shadow-sm rounded-circle bg-dark bg-opacity-50 p-3" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#hotelCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon shadow-sm rounded-circle bg-dark bg-opacity-50 p-3" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
          <div className="position-absolute bottom-0 end-0 m-3 px-3 py-1 bg-dark bg-opacity-75 text-white small fw-bold rounded-pill shadow-sm" style={{ zIndex: 5 }} onClick={() => openModal(0)}>
             1 / {images.length > 0 ? images.length : 5}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      )}
      
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }} onClick={closeModal}>
          <div className="modal-dialog modal-fullscreen modal-dialog-centered" role="document">
            <div className="modal-content bg-dark border-0">
              <div className="modal-header border-0 pb-0 z-3 position-absolute w-100 p-4">
                <div className="text-white small fw-bold">{activeImageIndex + 1} / {displayImages.length}</div>
                <button type="button" className="btn-close btn-close-white fs-5" aria-label="Close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-0 d-flex align-items-center justify-content-center position-relative" onClick={(e) => e.stopPropagation()}>
                <img 
                  src={displayImages[activeImageIndex]} 
                  alt="Gallery Fullscreen" 
                  className="img-fluid fade-in" 
                  style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = fallbackImage; }}
                />
                
                <button 
                  className="btn btn-dark bg-opacity-50 text-white rounded-circle position-absolute start-0 ms-4" 
                  style={{ width: '50px', height: '50px', top: '50%', transform: 'translateY(-50%)' }}
                  onClick={prevImage}
                >
                  <i className="bi bi-chevron-left fs-4"></i>
                </button>
                <button 
                  className="btn btn-dark bg-opacity-50 text-white rounded-circle position-absolute end-0 me-4" 
                  style={{ width: '50px', height: '50px', top: '50%', transform: 'translateY(-50%)' }}
                  onClick={nextImage}
                >
                  <i className="bi bi-chevron-right fs-4"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageGallery;

