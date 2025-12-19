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
          <p className="text-black font-semibold uppercase">Loading image...</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-black font-semibold text-xl uppercase italic">Image not found</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-yellow-400 pb-12">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="bg-white border-4 border-black rounded-lg shadow-2xl p-6 md:p-8 mb-6">
            <h1 className="text-4xl font-black text-black mb-6 uppercase tracking-tight">{image.title || 'Untitled'}</h1>
            
            <div className="mb-8">
              <img
                src={getFullMediaUrl(image.image || image.url)}
                alt={image.title}
                className="w-full rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 border-black transition-colors ${
                    liked
                      ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </button>
                <div className="flex items-center gap-2 text-black font-black text-sm uppercase">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </div>
                <div className="flex items-center gap-2 text-black font-black text-sm uppercase">
                  <Eye className="w-5 h-5" />
                  <span>{viewCount}</span>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/images/${id}/edit`)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold border-2 border-black hover:bg-yellow-500 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-2 uppercase text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold border-2 border-black hover:bg-red-600 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-2 uppercase text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {image.description && (
              <div className="mb-8 p-6 bg-gray-50 border-2 border-black rounded-lg font-medium leading-relaxed">
                {image.description}
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t-4 border-black pt-10 mt-10">
              <h3 className="text-3xl font-black text-black mb-6 uppercase italic">💬 Comments ({comments.length})</h3>
              
              <div className="space-y-6 mb-10">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 border-2 border-black rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                           {comment.user_photo ? (
                              <img 
                                src={getFullMediaUrl(comment.user_photo)} 
                                alt={comment.user}
                                className="w-12 h-12 rounded-full border-2 border-black bg-white object-cover"
                              />
                           ) : (
                              <div className="w-12 h-12 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center">
                                <User className="w-8 h-8 text-black" />
                              </div>
                           )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-black uppercase tracking-tight text-sm">@{comment.user}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              {new Date(comment.created).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-black font-medium">{comment.body}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-black">
                    <p className="text-gray-600 font-bold uppercase italic tracking-wider">No comments yet</p>
                  </div>
                )}
              </div>

              {/* Comment Form */}
              <form onSubmit={handleComment} className="bg-yellow-400 border-4 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="text-lg font-black text-black mb-4 uppercase italic tracking-tight">✍️ Join the discussion</h4>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What do you think?"
                  className="w-full px-5 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-4 font-medium"
                  rows="3"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="w-full bg-black text-yellow-400 py-3 rounded-lg font-black text-lg uppercase tracking-widest hover:bg-gray-800 transition-all active:translate-y-0.5 active:shadow-none disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60]">
          <div className="bg-white border-4 border-black rounded-lg p-8 max-w-md mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-tight">Confirm Delete</h3>
            <p className="text-black mb-8 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong>{image.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-black border-2 border-black hover:bg-red-600 transition-all active:translate-y-0.5 active:shadow-none flex-1 uppercase text-sm"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 text-black px-6 py-3 rounded-lg font-black border-2 border-black hover:bg-gray-300 transition-all active:translate-y-0.5 active:shadow-none flex-1 uppercase text-sm"
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
