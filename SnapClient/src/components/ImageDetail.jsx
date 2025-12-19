import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Edit, User, Eye } from 'lucide-react';
import axiosInstance, { API_BASE_URL } from '../utils/axiosInstance';
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
                src={image.image && !image.image.startsWith('http') ? `${API_BASE_URL}${image.image.startsWith('/') ? '' : '/'}${image.image}` : (image.image || image.url || '')}
                alt={image.title}
                className="w-full rounded-lg border-4 border-black"
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 border-black transition-colors ${
                    liked
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </button>
                <div className="flex items-center gap-2 text-black font-semibold">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length} comments</span>
                </div>
                <div className="flex items-center gap-2 text-black font-semibold">
                  <Eye className="w-5 h-5" />
                  <span>{viewCount} views</span>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/images/${id}/edit`)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold border-2 border-black hover:bg-yellow-500 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold border-2 border-black hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {image.description && (
              <p className="text-black mb-6 whitespace-pre-line">{image.description}</p>
            )}

            {/* Comments Section */}
            <div className="border-t-4 border-black pt-6 mt-6">
              <h3 className="text-2xl font-black text-black mb-4">Comments</h3>
              
              <div className="space-y-4 mb-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 border-2 border-black rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-black" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-black">@{comment.user}</span>
                            <span className="text-sm text-gray-600">
                              {new Date(comment.created).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-black">{comment.body}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-black">
                    <p className="text-gray-600">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>

              {/* Comment Form */}
              <form onSubmit={handleComment} className="bg-yellow-400 border-2 border-black rounded-lg p-4">
                <h4 className="text-xl font-bold text-black mb-3">Add a comment</h4>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your comment here..."
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-3"
                  rows="3"
                />
                <button
                  type="submit"
                  className="bg-black text-yellow-400 px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
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

