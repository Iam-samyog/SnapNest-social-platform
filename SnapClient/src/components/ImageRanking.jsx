import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Heart, Eye } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';

const ImageRanking = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      // Fetch all images and sort by views (matching backend Redis ranking)
      const response = await axiosInstance.get('images/');
      const allImages = response.data.results || response.data || [];
      const sortedImages = [...allImages].sort((a, b) => (b.total_views || 0) - (a.total_views || 0));
      setImages(sortedImages.slice(0, 10)); // Top 10
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-semibold">Loading ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-yellow-400 border-b-4 border-black p-6 mb-6">
          <h1 className="text-4xl font-black text-black text-center flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10" />
            Images Ranking
          </h1>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border-4 border-black rounded-lg shadow-2xl p-6">
            <ol className="space-y-4">
              {images.map((image, index) => (
                <li
                  key={image.id}
                  onClick={() => navigate(`/images/${image.id}`)}
                  className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-black rounded-lg cursor-pointer hover:bg-yellow-400 hover:scale-105 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 border-4 border-black rounded-full flex items-center justify-center font-black text-2xl text-black">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-black mb-2">{image.title || 'Untitled'}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="font-semibold">{image.total_likes || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">{image.total_views || 0} views</span>
                      </div>
                    </div>
                  </div>
                  {index < 3 && (
                    <Trophy className={`w-8 h-8 ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      'text-orange-600'
                    }`} />
                  )}
                </li>
              ))}
            </ol>
            
            {images.length === 0 && (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-bold text-black mb-2">No images yet</p>
                <p className="text-gray-600">Start uploading to see rankings!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageRanking;

