import React, { useState, useEffect } from 'react';
import axiosInstance, { getFullMediaUrl } from '../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCommentDots, faUser } from '@fortawesome/free-solid-svg-icons';
import ChatBox from './ChatBox';
import Navbar from './Navbar';

const Messenger = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, usersRes] = await Promise.all([
                axiosInstance.get('profile/'),
                axiosInstance.get('users/')
            ]);
            setCurrentUser(profileRes.data.user);
            setUsers(usersRes.data.results || usersRes.data || []);
        } catch (error) {
            console.error('Error fetching messenger data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.username !== currentUser?.username && 
        (u.username.toLowerCase().includes(search.toLowerCase()) || 
         (u.first_name && u.first_name.toLowerCase().includes(search.toLowerCase())))
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <div className="flex-1 flex max-w-6xl mx-auto w-full border-x bg-white overflow-hidden my-4 rounded-xl shadow-2xl">
                {/* Sidebar */}
                <div className="w-1/3 border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold text-black mb-4">Messages</h2>
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search people..." 
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <div 
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUser?.id === user.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                                >
                                    <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-yellow-400 flex-shrink-0">
                                        {user.profile?.photo ? (
                                            <img src={getFullMediaUrl(user.profile.photo)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-black truncate">{user.first_name || user.username}</p>
                                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <p>No users found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedUser ? (
                        <div className="flex-1 flex flex-col h-full"> 
                            <ChatBox 
                                otherUser={{
                                    id: selectedUser.id,
                                    username: selectedUser.username,
                                    photo: getFullMediaUrl(selectedUser.profile?.photo)
                                }} 
                                currentUserId={currentUser?.id}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                            <div className="w-20 h-20 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center mb-4">
                                <FontAwesomeIcon icon={faCommentDots} className="text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-600">Your Messages</h3>
                            <p className="mt-2 max-w-xs">Select a user from the sidebar to start a conversation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messenger;
