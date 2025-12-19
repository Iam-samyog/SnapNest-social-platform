import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faTrash, faEdit, faTimes, faUser, faEye, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import axiosInstance, { API_BASE_URL, getFullMediaUrl } from '../utils/axiosInstance';

const ImageModal = ({ imageId, isOpen, onClose }) => {
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

  useEffect(() => {
    if (isOpen && imageId) {
      fetchImage();
      // Reset edit state when opening a new image
      setIsEditing(false);
    }
  }, [isOpen, imageId]);

  const fetchImage = async () => {
    try {
      const response = await axiosInstance.get(`images/${imageId}/`);
      const imageData = response.data;
      setImage(imageData);
      setComments(imageData.comments || []);
      setLikeCount(imageData.total_likes || 0);
      setViewCount(imageData.total_views || 0);
      setLiked(imageData.is_liked || false);
      
      // Initialize edit fields
      setEditTitle(imageData.title || '');
      setEditDescription(imageData.description || '');

      const profileRes = await axiosInstance.get('profile/');
      setIsOwner(profileRes.data.user?.username === imageData.user);
    } catch (error) {
      console.error('Error fetching image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axiosInstance.post(`images/${imageId}/like/`);
      const newLikedState = response.data.liked !== undefined ? response.data.liked : !liked;
      setLiked(newLikedState);

      const imageRes = await axiosInstance.get(`images/${imageId}/`);
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
      const response = await axiosInstance.post(`images/${imageId}/comment/`, { body: commentText });
      setComments(prev => [...prev, response.data]);
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`images/${imageId}/`);
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
      const response = await axiosInstance.patch(`images/${imageId}/`, {
        title: editTitle,
        description: editDescription
      });
      
      setImage({ ...image, ...response.data });
      setIsEditing(false);
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
                      <label className="block text-sm font-bold mb-1 uppercase tracking-tighter">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-2xl font-black"
                        placeholder="Image Title"
                      />
                    </div>
                  ) : (
                    <h1 className="text-3xl font-black text-black mb-4 uppercase">{image.title || 'Untitled'}</h1>
                  )}

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleLike}
                        disabled={isEditing}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold border-2 border-black transition-colors ${
                          liked ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                        } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
                        <span>{likeCount}</span>
                      </button>

                      <div className="flex items-center gap-2 text-black font-bold text-sm uppercase">
                        <FontAwesomeIcon icon={faComment} className="w-4 h-4" />
                        <span>{comments.length}</span>
                      </div>

                      <div className="flex items-center gap-2 text-black font-bold text-sm uppercase">
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                        <span>{viewCount}</span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="bg-black text-yellow-400 px-3 py-2 rounded-lg font-bold border-2 border-black hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm uppercase"
                            >
                              {isSaving ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400"></div>
                              ) : (
                                <FontAwesomeIcon icon={faSave} />
                              )}
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="bg-gray-200 text-black px-3 py-2 rounded-lg font-bold border-2 border-black hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm uppercase"
                            >
                              <FontAwesomeIcon icon={faTimesCircle} />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleEditClick}
                              className="bg-yellow-400 text-black px-3 py-2 rounded-lg font-bold border-2 border-black hover:bg-yellow-500 transition-colors flex items-center gap-2 text-sm uppercase"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(true)}
                              className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold border-2 border-black hover:bg-red-600 transition-colors flex items-center gap-2 text-sm uppercase"
                            >
                              <FontAwesomeIcon icon={faTrash} />
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
                     <label className="block text-sm font-bold mb-1 uppercase tracking-tighter">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[100px]"
                      placeholder="Image Description"
                    />
                  </div>
                ) : (
                  image.description && (
                    <p className="text-black mb-6 whitespace-pre-line bg-gray-50 border-2 border-black rounded-lg p-4 font-medium leading-relaxed">
                      {image.description}
                    </p>
                  )
                )}

                {/* Comments Section */}
                <div className="flex-1 flex flex-col border-t-2 border-black pt-6">
                  <h3 className="text-xl font-black text-black mb-4 uppercase italic">💬 Comments ({comments.length})</h3>

                  <div className="space-y-4 mb-6 flex-1">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 border-2 border-black rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                               {comment.user_photo ? (
                                  <img 
                                    src={getFullMediaUrl(comment.user_photo)} 
                                    alt={comment.user}
                                    className="w-10 h-10 rounded-full border-2 border-black bg-white object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                  />
                               ) : (
                                  <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-black" />
                                  </div>
                               )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-black text-sm">@{comment.user}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  {new Date(comment.created).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-800">{comment.body}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-black">
                        <p className="text-gray-600 font-bold text-sm uppercase italic">No comments yet</p>
                      </div>
                    )}
                  </div>

                  {/* Comment Form */}
                  <form onSubmit={handleComment} className="bg-yellow-400 border-2 border-black rounded-lg p-4 mt-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-sm font-black text-black mb-3 uppercase italic">✍️ Add a comment</h4>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your comment here..."
                      className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-3 text-sm font-medium"
                      rows="2"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="w-full bg-black text-yellow-400 py-2 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:translate-y-1 active:shadow-none disabled:opacity-50"
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
          <div className="bg-white border-4 border-black rounded-lg p-6 max-w-md mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-black text-black mb-4 uppercase">Confirm Delete</h3>
            <p className="text-black mb-6 font-medium">
              Are you sure you want to permanently delete <strong>{image.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-black border-2 border-black hover:bg-red-600 transition-all active:translate-y-1 flex-1 uppercase text-sm"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 text-black px-6 py-2 rounded-lg font-black border-2 border-black hover:bg-gray-300 transition-all active:translate-y-1 flex-1 uppercase text-sm"
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