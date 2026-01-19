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
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

const ChatBox = ({ otherUser, currentUserId, currentUserUsername, onBack, autoAnswerSignal }) => {
    const navigate = useNavigate();
    const { messages, loading, sendMessage, sendReaction, socket } = useChat(otherUser?.id, currentUserId);
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeReactionMessageId, setActiveReactionMessageId] = useState(null);
    
    // Call State
    const [isCalling, setIsCalling] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [callData, setCallData] = useState(null);
    
    // Handle Auto-Answer signal from global notification
    useEffect(() => {
        if (autoAnswerSignal) {
            setCallData({
                from: otherUser.id,
                signalData: autoAnswerSignal
            });
            setIsCalling(true);
            setIsIncomingCall(false);
        }
    }, [autoAnswerSignal, otherUser.id]);
    const [callAccepted, setCallAccepted] = useState(false);
    
    const scrollRef = useRef();
    const emojiBarRef = useRef();
    const messagesAreaRef = useRef();

    const commonEmojis = ['❤️', '😂', '🔥', '😮', '😢', '👍', '🙏', '💯'];

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close emoji picker and reaction menus on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiBarRef.current && !emojiBarRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (!event.target.closest('.reaction-trigger') && !event.target.closest('.reaction-bar')) {
                setActiveReactionMessageId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Listen for call signals
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'call_user') {
                setIsIncomingCall(true);
                setCallData(data);
            } else if (data.type === 'end_call') {
                setIsIncomingCall(false);
                setIsCalling(false);
                setCallData(null);
            }
        };

        // We attach a secondary listener. 
        // Note: Ideally useChat should handle this or allow registering listeners.
        // For now, we are relying on the fact that WebSocket allows multiple event listeners 
        // via addEventListener, but useChat uses onmessage assignment.
        // We really should hack useChat to not overwrite onmessage or we accept that useChat owns onmessage.
        // Actually, since useChat uses `socket.onmessage = ...`, it overwrites.
        // We need to patch useChat or handle signals inside useChat.
        // WAIT: Previous step exposed socket. If we assign socket.onmessage here, we break useChat.
        // FIX: Let's assume for this specific task we modify the listener in useChat to dispatch CustomEvents
        // OR we patch the existing onmessage handler.
        
        // Better approach for this constraint:
        // We'll trust that useChat processes chat messages and we only care about signals which useChat likely ignores/logs error for.
        // Actually useChat logs "Critical errors" if it can't parse text as chat message? No, it checks data.type.
        // Currently useChat ignores unknown types.
        
        // Let's attach an event listener to the socket OBJECT if it supports it? 
        // standard WebSocket supports addEventListener.
        socket.addEventListener('message', handleMessage);

        return () => {
             socket.removeEventListener('message', handleMessage);
        };
    }, [socket]);

    const toggleReactionMenu = (msgId) => {
        setActiveReactionMessageId(prev => prev === msgId ? null : msgId);
    };

    const handleSend = () => {
        if (messageInput.trim()) {
            sendMessage(messageInput);
            setMessageInput('');
        }
    };

    const addEmoji = (emoji) => {
        setMessageInput(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Chat Header */}
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
                            <UserAvatar user={otherUser} className="w-11 h-11" />
                        </div>
                        <div>
                            <h2 className="text-[17px] font-black text-black tracking-tight leading-none group-hover:underline decoration-2">
                                {otherUser.username}
                            </h2>
                        </div>
                    </div>
                </div>
                {/* <div className="flex items-center gap-6 text-black">
                     <button 
                        onClick={() => setIsCalling(true)}
                        className="hover:scale-110 transition-transform"
                        title="Start Video Call"
                    >
                        <FontAwesomeIcon icon={faVideo} className="text-xl sm:text-2xl" />
                    </button>
                    <button 
                         onClick={() => setIsCalling(true)}
                         className="hover:scale-110 transition-transform"
                         title="Start Audio Call"
                    >
                        <FontAwesomeIcon icon={faPhone} className="text-lg sm:text-xl" />
                    </button>
                </div> */}
            </div>
            
            {/* Messages Area */}
            <div ref={messagesAreaRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-white">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <UserAvatar user={otherUser} className="w-20 h-20 mb-4" />
                        <h3 className="font-bold text-lg">{otherUser.username}</h3>
                        <p className="text-gray-500 text-sm">SnapNest • Social Platform</p>
                        <button 
                            onClick={() => navigate(`/users/${otherUser.username}`)}
                            className="mt-4 bg-black text-white font-bold text-sm px-6 py-2 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black transition-all active:scale-95 uppercase tracking-widest"
                        >
                            View Profile
                        </button>
                    </div>
                )}
                
                {messages.map((msg, i) => {
                    const isMe = Number(msg.sender_id) === Number(currentUserId);
                    const prevMsg = messages[i - 1];
                    const nextMsg = messages[i + 1];
                    const isFirstInGroup = !prevMsg || Number(prevMsg.sender_id) !== Number(msg.sender_id);
                    const isLastInGroup = !nextMsg || Number(nextMsg.sender_id) !== Number(msg.sender_id);
                    const isMenuOpen = activeReactionMessageId === msg.id;

                    return (
                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}>
                            {isFirstInGroup && (
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-40 ${isMe ? 'mr-3' : 'ml-3'}`}>
                                    {isMe ? 'You' : (msg.sender_username || otherUser.username)}
                                </span>
                            )}
                            <div className="relative flex items-end gap-2">
                                {/* Reaction Popover on Click */}
                                {isMenuOpen && (
                                    <div className={`
                                        absolute bottom-full mb-1 ${isMe ? 'right-0' : 'left-0'} 
                                        flex bg-white border-2 border-black rounded-full p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20 gap-1
                                        reaction-bar
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
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        sendReaction(msg.id, null);
                                        setActiveReactionMessageId(null);
                                    }}
                                    className={`
                                        reaction-trigger cursor-pointer relative max-w-[100%] min-w-[120px] px-4 py-2 text-[14px] leading-snug break-words border-2 border-black transition-transform active:scale-[0.98]
                                        ${isMe 
                                            ? 'bg-yellow-400 text-black rounded-2xl rounded-tr-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                                            : 'bg-white text-black rounded-2xl rounded-tl-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                        }
                                    `}
                                >
                                    {/* Tiny Bubble Tail */}
                                    <div className={`absolute top-[-2px] ${isMe ? 'right-[-8px]' : 'left-[-8px]'} w-0 h-0 border-t-[8px] border-t-black ${isMe ? 'border-r-[8px] border-r-transparent' : 'border-l-[8px] border-l-transparent'}`}></div>
                                    
                                    <div className="relative z-10">{msg.message}</div>
                                    
                                    {msg.timestamp && (
                                        <div className="text-[9px] font-black uppercase tracking-tighter mt-1 opacity-50 flex justify-end">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}

                                    {/* Display Reactions */}
                                    {msg.reactions && msg.reactions.length > 0 && (
                                        <div className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} flex gap-0.5`}>
                                            {msg.reactions.map((r, idx) => (
                                                <div key={idx} className="bg-white border border-black rounded-full px-1 text-[10px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                                    {r.emoji}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} className="pb-2" />
            </div>

            {/* Input Bar */}
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
                
               <div className="bg-white border-2 border-black rounded-full flex items-center px-2 sm:px-4 py-1 gap-1 sm:gap-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all w-full max-w-full">
    <button 
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-gray-500 hover:text-black transition-colors flex-shrink-0"
    >
        <FontAwesomeIcon icon={faSmile} className="text-lg sm:text-xl" />
    </button>
    <input 
        type="text" 
        value={messageInput} 
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
        className="flex-1 bg-transparent py-2 sm:py-3 focus:outline-none text-[15px] sm:text-[16px] font-bold text-black placeholder-gray-500 min-w-0"
    />
    {messageInput.trim() && (
        <button 
            onClick={handleSend} 
            className="bg-white text-black px-3 sm:px-6 py-2 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95 border-2 border-black flex-shrink-0"
        >
            Send
        </button>
    )}
</div>
            </div>

            
            {/* Call State Management */}
            
            {/* 1. Active Call Interface (Either started by me or accepted by me) */}
            {isCalling && (
                <div className="absolute top-0 left-0 w-full h-full z-50">
                    <CallInterface 
                        isInitiator={!callData} 
                        currentUser={{ id: currentUserId, username: currentUserUsername }}
                        otherUser={otherUser}
                        socket={socket}
                        incomingCallSignal={callData?.signalData}
                        autoAccept={!!autoAnswerSignal}
                        onClose={() => {
                            setIsCalling(false);
                            setIsIncomingCall(false);
                            setCallData(null);
                        }}
                    />
                </div>
            )}

            {/* 2. Incoming Call Modal (Pending, not yet accepted/rejected) */}
            {isIncomingCall && !isCalling && (
                <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-end md:items-center justify-center p-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                     <div className="bg-zinc-900 border border-white/10 p-6 rounded-[32px] max-w-sm w-full text-center shadow-2xl shadow-black/50 overflow-hidden relative group">
                        {/* Background Pulse Effect */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
                        
                        <div className="w-24 h-24 mx-auto mb-6 relative">
                            <div className="w-full h-full rounded-3xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner animate-in zoom-in duration-500">
                                <UserAvatar user={otherUser} className="w-full h-full" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-950 rounded-full flex items-center justify-center border-2 border-zinc-800">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-zinc-400 text-sm font-medium tracking-widest uppercase mb-1">Incoming Video Call</h3>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{otherUser.username}</h2>
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    setIsIncomingCall(false);
                                    setCallData(null);
                                    if(socket?.readyState === WebSocket.OPEN) {
                                        socket.send(JSON.stringify({ type: 'end_call', to: otherUser.id }));
                                    }
                                }}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-4 rounded-2xl font-semibold transition-all active:scale-95 border border-white/5"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={() => {
                                    setIsCalling(true);
                                    setIsIncomingCall(false);
                                }}
                                className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-white/5 flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faVideo} size="sm" />
                                <span>Answer</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBox;