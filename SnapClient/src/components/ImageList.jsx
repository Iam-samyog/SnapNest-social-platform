import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faEye } from '@fortawesome/free-solid-svg-icons';
import axiosInstance, { API_BASE_URL, getFullMediaUrl } from '../utils/axiosInstance';
import Navbar from './Navbar';
import ImageModal from './ImageModal';

const ImageList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Ref for the last image element (for Intersection Observer)
  const lastImageRef = useRef(null);
  const observerRef = useRef(null);

  const fetchImages = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('images/', {
        params: { page: pageNum }
      });
      const newImages = response.data.results || response.data || [];
      
      if (pageNum === 1) {
        setImages(newImages);
      } else {
        setImages(prev => [...prev, ...newImages]);
      }
      
      // Check if there's a next page in the pagination response
      setHasMore(!!response.data.next);
    } catch (error) {
      console.error('Error fetching images:', error);
      // On error, stop trying to load more
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies for useCallback

  useEffect(() => {
    fetchImages();
  }, [fetchImages]); // Initial fetch

  // Set up Intersection Observer for infinite scroll
  useEffect(() => {
    if (loading || !hasMore) return;
    
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchImages(nextPage);
        }
      },
      { threshold: 0.1 }
    );
    
    // Observe the last image
    if (lastImageRef.current) {
      observerRef.current.observe(lastImageRef.current);
    }
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, page, fetchImages]); // Dependencies for the observer

  if (loading && images.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-semibold">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-yellow-400 border-b-4 border-black p-6 mb-6">
        <h1 className="text-4xl font-black text-black text-center">
          Explore
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {images.map((image, index) => (
              <div
                key={image.id}
                ref={index === images.length - 1 ? lastImageRef : null}
                onClick={() => {
                  setSelectedImageId(image.id);
                  setIsModalOpen(true);
                }}
                className="aspect-square relative cursor-pointer group overflow-hidden bg-gray-200"
              >
                <img
                  src={getFullMediaUrl(image.image || image.url)}
                  alt={image.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <FontAwesomeIcon icon={faHeart} />
                    <span>{image.total_likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <FontAwesomeIcon icon={faEye} />
                    <span>{image.total_views || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border-4 border-black">
            <p className="text-2xl font-bold text-black mb-2">No images yet</p>
            <p className="text-gray-600 mb-6">Start by uploading or bookmarking images!</p>
            <button
              onClick={() => navigate('/images/upload')}
              className="bg-black text-yellow-400 px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              Upload Your First Image
            </button>
          </div>
        )}
      </div>
      </div>
      
      {/* Image Modal */}
      <ImageModal
        imageId={selectedImageId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImageId(null);
        }}
      />
    </>
  );
};

export default ImageList;

