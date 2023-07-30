import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const AudioRecorder = () => {
  const [stream, setStream] = useState();
  const [isMuted, setIsMuted] = useState(false);
  const [socket, setSocket] = useState();
  const [peerConnection, setPeerConnection] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const localAudioRef = useRef();
  const remoteAudioRef = useRef();

  useEffect(() => {
    const getMediaStream = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setStream(mediaStream);

      setSocket(io("http://localhost:5000"));

      const peerConnection = new RTCPeerConnection();
      peerConnection.addTrack(mediaStream.getAudioTracks()[0], mediaStream);
      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      setPeerConnection(peerConnection);
    };
    getMediaStream();
  }, []);

  useEffect(() => {
    if (socket && peerConnection) {
      socket.on("offer", async (offer) => {
        await peerConnection.setRemoteDescription(offer);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit("answer", answer);
      });

      socket.on("answer", async (answer) => {
        await peerConnection.setRemoteDescription(answer);
      });

      socket.on("ice-candidate", async (candidate) => {
        await peerConnection.addIceCandidate(candidate);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate);
        }
      };

      const offer = async () => {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit("offer", offer);
      };
      offer();
    }
  }, [socket, peerConnection]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (localAudioRef.current && stream) {
      localAudioRef.current.srcObject = stream;
    }
  }, [localAudioRef, stream]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteAudioRef, remoteStream]);

  return (
    <div>
      <audio ref={localAudioRef} autoPlay muted={isMuted} />
      <audio ref={remoteAudioRef} autoPlay muted={isMuted} />

      <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
    </div>
  );
};

export default AudioRecorder;
