import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance, { getFullMediaUrl } from '../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCommentDots, faUser } from '@fortawesome/free-solid-svg-icons';
import ChatBox from './ChatBox';
import Navbar from './Navbar';
import UserAvatar from './UserAvatar';

const Messenger = () => {
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(location.state?.selectedUser || null);
    const [autoAnswerSignal, setAutoAnswerSignal] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserUsername, setCurrentUserUsername] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Using 'users/' as confirmed working in UserList.jsx
                const response = await axiosInstance.get('users/');
                const data = response.data.results || response.data || [];
                
                const token = localStorage.getItem('access');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setCurrentUserId(payload.user_id);
                    setCurrentUserUsername(payload.username || payload.name || 'You'); // Fallback if username not in payload
                    setUsers(data.filter(u => u.id !== payload.user_id));

                    // Check for preselected user from notification redirect
                    if (location.state?.preselectedUserId) {
                        const targetUser = data.find(u => u.id === parseInt(location.state.preselectedUserId));
                        if (targetUser) {
                            setSelectedUser(targetUser);
                            if (location.state.autoAnswerSignal) {
                                setAutoAnswerSignal(location.state.autoAnswerSignal);
                            }
                        }
                    }
                } else {
                    setUsers(data);
                }
            } catch (err) {
                console.error("Fetch users error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [location.state]);

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    const handleBack = () => setSelectedUser(null);

    const getOtherUserPhoto = (user) => {
        return user.profile?.photo ? getFullMediaUrl(user.profile.photo) : null;
    };

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-white">
            <Navbar />
            <div className="flex flex-1 w-full bg-white overflow-hidden border-t border-gray-100">
                {/* Sidebar - Hidden on mobile if user selected */}
                <div className={`
                    ${selectedUser ? 'hidden md:flex' : 'flex'} 
                    w-full md:w-[350px] lg:w-[400px] flex-col border-r-4 border-black bg-white
                `}>
                    <div className="p-4 md:p-6 sticky top-0 bg-yellow-400 z-10 border-b-4 border-black">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-black tracking-tighter text-black flex items-center gap-2 uppercase">
                                 Messages
                            </h1>
                            
                        </div>
                        <div className="relative group">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-black transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search friends"
                                className="w-full bg-white border-2 border-black py-3 pl-11 pr-4 rounded-xl focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm font-bold text-black"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredUsers.map(user => (
                            <div 
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className={`
                                    flex items-center gap-4 px-6 py-4 cursor-pointer transition-all duration-200 border-b-2 border-gray-100
                                    ${selectedUser?.id === user.id 
                                        ? 'bg-yellow-50 border-r-8 border-black shadow-inner' 
                                        : 'hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="relative">
                                    <UserAvatar 
                                        user={{
                                            ...user,
                                            photo: getOtherUserPhoto(user)
                                        }} 
                                        className="w-14 h-14"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[15px] font-black truncate ${selectedUser?.id === user.id ? 'text-black' : 'text-gray-900'}`}>
                                        {user.username}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-10 px-4">
                                <p className="text-gray-400 text-sm italic font-medium">No conversations found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area - Hidden on mobile if no user selected */}
                <div className={`
                    ${!selectedUser ? 'hidden md:flex' : 'flex'} 
                    flex-1 flex-col bg-white overflow-hidden relative
                `}>
                    {selectedUser ? (
                        <ChatBox 
                            otherUser={{
                                ...selectedUser,
                                photo: getOtherUserPhoto(selectedUser)
                            }} 
                            currentUserId={currentUserId}
                            currentUserUsername={currentUserUsername}
                            onBack={handleBack}
                            autoAnswerSignal={autoAnswerSignal}
                        />
                    ) : (
                        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-6 border border-gray-100">
                                 <FontAwesomeIcon icon={faSearch} className="text-4xl text-black" />
                            </div>
                            <h2 className="text-2xl font-bold text-black mb-2">Select a Message</h2>
                            <p className="text-gray-500 max-w-sm text-sm">
                                Choose a conversation or search for a friend to start chatting in real-time.
                            </p>
                            <button 
                                className="mt-8 bg-black hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-100 uppercase text-xs tracking-widest"
                                onClick={() => document.querySelector('input')?.focus()}
                            >
                                Find People
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messenger;
