import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Update with your backend URL

const App = () => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  let localStream;
  let peerConnection;

  useEffect(() => {
    // Set up media devices and getUserMedia
    const setupMediaDevices = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = localStream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    // Call the media setup function
    setupMediaDevices();

    // Clean up function
    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, []);

  const createPeerConnection = () => {
    // Create a new RTCPeerConnection
    peerConnection = new RTCPeerConnection();

    // Add local stream tracks to the connection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Set up event handlers for ICE candidates and remote tracks
    peerConnection.onicecandidate = handleICECandidate;
    peerConnection.ontrack = handleTrackEvent;
  };

  const handleICECandidate = (event) => {
    if (event.candidate) {
      // Send the ICE candidate to the remote peer
      socket.emit('iceCandidate', { candidate: event.candidate });
    }
  };

  const handleTrackEvent = (event) => {
    // Add the remote track to the remote video element
    if (remoteVideoRef.current.srcObject !== event.streams[0]) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  };

  const startVideoCall = () => {
    createPeerConnection();
    // Create an offer and set local description
    peerConnection
      .createOffer()
      .then((offer) => peerConnection.setLocalDescription(offer))
      .then(() => {
        // Send the offer to the remote peer
        socket.emit('offer', { offer });
      })
      .catch((error) => console.error('Error creating video call offer:', error));
  };

  useEffect(() => {
    socket.on('offer', (offer) => {
      // Handle the incoming offer from the remote peer
      createPeerConnection();
      peerConnection
        .setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => peerConnection.createAnswer())
        .then((answer) => peerConnection.setLocalDescription(answer))
        .then(() => {
          // Send the answer to the remote peer
          socket.emit('answer', { answer });
        })
        .catch((error) => console.error('Error creating video call answer:', error));
    });

    socket.on('answer', (answer) => {
      // Handle the incoming answer from the remote peer
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('iceCandidate', (candidate) => {
      // Handle the incoming ICE candidate from the remote peer
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
  }, []);

  return (
    <div>
      <div>
        <h2>Your Video</h2>
        <video ref={localVideoRef} autoPlay muted playsInline />
      </div>
      <div>
        <h2>Remote Video</h2>
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>
      <div>
        <button onClick={startVideoCall}>Start Video Call</button>
      </div>
    </div>
  );
};

export default App;
