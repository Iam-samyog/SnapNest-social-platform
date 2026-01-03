import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Edit, User, Eye } from 'lucide-react';
import axiosInstance, { API_BASE_URL, getFullMediaUrl } from '../utils/axiosInstance';
import Navbar from './Navbar';

const ImageDetail = () => {
  const { uuid } = useParams();
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
  const [isDeleting, setIsDeleting] = useState(false);

  const hasIncrementedAction = React.useRef(false);
  
  useEffect(() => {
    fetchImage();
    
    // Use a ref to ensure increment only happens once even if component re-mounts (Strict Mode)
    if (!hasIncrementedAction.current) {
        incrementViews();
        hasIncrementedAction.current = true;
    }
  }, [uuid]);

  const incrementViews = async () => {
    try {
      const response = await axiosInstance.post(`images/${uuid}/increment_views/`);
      setViewCount(response.data.total_views || 0);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const fetchImage = async () => {
    try {
      const response = await axiosInstance.get(`images/${uuid}/`);
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
      const response = await axiosInstance.post(`images/${uuid}/like/`);
      const newLikedState = response.data.liked !== undefined ? response.data.liked : !liked;
      setLiked(newLikedState);
      
      // Update like count from response
      if (response.data.total_likes !== undefined) {
          setLikeCount(response.data.total_likes);
      }
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
      const response = await axiosInstance.post(`images/${uuid}/comment/`, {
        body: commentText
      });
      setComments(prev => [...prev, response.data]);
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`images/${uuid}/`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting image:', error);
      setIsDeleting(false);
      alert('Error deleting image. Please try again.');
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
        <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-4 md:pt-8">
          <div className="bg-white border-4 border-black rounded-lg shadow-2xl p-4 md:p-8 mb-6">
            <h1 className="text-2xl md:text-4xl font-black text-black mb-4 uppercase leading-tight">{image.title || 'Untitled'}</h1>
            
            {/* Uploader Info */}
            <div 
              onClick={() => navigate(`/users/${image.user}`)}
              className="flex items-center gap-2 mb-6 bg-gray-50 hover:bg-yellow-400 p-2 pr-4 rounded-lg border-2 border-black cursor-pointer transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none w-fit"
            >
              {image.user_photo ? (
                <img 
                  src={getFullMediaUrl(image.user_photo)} 
                  alt={image.user}
                  className="w-10 h-10 rounded-full border-2 border-black object-cover" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center">
                  <User className="w-6 h-6 text-black" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-black text-black text-xs md:text-sm uppercase tracking-tight leading-none">@{image.user}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">View Profile</span>
              </div>
            </div>
            
            <div className="mb-6">
              <img
                src={getFullMediaUrl(image.image || image.url)}
                alt={image.title}
                className="w-full rounded-lg border-4 border-black"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-gray-50 p-4 rounded-xl border-2 border-black border-dashed">
              <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-between md:justify-start">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black border-2 border-black transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    liked
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-black hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </button>
                <div className="flex items-center gap-2 text-black font-black uppercase text-xs md:text-sm tracking-tighter">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length} <span className="hidden sm:inline">comments</span><span className="sm:hidden">cmds</span></span>
                </div>
                <div className="flex items-center gap-2 text-black font-black uppercase text-xs md:text-sm tracking-tighter">
                  <Eye className="w-5 h-5" />
                  <span>{viewCount} <span className="hidden sm:inline">views</span><span className="sm:hidden">view</span></span>
                </div>
              </div>

              {isOwner && (
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => navigate(`/images/${uuid}/edit`)}
                    className="flex-1 md:flex-none bg-yellow-400 text-black px-6 py-2.5 rounded-lg font-black border-2 border-black hover:bg-yellow-500 transition-all active:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none flex items-center justify-center gap-2 uppercase text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex-1 md:flex-none bg-red-500 text-white px-6 py-2.5 rounded-lg font-black border-2 border-black hover:bg-red-600 transition-all active:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none flex items-center justify-center gap-2 uppercase text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {image.description && (
              <p className="text-black mb-6 whitespace-pre-line bg-gray-50 border-2 border-black rounded-lg p-4 leading-relaxed">
                {image.description}
              </p>
            )}

            {/* Comments Section */}
            <div className="border-t-4 border-black pt-6 mt-6">
              <h3 className="text-2xl font-black text-black mb-4 uppercase">Comments</h3>
              
              <div className="space-y-4 mb-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 border-2 border-black rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {comment.user_photo ? (
                            <img 
                              src={getFullMediaUrl(comment.user_photo)} 
                              alt={comment.user}
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <User className="w-6 h-6 text-black" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-1">
                            <span 
                              onClick={() => navigate(`/users/${comment.user}`)}
                              className="font-bold text-black text-sm cursor-pointer hover:underline truncate"
                            >
                              @{comment.user}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight whitespace-nowrap">
                              {new Date(comment.created).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-black text-sm leading-snug break-words">{comment.body}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-black">
                    <p className="text-gray-600 font-bold uppercase italic">No comments yet</p>
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
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-3 text-sm font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  rows="2"
                />
                <button
                  type="submit"
                  className="bg-black text-yellow-400 px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm"
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
          <div className="bg-white border-4 border-black rounded-lg p-6 max-w-md mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-black text-black mb-4 uppercase">Confirm Delete</h3>
            <p className="text-black mb-6 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong>{image.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-black border-2 border-black hover:bg-red-600 transition-colors flex-1 uppercase text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Trash2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 text-black px-6 py-2 rounded-lg font-black border-2 border-black hover:bg-gray-300 transition-colors flex-1 uppercase text-sm"
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
