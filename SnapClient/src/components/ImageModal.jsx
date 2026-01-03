import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faTrash, faEdit, faTimes, faUser, faEye, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import axiosInstance, { API_BASE_URL, getFullMediaUrl } from '../utils/axiosInstance';

const ImageModal = ({ imageUuid, isOpen, onClose, onUpdate }) => {
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

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Ref to prevent double increment in Strict Mode
  const hasIncrementedAction = React.useRef(false);

  useEffect(() => {
    if (isOpen && imageUuid) {
      fetchImage();
      
      // Increment views when modal opens
      if (!hasIncrementedAction.current) {
          incrementViews();
          hasIncrementedAction.current = true;
      }
      
      // Reset edit state when opening a new image
      setIsEditing(false);
    } else if (!isOpen) {
        // Reset ref when modal closes
        hasIncrementedAction.current = false;
    }
  }, [isOpen, imageUuid]);

  const incrementViews = async () => {
    try {
      const response = await axiosInstance.post(`images/${imageUuid}/increment_views/`);
      const newViews = response.data.total_views || 0;
      setViewCount(newViews);
      if (onUpdate && image) {
        onUpdate({ 
          uuid: imageUuid, 
          viewCount: newViews 
        });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const fetchImage = async () => {
    try {
      const response = await axiosInstance.get(`images/${imageUuid}/`);
      const imageData = response.data;
      setImage(imageData);
      setComments(imageData.comments || []);
      setLikeCount(imageData.total_likes || 0);
      setViewCount(prev => Math.max(prev, imageData.total_views || 0));
      setLiked(imageData.is_liked || false);
      
      // Initialize edit fields
      setEditTitle(imageData.title || '');
      setEditDescription(imageData.description || '');

      const profileRes = await axiosInstance.get('profile/');
      setIsOwner(profileRes.data.user?.username === imageData.user);

      // Sync with parent immediately to reflect fresh data (e.g. from other users)
      if (onUpdate) {
        onUpdate({ 
          uuid: imageUuid, 
          viewCount: imageData.total_views,
          likeCount: imageData.total_likes,
          liked: imageData.is_liked
        });
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axiosInstance.post(`images/${imageUuid}/like/`);
      const newLikedState = response.data.liked !== undefined ? response.data.liked : !liked;
      setLiked(newLikedState);

      if (response.data.total_likes !== undefined) {
          setLikeCount(response.data.total_likes);
          if (onUpdate) {
            onUpdate({ 
              uuid: imageUuid, 
              likeCount: response.data.total_likes,
              liked: newLikedState
            });
          }
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
      const response = await axiosInstance.post(`images/${imageUuid}/comment/`, { body: commentText });
      setComments(prev => [...prev, response.data]);
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`images/${imageUuid}/`);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  const handleEditClick = () => {
    setEditTitle(image.title || '');
    setEditDescription(image.description || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(image.title || '');
    setEditDescription(image.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await axiosInstance.patch(`images/${imageUuid}/`, {
        title: editTitle,
        description: editDescription
      });
      
      setImage({ ...image, ...response.data });
      setIsEditing(false);
      // Optional: show success toast
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Failed to update image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white font-semibold">Loading image...</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={onClose}>
        <div className="bg-white border-4 border-black rounded-lg p-6 max-w-md mx-4">
          <p className="text-black font-semibold text-xl">Image not found</p>
          <button onClick={onClose} className="mt-4 bg-black text-yellow-400 px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-4 md:px-8 py-4" onClick={onClose}>
        <div className="w-full max-w-6xl mx-auto h-auto max-h-[90vh] flex" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white border-4 border-black rounded-lg shadow-2xl w-full relative flex flex-col md:flex-row overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black text-yellow-400 rounded-full p-2 hover:bg-gray-800 transition-colors border-2 border-black"
            >
              <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
            </button>

            {/* Main responsive layout */}
            <div className="flex flex-col md:flex-row w-full h-full">
              {/* Left: Image */}
              <div className="w-full md:w-2/3 flex items-center justify-center bg-gray-100 p-4">
                <img
                  src={getFullMediaUrl(image.image || image.url)}
                  alt={image.title}
                  className="max-width-full max-h-[40vh] md:max-h-full object-contain"
                />
              </div>

              {/* Right: All metadata and comments */}
              <div className="w-full md:w-1/3 flex flex-col p-6 overflow-y-auto bg-white border-l-0 md:border-l-4 border-black border-t-4 md:border-t-0">
                {/* Title and Actions */}
                <div className="mb-6">
                  {isEditing ? (
                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-1">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-2xl font-black"
                        placeholder="Image Title"
                      />
                    </div>
                  ) : (
                    <h1 className="text-3xl font-black text-black mb-4">{image.title || 'Untitled'}</h1>
                  )}
                  {/* Uploader Info */}
                  <div 
                    onClick={() => {
                      onClose();
                      navigate(`/users/${image.user}`);
                    }}
                    className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-lg border-2 border-black cursor-pointer hover:bg-yellow-400 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none w-fit"
                  >
                    {image.user_photo ? (
                      <img 
                        src={getFullMediaUrl(image.user_photo)} 
                        alt={image.user}
                        className="w-8 h-8 rounded-full border-2 border-black object-cover" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-black text-xs" />
                      </div>
                    )}
                    <span className="font-bold text-black text-sm uppercase tracking-tight">@{image.user}</span>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={handleLike}
                        disabled={isEditing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 border-black transition-colors ${
                          liked ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                        } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FontAwesomeIcon icon={faHeart} className={`w-5 h-5 ${liked ? 'text-white' : ''}`} />
                        <span>{likeCount}</span>
                      </button>

                      <div className="flex items-center gap-2 text-black font-semibold">
                        <FontAwesomeIcon icon={faComment} className="w-5 h-5" />
                        <span>{comments.length}</span>
                      </div>

                      <div className="flex items-center gap-2 text-black font-semibold">
                        <FontAwesomeIcon icon={faEye} className="w-5 h-5" />
                        <span>{viewCount} </span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold border-2 border-black hover:bg-green-600 transition-colors flex items-center gap-2"
                            >
                              {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                              )}
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="bg-gray-200 text-black px-4 py-2 rounded-lg font-bold border-2 border-black hover:bg-gray-300 transition-colors flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleEditClick}
                              className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold border-2 border-black hover:bg-yellow-500 transition-colors flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(true)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold border-2 border-black hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {isEditing ? (
                  <div className="mb-6">
                     <label className="block text-sm font-bold mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[100px]"
                      placeholder="Image Description"
                    />
                  </div>
                ) : (
                  image.description && (
                    <p className="text-black mb-6 whitespace-pre-line bg-gray-50 border-2 border-black rounded-lg p-4">
                      {image.description}
                    </p>
                  )
                )}

                {/* Comments Section */}
                <div className="flex-1 flex flex-col border-t-4 border-black pt-6">
                  <h3 className="text-2xl font-black text-black mb-4"> Comments</h3>

                  <div className="space-y-4 mb-6 flex-1">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 border-2 border-black rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {comment.user_photo ? (
                                <img 
                                  src={getFullMediaUrl(comment.user_photo)} 
                                  alt={comment.user}
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-black" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span 
                                  onClick={() => {
                                    onClose();
                                    navigate(`/users/${comment.user}`);
                                  }}
                                  className="font-bold text-black cursor-pointer hover:underline"
                                >
                                  @{comment.user}
                                </span>
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
                  <form onSubmit={handleComment} className="bg-yellow-400 border-2 border-black rounded-lg p-4 mt-auto">
                    <h4 className="text-xl font-bold text-black mb-3"> Add a comment</h4>
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
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center">
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

export default ImageModal;