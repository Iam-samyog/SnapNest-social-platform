import React, { useState, useEffect, useRef } from 'react';
import useChat from '../hooks/useChat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faVideo, faInfoCircle, faPaperPlane, faImage, faHeart, faSmile } from '@fortawesome/free-solid-svg-icons';

const ChatBox = ({ otherUser, currentUserId }) => {
    const { messages, sendMessage } = useChat(otherUser.id);
    const [input, setInput] = useState('');
    const scrollRef = useRef();
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };
    return (
        <div className="flex flex-col h-full w-full bg-white">
            <div className="bg-white border-b p-4 text-black font-bold flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <img src={otherUser.photo} className="w-10 h-10 rounded-full border-2 border-indigo-600 object-cover" />
                   <div className="flex flex-col">
                        <span>{otherUser.username}</span>
                        <span className="text-[10px] text-green-500">Online</span>
                   </div>
                </div>
                <div className="flex gap-4 text-indigo-600">
                    <button className="hover:text-indigo-800 transition-colors">
                        <FontAwesomeIcon icon={faPhone} />
                    </button>
                    <button className="hover:text-indigo-800 transition-colors">
                        <FontAwesomeIcon icon={faVideo} />
                    </button>
                    <button className="hover:text-gray-600 transition-colors text-gray-400">
                        <FontAwesomeIcon icon={faInfoCircle} />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${msg.sender_id === currentUserId ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none'}`}>
                            {msg.message}
                            <div className={`text-[9px] mt-1 ${msg.sender_id === currentUserId ? 'text-indigo-200' : 'text-gray-400'}`}>
                                Just now
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>
            <div className="p-4 bg-white border-t flex gap-2 items-center">
                <button className="text-gray-400 hover:text-indigo-600">
                    <FontAwesomeIcon icon={faSmile} className="text-xl" />
                </button>
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Message..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm"
                />
                {input.trim() ? (
                    <button onClick={handleSend} className="text-indigo-600 font-bold px-2 hover:text-indigo-800">
                        Send
                    </button>
                ) : (
                    <div className="flex gap-3 text-gray-500">
                         <FontAwesomeIcon icon={faImage} className="text-xl cursor-pointer hover:text-indigo-600" />
                         <FontAwesomeIcon icon={faHeart} className="text-xl cursor-pointer hover:text-indigo-600" />
                    </div>
                )}
            </div>
        </div>
    );
};
export default ChatBox;