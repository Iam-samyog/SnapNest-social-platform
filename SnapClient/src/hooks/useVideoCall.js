import { useEffect, useRef, useState } from 'react';
const useVideoCall = (socket, onRemoteStream) => {
    const pc = useRef(new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    }));
    const startCall = async () => {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.getTracks().forEach(track => pc.current.addTrack(track, localStream));
        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        socket.current.send(JSON.stringify({ type: 'offer', offer }));
        return localStream;
    };
    const handleSignal = async (data) => {
        if (data.type === 'offer') {
            await pc.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socket.current.send(JSON.stringify({ type: 'answer', answer }));
        } else if (data.type === 'answer') {
            await pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'ice_candidate') {
            await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    };
    useEffect(() => {
        pc.current.ontrack = (e) => onRemoteStream(e.streams[0]);
        pc.current.onicecandidate = (e) => {
            if (e.candidate) {
                socket.current.send(JSON.stringify({ type: 'ice_candidate', candidate: e.candidate }));
            }
        };
    }, []);
    return { startCall, handleSignal };
};
export default useVideoCall;