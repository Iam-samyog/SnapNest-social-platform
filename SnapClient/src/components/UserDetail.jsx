import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Heart, Eye, UserPlus, UserCheck } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';
import ImageModal from './ImageModal';

const UserDetail = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    try {
      // Fetch user list to find the user
      const usersRes = await axiosInstance.get('users/');
      const users = usersRes.data.results || usersRes.data || [];
      const user = users.find(u => u.username === username);
      
      if (user) {
        setUserData(user);
        setIsFollowing(user.is_following || false);
        
        // Check if this is the current user
        const profileRes = await axiosInstance.get('profile/');
        setIsCurrentUser(profileRes.data.user?.username === username);
        
        // Fetch user's images
        const imagesRes = await axiosInstance.get('images/');
        const allImages = imagesRes.data.results || imagesRes.data || [];
        const userImages = allImages.filter(img => img.user === username);
        setImages(userImages);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await axiosInstance.post(`users/${userData.id}/follow/`);
      const newFollowingState = response.data.following !== undefined ? response.data.following : !isFollowing;
      setIsFollowing(newFollowingState);
      
      // Update follower count from API response (most accurate)
      if (response.data.followers_count !== undefined) {
        setUserData(prev => ({
          ...prev,
          followers_count: response.data.followers_count
        }));
      } else {
        // Fallback: calculate based on action
        setUserData(prev => ({
          ...prev,
          followers_count: newFollowingState ? prev.followers_count + 1 : Math.max(0, prev.followers_count - 1)
        }));
      }
    } catch (error) {
      console.error('Error following user:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert('Error updating follow status. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-black font-semibold text-xl">User not found</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          {/* Profile Header */}
          <div className="bg-yellow-400 border-4 border-black rounded-lg shadow-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                {userData.profile?.photo ? (
                  <img
                    src={userData.profile.photo}
                    alt={userData.username}
                    className="w-32 h-32 rounded-full border-4 border-black object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-black flex items-center justify-center">
                    <User className="w-16 h-16 text-black" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h2 className="text-3xl font-black text-black">{userData.username}</h2>
                  {!isCurrentUser && (
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2 rounded-lg font-bold border-2 border-black transition-colors flex items-center gap-2 ${
                        isFollowing
                          ? 'bg-gray-200 text-black hover:bg-gray-300'
                          : 'bg-black text-yellow-400 hover:bg-gray-800'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-5 h-5" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                <div className="flex gap-6 justify-center md:justify-start mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-black">{images.length}</div>
                    <div className="text-sm text-black">posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-black">{userData.followers_count || 0}</div>
                    <div className="text-sm text-black">followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-black">{userData.following_count || 0}</div>
                    <div className="text-sm text-black">following</div>
                  </div>
                </div>
                
                {userData.first_name && (
                  <p className="text-black font-semibold">{userData.first_name} {userData.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images Grid */}
          <div className="bg-white border-4 border-black rounded-lg shadow-2xl p-6">
            <h3 className="text-2xl font-black text-black mb-6">📸 Images</h3>
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => {
                      setSelectedImageId(image.id);
                      setIsModalOpen(true);
                    }}
                    className="aspect-square relative cursor-pointer group overflow-hidden rounded-lg border-2 border-black"
                  >
                    <img
                      src={image.image || image.url || ''}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
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
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-bold text-black mb-2">No images yet</p>
                <p className="text-gray-600">This user hasn't uploaded any images.</p>
              </div>
            )}
          </div>
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

export default UserDetail;

