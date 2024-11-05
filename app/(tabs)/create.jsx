import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Button,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { Video, ResizeMode } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { icons } from "../../constants";
import { Link, router } from "expo-router";
import { createVideo } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { Camera, CameraView } from "expo-camera";
import * as VideoThumbnails from "expo-video-thumbnails";

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    video: null,
    thumbnail: null,
    prompt: "",
  });
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMicPermission, setHasMicPermission] = useState();
  const [useCamera, setUseCamera] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState("back");
  const [video, setVideo] = useState();
  let cameraRef = useRef();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const micPermission = await Camera.requestMicrophonePermissionsAsync();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMicPermission(micPermission.status === "granted");
    })();
  }, []);

  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        selectType === "image"
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      if (selectType === "image") {
        setForm({ ...form, thumbnail: result.assets[0] });
      }
      if (selectType === "video") {
        // console.log(result.assets[0]);
        setForm({ ...form, video: result.assets[0] });
      }
    }
  };

  const recordVideo = async () => {
    setIsRecording(true);
    const response = await cameraRef.current.recordAsync({ codec: "avc1" });
    const fileInfo = await FileSystem.getInfoAsync(response.uri);
    const thumbnail = await VideoThumbnails.getThumbnailAsync(response.uri);
    const imageInfo = await FileSystem.getInfoAsync(thumbnail.uri);
    let videoObject = {
      fileName: Date.now().toString(36) + ".mp4",
      fileSize: fileInfo.size,
      mimeType: "video/mp4",
      uri: response.uri,
    };

    console.log(videoObject);

    let imageObject = {
      fileName: Date.now().toString(36) + ".jpg",
      fileSize: imageInfo.size,
      mimeType: "image/jpeg",
      uri: thumbnail.uri,
    };
    console.log("Thumbnail info", imageObject);
    setForm({ ...form, video: videoObject, thumbnail: imageObject });
    setUseCamera(false);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    cameraRef.current.stopRecording();
  };

  const submit = async () => {
    if (!form.prompt || !form.title || !form.thumbnail || !form.video) {
      return Alert.alert("Please fill in all the fields.");
    }

    if (!user) {
      return Alert.alert("User not defined");
    }

    const userId = user.$id;

    const videoData = {
      ...form,
      userId: userId,
    };

    console.log("Video Data:", videoData);

    setUploading(true);

    try {
      await createVideo(videoData);

      Alert.alert("Success", "Post uploaded successfully.");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error from create.jsx", error.message);
    } finally {
      setForm({ title: "", video: null, thumbnail: null, prompt: "" });

      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-semibold">Upload Video</Text>

        <FormField
          title="Video Title"
          value={form.title}
          placeholder="Give your video a catchy title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-medium">
            Upload Video
          </Text>
          <TouchableOpacity
            onPress={() => openPicker("video")}
            disabled={video ? true : false}
          >
            {form.video ? (
              <Video
                source={{ uri: form.video.uri }}
                className="w-full h-64 rounded-2xl"
                resizeMode={ResizeMode.COVER}
              />
            ) : video ? (
              <Video
                source={{ uri: video.uri }}
                className="w-full h-64 rounded-2xl"
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-medium">
            Record a Video
          </Text>

          <TouchableOpacity
            onPress={() => setUseCamera(true)}
            disabled={hasCameraPermission ? false : true}
          >
            <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
              {hasCameraPermission ? (
                <Text className="text-sm text-gray-100 font-medium">
                  Record
                </Text>
              ) : (
                <Text className="text-sm text-gray-100 font-medium">
                  Camera Permission not granted
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-7 space-y-2 relative">
          {useCamera && (
            <CameraView
              className="w-full h-72 flex justify-end p-5"
              ref={cameraRef}
              mode="video"
              active={useCamera ? true : false}
              facing={facing}
              videoQuality="480p"
            >
              <TouchableOpacity
                className="absolute top-2 left-5"
                onPress={() => {
                  setFacing(facing === "back" ? "front" : "back");
                }}
              >
                <Image
                  source={icons.camFlip}
                  resizeMode="contain"
                  className="w-10"
                />
              </TouchableOpacity>

              <View>
                <CustomButton
                  title={isRecording ? "Stop Recording" : "Record"}
                  handlePress={isRecording ? stopRecording : recordVideo}
                  containerStyles="mt-7"
                />
              </View>
            </CameraView>
          )}
        </View>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-medium">
            Thumbnail Image
          </Text>

          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-medium">
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FormField
          title="AI Prompt"
          value={form.prompt}
          placeholder="The prompt you used to create this video"
          handleChangeText={(e) => setForm({ ...form, prompt: e })}
          otherStyles="mt-7"
        />

        <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
