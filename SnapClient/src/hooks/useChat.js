import { useEffect, useRef, useState } from 'react';
const useChat = (recipientId) => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    useEffect(() => {
        if (!recipientId) return;
        
        // Get the JWT token from storage
        const token = localStorage.getItem('access_token');
        const wsUrl = `ws://localhost:8000/ws/chat/${recipientId}/?token=${token}`;
        
        socketRef.current = new WebSocket(wsUrl);
        socketRef.current.onopen = () => {
            setIsConnected(true);
            console.log('Successfully connected to WebSocket');
        };
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };
        socketRef.current.onclose = (event) => {
            setIsConnected(false);
            console.log('WebSocket closed:', event);
        };
        socketRef.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
        return () => {
            if (socketRef.current) socketRef.current.close();
        };
    }, [recipientId]);
    const sendMessage = (message) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ message }));
        }
    };
    return { messages, sendMessage, isConnected };
};
export default useChat;
