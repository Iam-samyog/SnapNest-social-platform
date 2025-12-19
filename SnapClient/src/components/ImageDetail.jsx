import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Edit, User, Eye } from 'lucide-react';
import axiosInstance, { API_BASE_URL, getFullMediaUrl } from '../utils/axiosInstance';
import Navbar from './Navbar';

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchImage();
    // Increment view count when page loads
    incrementViews();
  }, [id]);

  const incrementViews = async () => {
    try {
      const response = await axiosInstance.post(`images/${id}/increment_views/`);
      setViewCount(response.data.total_views || 0);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const fetchImage = async () => {
    try {
      const response = await axiosInstance.get(`images/${id}/`);
      const imageData = response.data;
      setImage(imageData);
      setComments(imageData.comments || []);
      setLikeCount(imageData.total_likes || 0);
      setViewCount(imageData.total_views || 0);
      setLiked(imageData.is_liked || false);
      
      // Check if current user is the owner
      const profileRes = await axiosInstance.get('profile/');
      setIsOwner(profileRes.data.user?.username === imageData.user);
    } catch (error) {
      console.error('Error fetching image:', error);
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axiosInstance.post(`images/${id}/like/`);
      const newLikedState = response.data.liked !== undefined ? response.data.liked : !liked;
      setLiked(newLikedState);
      
      // Refresh image to get updated like count
      const imageRes = await axiosInstance.get(`images/${id}/`);
      setLikeCount(imageRes.data.total_likes || 0);
    } catch (error) {
      console.error('Error liking image:', error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert('Error updating like. Please try again.');
      }
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await axiosInstance.post(`images/${id}/comment/`, {
        body: commentText
      });
      setComments(prev => [...prev, response.data]);
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`images/${id}/`);
      navigate('/images');
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-semibold">Loading image...</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-black font-semibold text-xl">Image not found</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-yellow min-h-screen bg-gray-50 pb-8">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="bg-white border-4 border-black rounded-lg shadow-2xl p-6 mb-6">
            <h1 className="text-3xl font-black text-black mb-4">{image.title || 'Untitled'}</h1>
            
            <div className="mb-6">
              <img
                src={getFullMediaUrl(image.image || image.url)}
                alt={image.title}
                className="w-full rounded-lg border-4 border-black"
              />
            </div>

            <div className="flex flex-col gap-6 mb-8">
              {/* Stats Panel */}
              <div className="grid grid-cols-3 bg-gray-50 border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={handleLike}
                  className={`flex flex-col items-center justify-center p-4 border-r-4 border-black transition-all ${
                    liked ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-yellow-400'
                  } active:translate-y-1 active:shadow-none`}
                >
                  <Heart className={`w-6 h-6 mb-1 ${liked ? 'fill-current' : ''}`} />
                  <span className="font-black text-xs uppercase tracking-tighter">{likeCount} Likes</span>
                </button>

                <div className="flex flex-col items-center justify-center p-4 bg-white border-r-4 border-black text-black">
                  <MessageCircle className="w-6 h-6 mb-1" />
                  <span className="font-black text-xs uppercase tracking-tighter">{comments.length} Comments</span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-white text-black">
                  <Eye className="w-6 h-6 mb-1" />
                  <span className="font-black text-xs uppercase tracking-tighter">{viewCount} Views</span>
                </div>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => navigate(`/images/${id}/edit`)}
                    className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-500 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    EDIT
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    DELETE
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            {image.description && (
              <div className="mb-10 p-6 bg-gray-50 border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black text-sm uppercase text-gray-400 mb-2 italic">📝 Description</h3>
                  <p className="text-xl font-bold text-black leading-relaxed whitespace-pre-line">
                  {image.description}
                </p>
              </div>
            )}

            {/* Comments Section */}
            <div className="pt-10 border-t-4 border-black">
              <h3 className="text-4xl font-black text-black mb-8 uppercase flex items-center gap-3">
                <span className="bg-yellow-400 px-3 border-4 border-black italic">COMMENTS</span>
                <span>💬</span>
              </h3>
              
              <div className="space-y-8 mb-10">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="group transition-all">
                      <div className="flex gap-4 md:gap-6">
                        <div className="flex-shrink-0">
                           {comment.user_photo ? (
                              <img 
                                src={getFullMediaUrl(comment.user_photo)} 
                                alt={comment.user}
                                className="w-14 h-14 rounded-full border-4 border-black bg-white object-cover shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              />
                           ) : (
                              <div className="w-14 h-14 rounded-full bg-yellow-400 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <User className="w-8 h-8 text-black" />
                              </div>
                           )}
                        </div>
                        <div className="flex-1 bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-transform">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-black text-black bg-yellow-400 px-3 py-1 border-2 border-black text-sm uppercase tracking-tight">@{comment.user}</span>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                              {new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(comment.created))}
                            </span>
                          </div>
                          <p className="font-bold text-lg text-gray-800 leading-normal">{comment.body}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white border-4 border-black border-dashed rounded-2xl">
                    <p className="text-2xl font-black text-gray-400 uppercase italic mb-2">Silence is golden...</p>
                    <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">But conversation is better. Leave a comment!</p>
                  </div>
                )}
              </div>

              {/* Comment Form */}
              <form onSubmit={handleComment} className="bg-yellow-400 border-4 border-black rounded-2xl p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="text-2xl font-black text-black mb-6 uppercase italic">✍️ Add your voice</h4>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-5 py-4 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-black mb-6 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  rows="4"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="w-full bg-black text-yellow-400 py-4 rounded-xl font-black text-xl uppercase tracking-widest hover:bg-gray-800 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Post Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-2xl font-black text-black mb-4">Confirm Delete</h3>
            <p className="text-black mb-6">
              Are you sure you want to permanently delete <strong>{image.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold border-2 border-black hover:bg-red-600 transition-colors flex-1"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 text-black px-6 py-2 rounded-lg font-bold border-2 border-black hover:bg-gray-300 transition-colors flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageDetail;

