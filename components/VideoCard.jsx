import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { icons } from "../constants";

import { ResizeMode, Video } from "expo-av";
import { useGlobalContext } from "../context/GlobalProvider";
import { createLike, getLikes, deleteLike } from "../lib/appwrite";
import useAppwrite from "../lib/useAppwrite";

const VideoCard = ({
  video: {
    $id,
    title,
    thumbnail,
    video,
    users: { username, avatar },
  },
}) => {
  const { user } = useGlobalContext();
  const { data: likes, setData } = useAppwrite(async () => {
    return await getLikes(user.$id);
  });
  const [play, setPlay] = useState(false);

  // console.log(likes);

  const addLike = async () => {
    try {
      let data = { videoId: $id, userId: user.$id };
      const newLike = await createLike(data);
      console.log("like created successfully");
      setData([...likes, newLike]);
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const unlike = async () => {
    const { $id: documentToDelete } = likes.find(
      (document) => document.videos.$id === $id
    );
    await deleteLike(documentToDelete);
    console.log("like deleted");
    setData(likes.filter((document) => document.$id !== documentToDelete));
  };

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-semibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-regular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        <View className="pt-2">
          {likes.find((document) => document.videos.$id === $id) ? (
            <TouchableOpacity onPress={unlike}>
              <Image
                source={icons.heartFull}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={addLike}>
              <Image
                source={icons.heartLine}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          {/* <TouchableOpacity onPress={addLike}>
          </TouchableOpacity> */}
        </View>
        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>

      {play ? (
        <Video
          source={{
            uri: video,
          }}
          className="w-52 h-72 rounded-[35px] mt-3 bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
