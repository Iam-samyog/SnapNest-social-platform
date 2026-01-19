import { useEffect, useRef, useState } from 'react';
import axiosInstance, { API_BASE_URL } from '../utils/axiosInstance';

const useChat = (recipientId) => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isRecipientOnline, setIsRecipientOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // ... (previous useEffect for history)

    useEffect(() => {
        if (!recipientId) return;
        
        const token = localStorage.getItem('access');
        if (token) {
            // Determine WebSocket URL from API_BASE_URL
            const isLocal = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
            const protocol = isLocal ? 'ws:' : 'wss:';
            // Extract host from API_BASE_URL (remove protocol)
            const host = API_BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
            const wsUrl = `${protocol}//${host}/ws/chat/${recipientId}/?token=${token}`;
            
            socketRef.current = new WebSocket(wsUrl);
            
            socketRef.current.onopen = () => {
                setIsConnected(true);
            };

            const handleMessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'chat_message') {
                        setMessages((prev) => [...prev, {
                            ...data,
                            id: data.id,
                            message: data.message || data.content,
                            sender_id: data.sender_id,
                            sender_username: data.sender_username,
                            reactions: []
                        }]);
                    } else if (data.type === 'chat_reaction') {
                        setMessages((prev) => prev.map(msg => {
                            if (msg.id === data.message_id) {
                                const currentReactions = msg.reactions || [];
                                const otherReactions = currentReactions.filter(r => Number(r.sender_id) !== Number(data.sender_id));
                                
                                if (!data.emoji) {
                                    return { ...msg, reactions: otherReactions };
                                }

                                return {
                                    ...msg,
                                    reactions: [...otherReactions, { emoji: data.emoji, sender_id: data.sender_id }]
                                };
                            }
                            return msg;
                        }));
                    } else if (data.type === 'user_status') {
                        if (data.user_id === parseInt(recipientId)) {
                            setIsRecipientOnline(data.status === 'online');
                        }
                    } else if (data.type === 'typing') {
                        if (data.user_id === parseInt(recipientId)) {
                            setIsTyping(data.is_typing);
                        }
                    }
                } catch (err) {
                    // Critical errors can stay or be silent. User requested no logs.
                }
            };

            socketRef.current.addEventListener('message', handleMessage);

            socketRef.current.onclose = () => {
                setIsConnected(false);
            };

            socketRef.current.onerror = () => {
                // Silently handle error
            };
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [recipientId]);

    const sendMessage = (message) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'chat_message', message }));
        }
    };

    const sendReaction = (messageId, emoji) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ 
                type: 'message_reaction', 
                message_id: messageId, 
                emoji 
            }));
        }
    };

    const sendTypingStatus = (typing) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ 
                type: 'typing', 
                is_typing: typing 
            }));
        }
    };

    return { 
        messages, 
        sendMessage, 
        sendReaction, 
        sendTypingStatus,
        isConnected, 
        isRecipientOnline, 
        isTyping,
        socket: socketRef.current 
    };
};

export default useChat;
