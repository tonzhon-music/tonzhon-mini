import { ScrollView, View } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro, { usePullDownRefresh, useRouter } from "@tarojs/taro";
import { type Song, getHotSongs, getNewSongs } from "@/api";
import SongList from "@/components/song-list";
import Player from "@/components/player";
import { SafeArea } from "@nutui/nutui-react-taro";

import "./index.scss";

type RecommendType = "hot" | "new";

// 热门和最新歌曲
export default function Recommend() {
  const [recommendSongs, setRecommendSongs] = useState<Song[]>([]);
  const [recommendTitle, setRecommendTitle] = useState<string>("推荐歌曲");
  const {
    params: { type },
  } = useRouter<{ type: RecommendType }>();

  usePullDownRefresh(() => {
    const fetchRecommendSongs = type === "new" ? getNewSongs : getHotSongs;

    if (!recommendTitle) {
      setRecommendTitle(type === "new" ? "最新歌曲" : "热门歌曲");
    }

    // 手动触发下拉刷新
    fetchRecommendSongs()
      .then((res) => {
        if (res.data.success) {
          if (Array.isArray(res.data?.songs)) {
            Taro.showToast({
              title: "刷新成功",
              icon: "success",
            });
            setRecommendSongs(res.data?.songs);
          }
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
        Taro.stopPullDownRefresh();
      });
  });

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const eventChannel = currentPage.getOpenerEventChannel();

    eventChannel.on("hotSongs", ({ title = "推荐歌曲", songs = [] }: { title: string; songs: Song[] }) => {
      // 监听首页传递过来的数据复用
      setRecommendTitle(title);
      setRecommendSongs(songs);
    });
  }, []);

  return (
    <ScrollView scrollY>
      <View className="recommend-container">
        <SongList title={recommendTitle} songs={recommendSongs} />
      </View>

      <SafeArea position="bottom" />

      <Player />
    </ScrollView>
  );
}
