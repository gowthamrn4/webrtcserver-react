import React, { createRef, useEffect, useState } from "react";
import io from "socket.io-client";
import Video from "./component/Video";
import Videos from "./component/Videos";

function App() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  // const [peerConn, setPeerConn] = useState(null);
  const [peerConnections, setPeerConnections] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [status, setStatus] = useState("Please wait...");
  const [socket, setSocket] = useState(null);
  const [serverUrl] = useState("https://947f3a2a.ngrok.io/");
  const [pcConfig] = useState({
    iceServers: [
      // {
      //   urls: "stun:numb.viagenie.ca",
      // },
      // {
      //   urls: "turn:numb.viagenie.ca",
      //   credential: "numb-@@95",
      //   username: "yuba.oli@amniltech.com",
      // },
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });

  const [sdpConstraints] = useState({
    mandatory: {
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    },
  });

  const [mediaConstraints] = useState({
    audio: true,
    video: true,
    // video:{
    //   width: 1280,
    //   height: 720
    // },
    // video: {
    //   width:{min: 1280}
    // },
    options: {
      mirror: true,
    },
  });

  useEffect(() => {
    setSocket(io(`${serverUrl}webrtcPeer`));
    // setPeerConn(new RTCPeerConnection(pcConfig));
  }, []);

  useEffect(() => {
    // if (peerConn) {
    //   initPeerConnectionCallbacks();
    // }
    console.log("USE EFT ", localStream)
    if(localStream){
      socketEventHandler();
      whoIsOnline();
    }
  }, [localStream]);

  useEffect(() => {
    if (socket) {
      socketEventHandler();
    }

    return () => {
      if (socket) socket.close();
    };
  }, [socket]);

  useEffect(() => {
    if(localStream){
      socketEventHandler();
      console.log("Selected Video Changed ", selectedVideo)
    }
  }, [selectedVideo])

  // const initPeerConnectionCallbacks = () => {
  //   peerConn.onicecandidate = (e) => {
  //     if (e.candidate) {
  //       console.log("onicecandidate Candidate ", e.candidate);
  //       sendToServer("candidate", e.candidate, socket.id);
  //     }
  //   };

  //   peerConn.oniceconnectionstatechange = (e) => {
  //     console.log("Ice connection changed", e);
  //   };

  //   peerConn.ontrack = (e) => {
  //     setRemoteStream(e.streams[0]);
  //   };
  // };

  const getLocalStream = () => {
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((stream) => {
        setLocalStream(stream);
        console.log("GetLocalStream ", stream )
        // whoIsOnline();
        // if (peerConn) peerConn.addStream(stream);
      })
      .catch((error) => {
        console.log("Error while getting camera ", error);
      });
  };

  const socketEventHandler = () => {
    socket.on("connection-success", (data) => {
      getLocalStream();
      console.log("New Peer Connected", data);
      setStatus(
        data.peerCount > 1
          ? `Total Connected Peers ${data.peerCount}`
          : `Waiting for other peers to connect`
      );
    });

    socket.on("peer-disconnected", (data) => {
      console.log("Disconnected peer", data);
      const newRemoteStreams = remoteStreams.filter(
        (stream) => stream.id !== data.socketId
      );
      // check if disconnected peer is the selected video and if there still connected peers, then select the first
      if (
        selectedVideo &&
        selectedVideo.id === data.socketId &&
        remoteStreams.length
      )
        setSelectedVideo(remoteStreams[0]);

      setRemoteStreams(newRemoteStreams);
      setStatus(
        data.peerCount > 1
          ? `Total Connected Peers ${data.peerCount}`
          : `Waiting for other peers to connect`
      );
    });

    // socket.on("offerOrAnswer", (sdp) => {
    //   setTaValue(JSON.stringify(sdp));
    //   peerConn.setRemoteDescription(new RTCSessionDescription(sdp));
    // });

    socket.on("candidate", (data) => {
      // get remote's peerConnection
      console.log("on candidate ", data);
      const pc = peerConnections[data.socketId];
      if (pc) pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    socket.on("online-peer", (socketId) => {
      console.log("online-peer ", socketId);
      console.log("online-peer", "Local Stream ", localStream)

      //Create new peerConnection to the socketId client
      createPeerConnection(socketId, (pc) => {
        //Now create offer for the connected peer
        if (pc) {
          pc.createOffer(sdpConstraints).then(
            (sdp) => {
              pc.setLocalDescription(sdp);

              sendToServer("offer", sdp, {
                local: socket.id,
                remote: socketId,
              });
            },
            (e) => {
              console.log("Error create offer", e);
            }
          );
        }
      });
    });

    socket.on("offer", (data) => {
      createPeerConnection(data.socketId, (pc) => {
        if (pc) {
          console.log("localStream",localStream)
          // pc.addStream(localStream);
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(
            () => {
              //Create Answer
              pc.createAnswer(sdpConstraints).then(
                (sdp) => {
                  pc.setLocalDescription(sdp);

                  sendToServer("answer", sdp, {
                    local: socket.id,
                    remote: data.socketId,
                  });
                },
                (e) => {
                  console.log("Error create answer", e);
                }
              );
            }
          );
        }
      });
    });

    socket.on("answer", (data) => {
      // get remote's peerConnection
      console.log("Answer Remote SDP ", data, peerConnections, remoteStreams);

      const pc = peerConnections[data.socketId];
      pc.setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      ).then(() => {});
    });
  };

  // const createOffer = () => {
  //   peerConn.createOffer(sdpConstraints).then(
  //     (sdp) => {
  //       peerConn.setLocalDescription(sdp);
  //       sendToServer("offerOrAnswer", sdp, socket.id);
  //     },
  //     (e) => {
  //       console.log("Error create offer", e);
  //     }
  //   );
  // };

  // const createAnswer = () => {
  //   peerConn.createAnswer(sdpConstraints).then(
  //     (sdp) => {
  //       peerConn.setLocalDescription(sdp);
  //       sendToServer("offerOrAnswer", sdp, socket.id);
  //     },
  //     (e) => {
  //       console.log("Error create answer", e);
  //     }
  //   );
  // };

  const createPeerConnection = (socketId, callback) => {
    try {
      let pc = new RTCPeerConnection(pcConfig);

      //add pc to the collection of peerconnections i.e peerConnections
      const tempPcConnections = peerConnections;
      tempPcConnections[socketId] = pc;
      setPeerConnections(tempPcConnections);

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendToServer("candidate", e.candidate, {
            local: socket.id,
            remote: socketId,
          });
        }
      };

      pc.oniceconnectionstatechange = (e) => {
        console.log("Ice connection changed", e);
        // if (pc.connectionState === "disconnected") {
        //   const newRemoteStreams = remoteStreams.filter(
        //     (stream) => stream.id !== socketId
        //   );
        //   setRemoteStream(
        //     (newRemoteStreams.length > 0 && newRemoteStreams[0].stream) || null
        //   );
        // }
      };

      pc.ontrack = (e) => {
        const remoteVideo = {
          id: socketId,
          name: socketId,
          stream: e.streams[0],
        };

        // If there is already stream in display let it stay the same, otherwise use the latest stream
        if (remoteStreams.length <= 0) setRemoteStream(e.streams[0]);

        // get currently selected video
        console.log("onTrack ", remoteStreams, selectedVideo)
        let tempSelectedVdo = remoteStreams.filter(
          (stream) => stream.id === selectedVideo.id
        );
        // if the video is still in the list, then do nothing, otherwise set to new video stream
        if (!tempSelectedVdo.length) setSelectedVideo(remoteVideo);

        const tempRemoteStreams = remoteStreams;
        tempRemoteStreams.push(remoteVideo);
        setRemoteStreams(tempRemoteStreams);
      };

      pc.close = () => {};

      if (localStream) pc.addStream(localStream);

      callback(pc);
    } catch (error) {
      console.log("Error while creating peer connections", error);
      callback(null);
    }
  };

  const whoIsOnline = () => {
    console.log("Who is Online ", "Local Stream ", localStream)
    sendToServer("onlinePeers", null, { local: socket.id });
  };

  const sendToServer = (type, payload, socketId) => {
    socket.emit(type, {
      socketId,
      payload,
    });
  };

  const statusTextView = (
    <div style={{ padding: 8, color: "yellow" }}>{status}</div>
  );

  return (
    <div>
      <Video
        videoStyle={{
          position: "fixed",
          right: 0,
          height: 300,
          width: 300,
          margin: 8,
          zIndex: 2,
          background: "#0f0f0f",
        }}
        videoStream={localStream}
        autoPlay
        muted
      />

      <Video
        videoStyle={{
          height: "100%",
          width: "100%",
          background: "#0f0f0f",
          zIndex: 1,
          position: "fixed",
          bottom: 0,
        }}
        videoStream={selectedVideo && selectedVideo.stream}
        autoPlay
        muted
      />
      <br />
      <div
        style={{
          zIndex: 3,
          position: "absolute",
          margin: 6,
          padding: 6,
          borderRadius: 6,
          backgroundColor: "#cdc4ff4f",
        }}
      >
        {statusTextView}
      </div>
      <div>
        {console.log("Remote Streams ", remoteStreams)}
        <Videos
          switchVideo={(video) => setSelectedVideo(video)}
          remoteStreams={remoteStreams}
        />
      </div>
      {/* <div style={{ position: "fixed", zIndex: 1 }}>
        <button onClick={() => createOffer()}>Create Offer</button>
        <button onClick={() => createAnswer()}>Create Answer</button>
        <br />
        <textarea value={taValue} style={{ width: 450, height: 50 }} />
      </div> */}
    </div>
  );
}

export default App;
