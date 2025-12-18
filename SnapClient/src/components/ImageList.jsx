import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Eye } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
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

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async (pageNum = 1) => {
    try {
      const response = await axiosInstance.get('images/', {
        params: { page: pageNum }
      });
      const newImages = response.data.results || response.data || [];
      
      if (pageNum === 1) {
        setImages(newImages);
      } else {
        setImages(prev => [...prev, ...newImages]);
      }
      
      setHasMore(newImages.length > 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching images:', error);
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(nextPage);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, page]);

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
          📸 Images Bookmarked
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => {
                  setSelectedImageId(image.id);
                  setIsModalOpen(true);
                }}
                className="bg-white border-4 border-black rounded-lg shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <div className="aspect-square relative">
                  <img
                    src={image.image || image.url || ''}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <Heart className="w-4 h-4" />
                      <span>{image.total_likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <Eye className="w-4 h-4" />
                      <span>{image.total_views || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h6 className="font-bold text-black text-sm truncate mb-2">
                    {image.title || 'Untitled'}
                  </h6>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{image.user || 'Unknown'}</span>
                    </div>
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

