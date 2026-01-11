import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faPhone } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../utils/axiosInstance';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [incomingCall, setIncomingCall] = useState(null);
    const [socket, setSocket] = useState(null);
    const [callerInfo, setCallerInfo] = useState(null);
    const navigate = useNavigate();
    const audioRef = useRef(new Audio('/assets/ringtone.mp3')); // You might need a ringtone

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) return;

        const isLocal = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
        const protocol = isLocal ? 'ws:' : 'wss:';
        const host = API_BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const wsUrl = `${protocol}//${host}/ws/notify/?token=${token}`;

        let ws;
        let reconnectTimer;

        const connect = () => {
            console.log('Connecting to Notification WS:', wsUrl);
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ Notification WebSocket Connected');
            };

            ws.onmessage = async (event) => {
                console.log('📩 Notification Received:', event.data);
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'incoming_call') {
                        console.log('📞 Incoming Call Detect!', data);
                        try {
                            const response = await axiosInstance.get(`users/profile/${data.from}/`);
                            setCallerInfo(response.data); 
                        } catch (e) {
                            console.error("Could not fetch caller details", e);
                            setCallerInfo({ username: 'Unknown User' });
                        }
                        setIncomingCall(data);
                    }
                } catch (err) {
                    console.error("Notification Parse Error:", err);
                }
            };

            ws.onclose = (e) => {
                 console.log('❌ Notification WebSocket Disconnected', e.code, e.reason);
                 // Try to reconnect in 3 seconds
                 reconnectTimer = setTimeout(connect, 3000);
            };
            
            setSocket(ws);
        };

        connect();

        return () => {
            if (ws) ws.close();
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };
    }, []);

    const answerCall = () => {
        if (incomingCall) {
            // Navigate to chat with caller
            // We pass state so ChatBox works immediately without waiting for another signal
            navigate(`/messages`, { state: { 
                preselectedUserId: incomingCall.from,
                autoAnswerSignal: incomingCall.signalData
            }});
            setIncomingCall(null);
        }
    };

    const declineCall = () => {
        setIncomingCall(null);
        // optimal: send 'decline' signal back if we wanted to be polite
    };

    return (
        <NotificationContext.Provider value={{ incomingCall, answerCall, declineCall }}>
            {children}
            
            {/* Global Call Modal */}
            {incomingCall && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                     <div className="bg-white border-4 border-black p-6 rounded-lg max-w-sm w-full text-center shadow-[8px_8px_0px_0px_rgba(251,191,36,1)] animate-bounce-in">
                        <div className="w-24 h-24 mx-auto mb-4 relative">
                            {/* Avatar placeholder */}
                            <div className="w-full h-full rounded-full bg-yellow-400 border-4 border-black flex items-center justify-center text-3xl font-black">
                                {callerInfo?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 border-2 border-black p-2 rounded-full animate-bounce">
                                <FontAwesomeIcon icon={faVideo} className="text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-black mb-2">Incoming Call...</h3>
                        <p className="text-gray-600 font-bold mb-8">{callerInfo?.username || 'Someone'} is calling you</p>
                        
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={declineCall}
                                className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={answerCall}
                                className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                Answer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
