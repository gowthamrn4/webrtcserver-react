import React, { useState, useEffect } from "react";
import Video from "./Video";

function Videos(props) {
  const [rVideos, setRVideos] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState([]);

  useEffect(() => {
    // const _rVideos = props.remoteStreams.map((rVideo, index) => {
    //   let video = (
    //     <Video
    //       videoStyle={{
    //         cursor: "pointer",
    //         objectFit: "cover",
    //         borderRadius: 3,
    //         width: "100%",
    //       }}
    //       frameStyle={{
    //         width: 120,
    //         float: "left",
    //         padding: "0 3px",
    //       }}
    //       videoStream={rVideo.stream}
    //     />
    //   );

    //   return (
    //     <div
    //       id={rVideo.name}
    //       onClick={() => {
    //         props.switchVideo(rVideo);
    //       }}
    //       style={{ display: "inline-block" }}
    //       key={index}
    //     >
    //       {video}
    //     </div>
    //   );
    // });

    // setRemoteStreams(props.remoteStreams);
    // setRVideos(_rVideos);
    console.log("Videos props ", props);
    let tempVideos = [];
    props.remoteStreams.forEach((video, index) => {
        tempVideos.push(makeVideoView(video, index))
    })
    console.log("Called Videos ", tempVideos);
    setRVideos(tempVideos);
  }, [props.remoteStreams]);

  const makeVideoView = (video, index) => {
      console.log("Make Video View",index, video)
    return (<div
      id={video.name}
      onClick={() => {
        props.switchVideo(video);
      }}
      style={{ display: "inline-block" }}
      key={index}
    >
      <Video
        videoStyle={{
          cursor: "pointer",
          objectFit: "cover",
          borderRadius: 3,
          width: 120,
        //   width: "100%",
        }}
        frameStyle={{
        //   width: 120,
          float: "left",
          padding: "0 3px",
        }}
        videoStream={video.stream}
        from = 'Videos'
      />
    </div>)
  };

  return (
    <div
      style={{
        zIndex: 3,
        position: "fixed",
        padding: "6px 3px",
        backgroundColor: "rgb(0,0,0,0.3)",
        maxHeight: 120,
        top: "auto",
        right: 10,
        left: 10,
        bottom: 10,
        overflowX: "scroll",
        whiteSpace: "nowrap",
      }}
    >
      {rVideos}
    </div>
  );
}

export default Videos;
