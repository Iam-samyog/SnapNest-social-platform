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
        sendTypingStatus(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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

    const toggleReactionMenu = (msgId) => {
        setActiveReactionMessageId(prev => prev === msgId ? null : msgId);
    };

    const addEmoji = (emoji) => {
        setMessageInput(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* Chat Header (Original Yellow/Black) */}
            <div className="px-6 py-4 bg-yellow-400 border-b-4 border-black flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden text-black mr-2 hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                        </button>
                    )}
                    <div 
                        onClick={() => navigate(`/users/${otherUser.username}`)}
                        className="flex items-center gap-4 cursor-pointer group"
                    >
                        <div className="relative group-hover:scale-105 transition-transform">
                            <UserAvatar user={otherUser} className="w-11 h-11 border-2 border-black" />
                            {isRecipientOnline && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full animate-pulse" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-[17px] font-black text-black tracking-tight leading-none group-hover:underline decoration-2">
                                {otherUser.username}
                            </h2>
                            {isTyping && (
                                <span className="text-[10px] font-black uppercase text-black/60 italic">typing...</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Messages Area (Original Bubble Style) */}
            <div ref={messagesAreaRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-white">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <UserAvatar user={otherUser} className="w-20 h-20 mb-4 border-2 border-black" />
                        <h3 className="font-exrabold text-lg text-black">{otherUser.username}</h3>
                        <p className="text-gray-500 font-bold text-sm tracking-tight text-center">SnapNest • Forever Free Messaging</p>
                    </div>
                )}
                
                {messages.map((msg, i) => {
                    const isMe = Number(msg.sender_id) === Number(currentUserId);
                    const prevMsg = messages[i - 1];
                    const isFirstInGroup = !prevMsg || Number(prevMsg.sender_id) !== Number(msg.sender_id);
                    const isMenuOpen = activeReactionMessageId === msg.id;

                    return (
                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}>
                            {isFirstInGroup && (
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-40 ${isMe ? 'mr-3' : 'ml-3'}`}>
                                    {isMe ? 'You' : (msg.sender_username || otherUser.username)}
                                </span>
                            )}
                            <div className="relative flex items-end gap-2">
                                {/* Reaction Popover */}
                                {isMenuOpen && (
                                    <div className={`
                                        absolute bottom-full mb-1 ${isMe ? 'right-0' : 'left-0'} 
                                        flex bg-white border-2 border-black rounded-full p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20 gap-1
                                    `}>
                                        {commonEmojis.slice(0, 6).map(emoji => (
                                            <button 
                                                key={emoji}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    sendReaction(msg.id, emoji);
                                                    setActiveReactionMessageId(null);
                                                }}
                                                className="hover:scale-125 transition-transform p-1 text-sm"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div 
                                    onClick={() => toggleReactionMenu(msg.id)}
                                    className={`
                                        cursor-pointer relative max-w-[100%] min-w-[120px] px-4 py-2 text-[14px] leading-snug break-words border-2 border-black transition-transform active:scale-[0.98] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                        ${isMe 
                                            ? 'bg-yellow-400 text-black rounded-2xl rounded-tr-none' 
                                            : 'bg-white text-black rounded-2xl rounded-tl-none'
                                        }
                                    `}
                                >
                                    <div className="relative z-10">{msg.message}</div>
                                    <div className="text-[9px] font-black uppercase tracking-tighter mt-1 opacity-50 flex justify-end">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} className="pb-2" />
            </div>

            {/* Input Bar (Original Yellow/Black) */}
            <div className="p-4 bg-yellow-400 border-t-4 border-black relative">
                {showEmojiPicker && (
                    <div ref={emojiBarRef} className="absolute bottom-[100%] left-4 mb-2 bg-white border-4 border-black p-2 flex gap-3 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] rounded-xl z-30">
                        {commonEmojis.map(emoji => (
                            <button 
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
                                className="text-xl hover:scale-125 transition-transform"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="bg-white border-2 border-black rounded-full flex items-center px-4 py-1 gap-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-black hover:scale-110 transition-transform"
                    >
                        <FontAwesomeIcon icon={faSmile} className="text-xl" />
                    </button>
                    <input 
                        type="text" 
                        value={messageInput} 
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent py-3 focus:outline-none text-[16px] font-bold text-black placeholder-gray-500"
                    />
                    {messageInput.trim() && (
                        <button 
                            onClick={handleSend} 
                            className="bg-black text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all active:scale-95 border-2 border-black"
                        >
                            Send
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBox;