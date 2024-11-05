import React, { useRef, useState } from "react";
import CustomButton from "./CustomButton";
import { View } from "react-native-animatable";
import { CameraView } from "expo-camera";
import { ResizeMode, Video } from "expo-av";

function CameraContainer() {
  const [isRecording, setIsRecording] = useState(false);
  const [video, setVideo] = useState();
  let cameraRef = useRef();

  const recordVideo = async () => {
    setIsRecording(true);
    let options = {
      quality: "1080p",
      maxDuration: 60,
      mute: false,
    };

    cameraRef.current.recordAsync(options).then((video) => {
      console.log("stopped");
      setVideo(video);
      setIsRecording(false);
      console.log(video);
    });
  };

  const stopRecording = async () => {
    setIsRecording(false);
    cameraRef.current.stopRecording();
  };

  return (
    <View>
      <CameraView className="w-full h-72" ref={cameraRef} mode="video">
        <View>
          <CustomButton
            title={isRecording ? "Stop Recording" : "Record Video"}
            handlePress={isRecording ? stopRecording : recordVideo}
            containerStyles="mt-7"
          />
        </View>
      </CameraView>
      {video && (
        <Video
          source={{ uri: video.uri }}
          className="w-full h-64 rounded-2xl"
          resizeMode={ResizeMode.COVER}
        />
      )}
    </View>
  );
}

export default CameraContainer;
