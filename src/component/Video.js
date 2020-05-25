import React, { useEffect, useState } from "react";

function Video(props) {
  const [video, setVideo] = useState(null);
  useEffect(() => {
      console.log("Video Called ", props)
    if (video && props.videoStream) video.srcObject = props.videoStream;
  }, [props.videoStream]);

  return (
    <div style={{ ...props.frameStyle }}>
      <video
        style={{ ...props.videoStyle }}
        ref={props.videoStream}
        id={props.id}
        muted={props.muted}
        autoPlay
        ref={(ref) => setVideo(ref)}
      />
    </div>
  );
}

export default Video;
