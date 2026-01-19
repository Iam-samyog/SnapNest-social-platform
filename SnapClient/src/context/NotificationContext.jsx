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
                        
                        // Set caller info immediately from the signal
                        setCallerInfo({
                            username: data.from_username || 'Unknown User',
                            id: data.from
                        });
                        
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
                <div className="fixed inset-0 z-[100] bg-zinc-950/40 backdrop-blur-md flex items-end md:items-center justify-center p-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                     <div className="bg-zinc-900 border border-white/10 p-6 rounded-[32px] max-w-sm w-full text-center shadow-2xl shadow-black/50 overflow-hidden relative group">
                        {/* Background Pulse Effect */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
                        
                        <div className="w-24 h-24 mx-auto mb-6 relative">
                            <div className="w-full h-full rounded-3xl bg-zinc-800 border border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-inner animate-in zoom-in duration-500">
                                {callerInfo?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-950 rounded-full flex items-center justify-center border-2 border-zinc-800">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-zinc-400 text-sm font-medium tracking-widest uppercase mb-1">Incoming Video Call</h3>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{callerInfo?.username || 'Someone'}</h2>
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={declineCall}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-4 rounded-2xl font-semibold transition-all active:scale-95 border border-white/5"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={answerCall}
                                className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-white/5 flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faVideo} size="sm" />
                                <span>Answer</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
