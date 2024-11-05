import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { icons } from "../constants";

import { ResizeMode, Video } from "expo-av";
import { useGlobalContext } from "../context/GlobalProvider";
import { updateLikes } from "../lib/appwrite";

const VideoCard = ({
  video: {
    title,
    thumbnail,
    video,
    $id,
    liked,
    users: { username, avatar },
  },
}) => {
  const { user, likes, setLikes } = useGlobalContext();
  const [play, setPlay] = useState(false);

  const addLike = async () => {
    try {
      if (likes.find((obj) => obj.$id == user.$id) !== undefined) {
        console.log("unlike:", $id);
        await updateLikes($id, user.$id, "unliked");
        const updatedLikes = likes.filter((video) => video.$id !== $id);
        setLikes(updatedLikes);
        console.log("unlike updated successfully");
      } else {
        console.log("like:", $id);
        const updatedPost = await updateLikes($id, user.$id, "liked");
        setLikes([...likes, updatedPost]);
        console.log("like updated successfully!");
      }
    } catch (error) {
      console.log(error.message);
    }
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
          <TouchableOpacity onPress={addLike}>
            {likes.find((video) => video.$id === $id) ? (
              <Image
                source={icons.heartFull}
                className="w-5 h-5"
                resizeMode="contain"
              />
            ) : (
              <Image
                source={icons.heartLine}
                className="w-5 h-5"
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
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
