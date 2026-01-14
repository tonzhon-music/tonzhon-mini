import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { type Artist, getSongsOfArtist, type Song } from "@/api";
import { Avatar, SafeArea } from "@nutui/nutui-react-taro";
import SongList from "@/components/song-list";
import { useEffect, useState } from "react";
import Player from "@/components/player";
import { useReviewerStore } from "@/store";
import Instrument from "@/components/instrument";

import "./index.scss";

export default function Artist() {
  const {
    params: { name, pic },
  } = useRouter<Artist>();
  const [songs, setSongs] = useState<Song[]>([]);
  const isReviewed = useReviewerStore((state) => state.isReviewed);

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

  if (!isReviewed) {
    return (
      <Instrument
        title="萧"
        description="箫又称洞箫、长箫、箫管，是中国古老的吹管乐器，特征为单管、竖吹、开管、边棱音发声[1]。“箫”字在唐代以前本指排箫，唐宋以来，由于单管竖吹的箫日渐流行，便称编管箫为排箫，以示区别[2]。至于“洞箫”之名，则来自于箫管底端之开孔[3]。 其音色圆润轻柔，幽静典雅，常用于独奏、琴箫合奏或丝竹乐演奏。"
      />
    );
  }

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
