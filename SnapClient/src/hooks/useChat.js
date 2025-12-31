import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const useChat = (recipientId) => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isRecipientOnline, setIsRecipientOnline] = useState(false);
    const socketRef = useRef(null);

    // Fetch message history
    useEffect(() => {
        if (!recipientId) return;

        const fetchHistory = async () => {
            try {
                const response = await axiosInstance.get(`messages/${recipientId}/`);
                // Assume the response is a list of messages. We might need to map it if the structure differs.
                const history = response.data.results || response.data || [];
                setMessages(history.map(m => ({
                    ...m,
                    id: m.id,
                    message: m.content || m.message, 
                    sender_id: m.sender,
                    timestamp: m.timestamp,
                    reactions: []
                })));
            } catch (err) {
                console.error("Fetch message history error:", err);
            }
        };

        fetchHistory();
    }, [recipientId]);

    useEffect(() => {
        if (!recipientId) return;
        
        const token = localStorage.getItem('access');
        if (token) {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // If on localhost, use the django dev server port. Otherwise use the current host.
            const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
            const wsUrl = `${protocol}//${host}/ws/chat/${recipientId}/?token=${token}`;
            socketRef.current = new WebSocket(wsUrl);
            
            socketRef.current.onopen = () => {
                setIsConnected(true);
            };

            socketRef.current.onmessage = (event) => {
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
                    }
                } catch (err) {
                    // Critical errors can stay or be silent. User requested no logs.
                }
            };

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

    return { messages, sendMessage, sendReaction, isConnected, isRecipientOnline };
};

export default useChat;
