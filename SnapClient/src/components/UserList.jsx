import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus, UserCheck } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Navbar from './Navbar';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('users/');
      const usersData = response.data.results || response.data || [];
      setUsers(usersData);
      
      // Initialize following status from API response
      const status = {};
      usersData.forEach(user => {
        status[user.id] = user.is_following || false;
      });
      setFollowingStatus(status);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId, currentStatus) => {
    try {
      const response = await axiosInstance.post(`users/${userId}/follow/`);
      const newFollowingState = response.data.following !== undefined ? response.data.following : !currentStatus;
      
      setFollowingStatus(prev => ({
        ...prev,
        [userId]: newFollowingState
      }));
      
      // Update follower count from API response (most accurate)
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            followers_count: response.data.followers_count !== undefined 
              ? response.data.followers_count 
              : (newFollowingState ? user.followers_count + 1 : Math.max(0, user.followers_count - 1))
          };
        }
        return user;
      }));
    } catch (error) {
      console.error('Error following user:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
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
          <p className="text-black font-semibold">Loading users...</p>
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
            <User className="w-10 h-10" />
            Discover People
          </h1>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {users.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border-4 border-black rounded-lg shadow-lg p-6 text-center hover:scale-105 transition-transform duration-300"
                >
                  <div
                    onClick={() => navigate(`/users/${user.username}`)}
                    className="cursor-pointer"
                  >
                    {user.profile?.photo ? (
                      <img
                        src={user.profile.photo}
                        alt={user.username}
                        className="w-24 h-24 rounded-full border-4 border-black object-cover mx-auto mb-4"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-black flex items-center justify-center mx-auto mb-4">
                        <User className="w-12 h-12 text-black" />
                      </div>
                    )}
                    <h6 className="text-lg font-black text-black mb-1">
                      {user.first_name || user.username}
                    </h6>
                    <p className="text-sm text-gray-600 mb-4">@{user.username}</p>
                  </div>
                  
                  <div className="mb-4 space-y-1">
                    <div className="text-sm text-black">
                      <span className="font-bold">{user.followers_count || 0}</span> followers
                    </div>
                    <div className="text-sm text-black">
                      <span className="font-bold">0</span> posts
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleFollow(user.id, followingStatus[user.id])}
                    className={`w-full px-4 py-2 rounded-lg font-bold border-2 border-black transition-colors flex items-center justify-center gap-2 ${
                      followingStatus[user.id]
                        ? 'bg-gray-200 text-black hover:bg-gray-300'
                        : 'bg-black text-yellow-400 hover:bg-gray-800'
                    }`}
                  >
                    {followingStatus[user.id] ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border-4 border-black">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h5 className="text-xl font-bold text-black mb-2">No users found</h5>
              <p className="text-gray-600">Be the first to join!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserList;

