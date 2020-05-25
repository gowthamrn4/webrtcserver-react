import React, { Component } from "react";
import Video from "./Video";

class VideosC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rVideos: [],
      remoteStreams: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log("RemoteStreams Next props ", nextProps.remoteStreams);
    console.log("RemoteStreams State ", this.state.remoteStreams);
    if (this.state.remoteStreams !== nextProps.remoteStreams) {
      console.log("Videos props ", this.props);
      let tempVideos = [];
      nextProps.remoteStreams.forEach((video, index) => {
        tempVideos.push(this.makeVideoView(video, index));
      });
      console.log("Called Videos ", tempVideos);
      this.setState({ rVideos: tempVideos });
    }
  }

  makeVideoView = (video, index) => {
    console.log("Make Video View", index, video);
    return (
      <div
        id={video.name}
        onClick={() => {
          this.props.switchVideo(video);
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
          from="Videos"
        />
      </div>
    );
  };

  render() {
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
        {this.state.rVideos}
      </div>
    );
  }
}
export default VideosC;
