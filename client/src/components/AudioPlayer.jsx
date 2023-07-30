import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const AudioPlayer = () => {
  const [remoteStream, setRemoteStream] = useState();
  const remoteAudioRef = useRef();
  const socket = io("http://localhost:5000");
  const peerConnectionRef = useRef();

  useEffect(() => {
    const initPeerConnection = async () => {
      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;

      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      socket.on("offer", async (offer) => {
        await peerConnection.setRemoteDescription(offer);

        const mediaStream = new MediaStream();
        const audioTrack =
          peerConnection.remoteDescription.sdp.indexOf("m=audio") !== -1
            ? peerConnection
                .getReceivers()
                .find((receiver) => receiver.track.kind === "audio").track
            : peerConnection.getRemoteStreams()[0].getAudioTracks()[0];
        mediaStream.addTrack(audioTrack);
        setRemoteStream(mediaStream);

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

      const offer = async () => {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit("offer", offer);
      };
      offer();
    };
    initPeerConnection();

    return () => {
      socket.disconnect();
      peerConnectionRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteAudioRef, remoteStream]);

  return (
    <div>
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
};

export default AudioPlayer;
