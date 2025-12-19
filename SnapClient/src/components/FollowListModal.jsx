import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import userService from '../utils/userService';
import { getFullMediaUrl } from '../utils/axiosInstance';

const FollowListModal = ({ isOpen, onClose, username, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && username) {
      fetchUsers();
    }
  }, [isOpen, username, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data;
      if (type === 'followers') {
        data = await userService.getFollowers(username);
      } else {
        data = await userService.getFollowing(username);
      }
      setUsers(data || []);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b-4 border-black flex items-center justify-between bg-yellow-400">
          <h3 className="text-xl font-black text-black uppercase tracking-tight">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors border-2 border-black"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
              <p className="text-black font-bold uppercase text-xs">Loading...</p>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div 
                key={user.id}
                onClick={() => {
                  onClose();
                  navigate(`/users/${user.username}`);
                }}
                className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black rounded-lg hover:bg-yellow-100 transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
              >
                <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                  {user.profile?.photo ? (
                    <img 
                      src={getFullMediaUrl(user.profile.photo)} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="text-black text-xl" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-black text-black truncate">@{user.username}</span>
                  {(user.first_name || user.last_name) && (
                    <span className="text-xs text-gray-600 font-bold truncate">
                      {user.first_name} {user.last_name}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 font-bold uppercase italic">
                {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
