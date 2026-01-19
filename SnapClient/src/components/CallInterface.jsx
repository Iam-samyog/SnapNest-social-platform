import React, { useEffect, useState, useRef } from 'react';
import SimplePeer from 'simple-peer';
import { Phone, Video, Mic, MicOff, Video as VideoIcon, VideoOff, X } from 'lucide-react';

const CallInterface = ({ 
  incomingCallSignal, 
  currentUser, 
  socket, 
  onClose,
  isInitiator,
  otherUser,
  autoAccept
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

    const constraints = {
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((currentStream) => {
        if (!mounted) {
            currentStream.getTracks().forEach(track => track.stop());
            return;
        }

        setStream(currentStream);
        streamRef.current = currentStream;
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

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
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'call_accepted') {
                   setCallAccepted(true);
                   peer.signal(data.signal);
               } else if (data.type === 'toggle_media') {
                   if (data.kind === 'audio') setRemoteMuted(!data.status);
                   if (data.kind === 'video') setRemoteVideoOff(!data.status);
               }
            } catch(e) {}
          };

          socket.addEventListener('message', handleCallEvents);
          activeListeners.current.push(handleCallEvents);
          connectionRef.current = peer;
        } 
      })
      .catch(err => console.error('Error accessing media devices:', err));
      
      return () => {
          mounted = false;
          if(streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
          }
          if(connectionRef.current) {
              connectionRef.current.destroy();
          }
          activeListeners.current.forEach(listener => {
              socket.removeEventListener('message', listener);
          });
          activeListeners.current = [];
      }
  }, []);

  // Effect for auto-answer
  useEffect(() => {
    if (autoAccept && !isInitiator && !callAccepted) {
        // Logic for auto-acceptance is handled by the presence of incomingCallSignal
        // which triggers the second useEffect. This autoAccept prop currently 
        // helps distinguish manual vs automatic entry.
    }
  }, [autoAccept]);

  // Effect to handle answering a call (for the receiver)
  useEffect(() => {
    if (!isInitiator && incomingCallSignal && stream) {
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
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'answer_call',
                    signal: data,
                    to: otherUser.id
                }));
            }
        });

        peer.on('stream', (remoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        peer.signal(incomingCallSignal);

        const handleRemoteMedia = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'toggle_media' && data.to === currentUser.id) {
                    if (data.kind === 'audio') setRemoteMuted(!data.status);
                    if (data.kind === 'video') setRemoteVideoOff(!data.status);
                }
            } catch(e) {}
        };
        socket.addEventListener('message', handleRemoteMedia);
        activeListeners.current.push(handleRemoteMedia);

        connectionRef.current = peer;
    }
  }, [incomingCallSignal, stream, isInitiator]);

  const leaveCall = () => {
    setCallEnded(true);
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
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
          if (isMuted) {
              const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const newAudioTrack = newStream.getAudioTracks()[0];
              if (stream && connectionRef.current) {
                  const oldAudioTrack = stream.getAudioTracks()[0];
                  if (oldAudioTrack) connectionRef.current.replaceTrack(oldAudioTrack, newAudioTrack, stream);
                  stream.removeTrack(oldAudioTrack);
                  stream.addTrack(newAudioTrack);
                  setIsMuted(false);
                  socket.send(JSON.stringify({ type: 'toggle_media', kind: 'audio', status: true, to: otherUser.id }));
              }
          } else {
              if(stream) {
                  const audioTrack = stream.getAudioTracks()[0];
                  if (audioTrack) audioTrack.stop();
                  setIsMuted(true);
                  socket.send(JSON.stringify({ type: 'toggle_media', kind: 'audio', status: false, to: otherUser.id }));
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
          if (isVideoOff) {
              const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
              const newVideoTrack = newStream.getVideoTracks()[0];
              if (stream && connectionRef.current) {
                  const oldVideoTrack = stream.getVideoTracks()[0];
                  if (oldVideoTrack) connectionRef.current.replaceTrack(oldVideoTrack, newVideoTrack, stream);
                  stream.removeTrack(oldVideoTrack);
                  stream.addTrack(newVideoTrack);
                  if (myVideo.current) myVideo.current.srcObject = stream;
                  setIsVideoOff(false);
                  socket.send(JSON.stringify({ type: 'toggle_media', kind: 'video', status: true, to: otherUser.id }));
              }
          } else {
              if(stream) {
                  const videoTrack = stream.getVideoTracks()[0];
                  if (videoTrack) videoTrack.stop();
                  setIsVideoOff(true);
                  socket.send(JSON.stringify({ type: 'toggle_media', kind: 'video', status: false, to: otherUser.id }));
              }
          }
      } catch (err) {
          console.error("Video toggle error:", err);
      } finally {
          setIsTogglingVideo(false);
      }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Main Remote Video Container */}
      <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 overflow-hidden">
        {callAccepted && !callEnded ? (
          <div className="w-full h-full relative">
            <video playsInline ref={userVideo} autoPlay className={`w-full h-full object-cover transition-opacity duration-500 ${remoteVideoOff ? 'opacity-0' : 'opacity-100'}`} />
            
            {remoteVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 border-zinc-800">
                <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700 mb-4 shadow-xl">
                  <span className="text-5xl font-bold text-zinc-100">{otherUser?.username?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <h3 className="text-xl font-medium text-zinc-200">{otherUser?.username || 'User'}</h3>
                <p className="text-zinc-500 mt-2 flex items-center gap-2">
                    <VideoOff size={16} /> Video is off
                </p>
              </div>
            )}

            {/* Remote Status Indicators */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-medium tracking-wide">{otherUser?.username || 'User'}</span>
                {remoteMuted && (
                    <div className="bg-red-500/80 p-1 rounded-full shadow-lg">
                        <MicOff size={12} className="text-white" />
                    </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
            <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-zinc-700 shadow-2xl relative">
               <span className="text-5xl font-bold text-zinc-100">{otherUser?.username?.[0]?.toUpperCase() || '?'}</span>
               <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-950 rounded-full flex items-center justify-center border-2 border-zinc-700">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
               </div>
            </div>
            <div className="text-center">
                <h3 className="text-2xl font-semibold text-zinc-100 mb-1">{otherUser?.username || 'User'}</h3>
                <p className="text-zinc-400 text-lg animate-pulse">
                    {isInitiator ? 'Calling...' : 'Connecting...'}
                </p>
            </div>
          </div>
        )}

        {/* Local Self-View (Picture-in-Picture) */}
        <div className="absolute bottom-28 md:bottom-8 right-6 w-32 h-48 md:w-48 md:h-64 bg-zinc-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 transition-all hover:scale-105 active:scale-95 group">
          <video playsInline muted ref={myVideo} autoPlay className={`w-full h-full object-cover mirror ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} />
          
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 border-zinc-700">
              <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600">
                <VideoOff size={20} className="text-zinc-400" />
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-lg text-white text-[10px] font-medium border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
            You {isMuted && '(Muted)'}
          </div>
        </div>

        {/* Call Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-8 bg-zinc-900/40 backdrop-blur-xl px-8 py-4 rounded-[40px] border border-white/10 shadow-2xl z-20">
          <button 
            onClick={toggleMute}
            disabled={isTogglingAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isMuted ? 'bg-zinc-800 text-zinc-400 scale-90' : 'bg-zinc-100 text-zinc-900 hover:bg-white active:scale-95 shadow-lg shadow-white/5'}`}
          >
            {isTogglingAudio ? (
                <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
            ) : (isMuted ? <MicOff size={24} /> : <Mic size={24} />)}
          </button>
          
          <button 
            onClick={leaveCall}
            className="w-16 h-16 rounded-full bg-red-500 text-white hover:bg-red-400 active:scale-90 transition-all flex items-center justify-center shadow-xl shadow-red-500/20 group"
          >
            <Phone size={28} className="rotate-[135deg] group-hover:rotate-[145deg] transition-transform" />
          </button>

          <button 
            onClick={toggleVideo}
            disabled={isTogglingVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isVideoOff ? 'bg-zinc-800 text-zinc-400 scale-90' : 'bg-zinc-100 text-zinc-900 hover:bg-white active:scale-95 shadow-lg shadow-white/5'}`}
          >
            {isTogglingVideo ? (
                <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
            ) : (isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />)}
          </button>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default CallInterface;
