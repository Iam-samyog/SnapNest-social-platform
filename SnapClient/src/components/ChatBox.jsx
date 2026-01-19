import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useChat from '../hooks/useChat';
import UserAvatar from './UserAvatar';
import CallInterface from './CallInterface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPhone, 
    faVideo, 
    faInfoCircle, 
    faImage, 
    faHeart, 
    faSmile,
    faChevronLeft,
    faArrowLeft,
    faCircle
} from '@fortawesome/free-solid-svg-icons';

const ChatBox = ({ otherUser, currentUserId, currentUserUsername, onBack, autoAnswerSignal }) => {
    const navigate = useNavigate();
    const { 
        messages, 
        sendMessage, 
        sendReaction, 
        sendTypingStatus, 
        isConnected, 
        isRecipientOnline, 
        isTyping, 
        socket 
    } = useChat(otherUser?.id, currentUserId);
    
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeReactionMessageId, setActiveReactionMessageId] = useState(null);
    const typingTimeoutRef = useRef(null);
    
    // Call State
    const [isCalling, setIsCalling] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [callData, setCallData] = useState(null);
    
    const scrollRef = useRef();
    const emojiBarRef = useRef();
    const messagesAreaRef = useRef();

    const commonEmojis = ['❤️', '😂', '🔥', '😮', '😢', '👍', '🙏', '💯'];

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Typing Indicator Logic
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        
        // Send typing=true
        sendTypingStatus(true);

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set timeout to send typing=false after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(false);
        }, 2000);
    };

    const handleSend = () => {
        if (messageInput.trim()) {
            sendMessage(messageInput);
            setMessageInput('');
            sendTypingStatus(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white font-sans overflow-hidden">
            {/* Premium Chat Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden text-black p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                    )}
                    <div 
                        onClick={() => navigate(`/users/${otherUser.username}`)}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="relative">
                            <UserAvatar user={otherUser} className="w-10 h-10 border border-gray-100 shadow-sm" />
                            {isRecipientOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" title="Online" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[15px] text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                {otherUser.username}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium tracking-wide">
                                {isRecipientOnline ? 'Active now' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    <button className="p-2.5 text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
                        <FontAwesomeIcon icon={faPhone} className="text-lg" />
                    </button>
                    <button className="p-2.5 text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
                        <FontAwesomeIcon icon={faVideo} className="text-lg" />
                    </button>
                    <button className="p-2.5 text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-lg" />
                    </button>
                </div>
            </div>
            
            {/* Message Thread Area */}
            <div className="flex-1 overflow-y-auto px-4 py-8 space-y-4 bg-white scrollbar-hide">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="relative group mb-4">
                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <UserAvatar user={otherUser} className="w-24 h-24 relative border-4 border-white shadow-xl" />
                        </div>
                        <h3 className="font-extrabold text-xl text-gray-900 mb-1">{otherUser.username}</h3>
                        <p className="text-gray-400 text-sm mb-6">You're starting a conversation</p>
                        <button 
                            onClick={() => navigate(`/users/${otherUser.username}`)}
                            className="bg-gray-50 text-gray-900 font-bold text-xs px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all active:scale-95 uppercase tracking-widest shadow-sm"
                        >
                            View Profile
                        </button>
                    </div>
                )}
                
                {messages.map((msg, i) => {
                    const isMe = Number(msg.sender_id) === Number(currentUserId);
                    const prevMsg = messages[i - 1];
                    const isFirstInGroup = !prevMsg || Number(prevMsg.sender_id) !== Number(msg.sender_id);

                    return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="group relative flex items-center gap-2">
                                    <div 
                                        className={`
                                            px-4 py-2.5 text-[14.5px] leading-relaxed shadow-sm
                                            ${isMe 
                                                ? 'bg-blue-600 text-white rounded-[22px] rounded-tr-none' 
                                                : 'bg-gray-100 text-gray-900 rounded-[22px] rounded-tl-none'
                                            }
                                        `}
                                    >
                                        {msg.message}
                                    </div>
                                    
                                    {/* Action buttons on hover (premium touch) */}
                                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                                        <button className="text-gray-400 hover:text-gray-600 p-1"><FontAwesomeIcon icon={faSmile} size="xs" /></button>
                                    </div>
                                </div>
                                {isFirstInGroup && (
                                    <span className="text-[10px] text-gray-400 font-semibold mt-1 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator Bubble */}
                {isTyping && (
                    <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-gray-100 px-4 py-3 rounded-[22px] rounded-tl-none flex gap-1 items-center shadow-sm">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}
                
                <div ref={scrollRef} />
            </div>

            {/* Premium Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-3xl px-4 py-1.5 shadow-inner focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <button className="text-gray-500 hover:text-blue-600 p-2"><FontAwesomeIcon icon={faSmile} /></button>
                    <input 
                        type="text" 
                        value={messageInput} 
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message..."
                        className="flex-1 bg-transparent py-2.5 focus:outline-none text-[15px] text-gray-900 placeholder-gray-400 font-medium"
                    />
                    <div className="flex items-center gap-1">
                        {!messageInput.trim() ? (
                            <>
                                <button className="text-gray-500 hover:text-gray-700 p-2"><FontAwesomeIcon icon={faImage} /></button>
                                <button className="text-gray-500 hover:text-red-500 p-2"><FontAwesomeIcon icon={faHeart} /></button>
                            </>
                        ) : (
                            <button 
                                onClick={handleSend}
                                className="text-blue-600 font-bold px-4 py-2 hover:scale-105 transition-transform"
                            >
                                Send
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;