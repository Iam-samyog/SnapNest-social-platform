import React, { useEffect, useState, useRef } from 'react';
import SimplePeer from 'simple-peer';
import { Phone, Video, Mic, MicOff, Video as VideoIcon, VideoOff, X } from 'lucide-react';

const CallInterface = ({ 
  connectionData, 
  currentUser, 
  socket, 
  onClose,
  isInitiator,
  otherUser
}) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [remoteVideoOff, setRemoteVideoOff] = useState(false);
  const [isTogglingAudio, setIsTogglingAudio] = useState(false);
  const [isTogglingVideo, setIsTogglingVideo] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const streamRef = useRef();
  const activeListeners = useRef([]);

  useEffect(() => {
    let mounted = true;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        if (!mounted) {
            // Component unmounted before stream was ready. Stop it immediately.
            currentStream.getTracks().forEach(track => track.stop());
            return;
        }

        setStream(currentStream);
        streamRef.current = currentStream;
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        // If we are the initiator, create the peer immediately
        if (isInitiator) {
          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: currentStream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
          });

          peer.on('signal', (data) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                  type: 'call_user',
                  userToCall: otherUser.id,
                  signalData: data,
                  from: currentUser.id
                }));
            }
          });

          peer.on('stream', (currentStream) => {
            if (userVideo.current) {
              userVideo.current.srcObject = currentStream;
            }
          });

          const handleCallEvents = (event) => {
            const data = JSON.parse(event.data);
             if (data.type === 'call_accepted') {
                setCallAccepted(true);
                peer.signal(data.signal);
            } else if (data.type === 'toggle_media') {
                if (data.kind === 'audio') setRemoteMuted(!data.status);
                if (data.kind === 'video') setRemoteVideoOff(!data.status);
            }
          };

          socket.addEventListener('message', handleCallEvents);
          activeListeners.current.push(handleCallEvents);
          
          // Store handler for cleanup
          connectionRef.current = peer;
          // We need to attach cleanup logic for this listener to the peer destroy or component cleanup?
          // Since this is inside useEffect, we can't easily access the cleanup function of useEffect from here directly 
          // without refs or closures.
          // Better: assign it to a ref so the cleanup function (line 67) can access it.
          // However, lines 60-61 close the "if (isInitiator)" block.
          // Let's rely on a reliable cleanup strategy.
          
          // We can attach the listener removal to the peer.destroy? No, peer doesn't know about socket.
          // Let's add it to a ref.
          activeListeners.current.push(handleCallAccepted);

          connectionRef.current = peer;
        } 
      })
      .catch(err => console.error('Error accessing media devices:', err));
      
      return () => {
          mounted = false;
          // Cleanup
          if(streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
          }
          if(connectionRef.current) {
              connectionRef.current.destroy();
          }
          
          // Remove all listeners attached during this session
          activeListeners.current.forEach(listener => {
              socket.removeEventListener('message', listener);
          });
          activeListeners.current = [];
      }
  }, []);

  // Effect to handle answering a call (for the receiver)
  useEffect(() => {
    if (!isInitiator && connectionData && stream) {
        // We are answering
        setCallAccepted(true);
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('signal', (data) => {
            socket.send(JSON.stringify({
                type: 'answer_call',
                signal: data,
                to: connectionData.from
            }));
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(connectionData.signalData);
        connectionRef.current = peer;
    }
  }, [stream, connectionData]); // Run when stream is ready and we have connection data


  const leaveCall = () => {
    setCallEnded(true);
    
    // Stop all tracks immediately
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    // Notify other user
    socket.send(JSON.stringify({
         type: 'end_call',
         to: otherUser.id
    }));
    onClose();
  };

  const toggleMute = async () => {
      if (isTogglingAudio) return;
      setIsTogglingAudio(true);

      try {
          // Logic for turning Audio ON (Unmute)
          if (isMuted) {
              const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const newAudioTrack = newStream.getAudioTracks()[0];
              
              if (stream && connectionRef.current) {
                  const oldAudioTrack = stream.getAudioTracks()[0];
                  if (oldAudioTrack) connectionRef.current.replaceTrack(oldAudioTrack, newAudioTrack, stream);
                  
                  stream.removeTrack(oldAudioTrack);
                  stream.addTrack(newAudioTrack);
                  
                  setIsMuted(false);
                  
                  if (socket.readyState === WebSocket.OPEN) {
                      socket.send(JSON.stringify({
                          type: 'toggle_media',
                          kind: 'audio',
                          status: true,
                          to: otherUser.id
                      }));
                  }
              }
          } 
          // Logic for turning Audio OFF (Mute)
          else {
              if(stream) {
                  const audioTrack = stream.getAudioTracks()[0];
                  if (audioTrack) {
                      audioTrack.stop();
                  }
                  setIsMuted(true);
                  
                  if (socket.readyState === WebSocket.OPEN) {
                      socket.send(JSON.stringify({
                          type: 'toggle_media',
                          kind: 'audio',
                          status: false,
                          to: otherUser.id
                      }));
                  }
              }
          }
      } catch (err) {
          console.error("Audio toggle error:", err);
      } finally {
          setIsTogglingAudio(false);
      }
  }

  const toggleVideo = async () => {
      if (isTogglingVideo) return;
      setIsTogglingVideo(true);

      try {
          // Logic for turning Video ON
          if (isVideoOff) {
              const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
              const newVideoTrack = newStream.getVideoTracks()[0];
              
              if (stream && connectionRef.current) {
                  const oldVideoTrack = stream.getVideoTracks()[0];
                  if (oldVideoTrack) connectionRef.current.replaceTrack(oldVideoTrack, newVideoTrack, stream);
                  
                  stream.removeTrack(oldVideoTrack);
                  stream.addTrack(newVideoTrack);
                  
                  if (myVideo.current) {
                      myVideo.current.srcObject = stream;
                  }
                  
                  setIsVideoOff(false);
                  
                  if (socket.readyState === WebSocket.OPEN) {
                      socket.send(JSON.stringify({
                          type: 'toggle_media',
                          kind: 'video',
                          status: true,
                          to: otherUser.id
                      }));
                  }
              }
          } 
          // Logic for turning Video OFF
          else {
              if(stream) {
                  const videoTrack = stream.getVideoTracks()[0];
                  if (videoTrack) {
                      videoTrack.stop();
                  }
                  setIsVideoOff(true);
                  
                  if (socket.readyState === WebSocket.OPEN) {
                      socket.send(JSON.stringify({
                          type: 'toggle_media',
                          kind: 'video',
                          status: false,
                          to: otherUser.id
                      }));
                  }
              }
          }
      } catch (err) {
          console.error("Video toggle error:", err);
      } finally {
          setIsTogglingVideo(false);
      }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* My Video */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
            <video playsInline muted ref={myVideo} autoPlay className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} />
            {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-500 mb-2">
                             <VideoOff size={32} className="text-white" />
                        </div>
                        <p className="text-white font-bold">You</p>
                    </div>
                </div>
            )}
             <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm flex items-center gap-2">
                <span>You</span>
                {isMuted && <MicOff size={14} className="text-red-500" />}
            </div>
        </div>

        {/* Other User Video */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
           {callAccepted && !callEnded ? (
             <>
                <video playsInline ref={userVideo} autoPlay className={`w-full h-full object-cover ${remoteVideoOff ? 'hidden' : ''}`} />
                {remoteVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-500 mb-2">
                                <span className="text-2xl font-bold text-white">{otherUser.username[0].toUpperCase()}</span>
                            </div>
                            <p className="text-white font-bold">{otherUser.username} (Camera Off)</p>
                        </div>
                    </div>
                )}
             </>
           ) : (
                <div className="flex items-center justify-center h-full text-white">
                    {isInitiator ? 'Calling...' : 'Connecting...'}
                </div>
           )}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm flex items-center gap-2">
                <span>{otherUser?.username || 'User'}</span>
                {remoteMuted && <MicOff size={14} className="text-red-500" />}
            </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button 
            onClick={toggleMute}
            disabled={isTogglingAudio}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80 transition-all ${isTogglingAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {/* Show simple spinner or icon */}
            {isTogglingAudio ? <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> : (isMuted ? <MicOff size={24} /> : <Mic size={24} />)}
        </button>
        
        <button 
            onClick={toggleVideo}
            disabled={isTogglingVideo}
            className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80 transition-all ${isTogglingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
             {isTogglingVideo ? <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> : (isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />)}
        </button>

        <button 
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
        >
            <Phone size={24} className="rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
};

export default CallInterface;
