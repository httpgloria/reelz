import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  VirtualizedList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../../constants";

import SearchInput from "../../components/SearchInput";
import Trending from "../../components/Trending";
import EmptyState from "../../components/EmptyState";
import { getAllPosts, getLatestPosts } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import VideoCard from "../../components/VideoCard";

import { useGlobalContext } from "../../context/GlobalProvider";

const Home = () => {
  const { user, setLikes } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(getAllPosts);
  const { data: latestPosts, isLoading } = useAppwrite(getLatestPosts);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await refetch();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      let likedPosts = posts.filter((post) => {
        const found = post.liked.find((obj) => obj.$id == user.$id);
        return found !== undefined;
      });
      setLikes(likedPosts);
    } else {
      ("no data");
    }
  }, [posts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        renderItem={({ item }) => <VideoCard video={item} />}
        keyExtractor={(item) => item.$id}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-medium text-sm text-gray-100">
                  Welcome back,
                </Text>
                <Text className="text-2xl font-semibold text-white">
                  {user?.username}
                </Text>
              </View>

              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput type="home" />

            <View className="w-full flex-1 pt-5">
              <Text className="text-gray-100 text-lg font-regular mb-3">
                Latest Videos
              </Text>
            </View>
            <View className="w-full flex-1 pb-8">
              {isLoading ? (
                <Text className="text-gray-100 text-sm font-regular mb-3">
                  Loading...
                </Text>
              ) : latestPosts?.length > 0 ? (
                <Trending posts={latestPosts} />
              ) : (
                <Text>No posts available</Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="Be the first one to upload a video"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Home;
