import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { type Artist, getSongsOfArtist, type Song } from "@/api";
import { Avatar, SafeArea } from "@nutui/nutui-react-taro";
import SongList from "@/components/song-list";
import { useEffect, useState } from "react";
import Player from "@/components/player";

import "./index.scss";

export default function Artist() {
  const {
    params: { name, pic },
  } = useRouter<Artist>();
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (name) {
      Taro.showLoading({
        title: "获取歌曲中",
      });
      getSongsOfArtist(name)
        .then((res) => {
          if (Array.isArray(res.data.songs)) {
            setSongs(res.data?.songs ?? []);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Taro.showToast({
            title: "获取歌曲失败",
            icon: "error",
          });
        })
        .finally(() => {
          Taro.hideLoading();
        });
    }
  }, [name]);

  return (
    <ScrollView>
      <View className="artist-container">
        <View className="artist-info">
          <Avatar size="96" src={pic} shape="round" />
          <Text className="artist-info-name">{name}</Text>
        </View>

        <SongList songs={songs} title="歌曲" />
      </View>

      <SafeArea position="bottom" />

      <Player />
    </ScrollView>
  );
}
