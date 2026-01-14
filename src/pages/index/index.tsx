import { View, Text, ScrollView, Image } from "@tarojs/components";
import { useEffect, useState } from "react";
import Player from "@/components/player";
import { getHotSongs, getNewSongs, type Song } from "@/api";
import Taro from "@tarojs/taro";
import { ArrowRight, Feedback, Internation, Search, User } from "@nutui/icons-react-taro";
import SongList from "@/components/song-list";
import { Cell, Divider } from "@nutui/nutui-react-taro";
import { HEADER_IMAGE_URL } from "@/constants";
import { useReviewerStore } from "@/store";

import Wiki from "./Wiki";
import "./index.scss";

export default function Index() {
  const [hotSongs, setHotSongs] = useState<Song[]>([]);
  const [loadingHostSongs, setLoadingHotSongs] = useState(false);
  const [newSongs, setNewSongs] = useState<Song[]>([]);
  const [loadingNewSongs, setLoadingNewSongs] = useState(false);
  const isReviewed = useReviewerStore((state) => state.isReviewed);

  useEffect(() => {
    setLoadingHotSongs(true);
    getHotSongs()
      .then((res) => {
        if (res.data.success) {
          if (Array.isArray(res.data.songs)) {
            setHotSongs(res.data.songs);
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        Taro.showToast({
          title: "获取热门歌曲失败",
          icon: "error",
        });
      })
      .finally(() => {
        setLoadingHotSongs(false);
      });
  }, []);

  useEffect(() => {
    setLoadingNewSongs(true);
    getNewSongs()
      .then((res) => {
        if (res.data.success) {
          if (Array.isArray(res.data.songs)) {
            setNewSongs(res.data?.songs);
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        Taro.showToast({
          title: "获取最新歌曲失败",
          icon: "error",
        });
      })
      .finally(() => {
        setLoadingNewSongs(false);
      });
  }, []);

  useEffect(() => {
    if (loadingHostSongs || loadingNewSongs) {
      Taro.showLoading({
        title: "加载数据中",
      });
    } else {
      Taro.hideLoading();
    }
  }, [loadingHostSongs, loadingNewSongs]);

  if (!isReviewed) {
    return <Wiki />;
  }

  return (
    <ScrollView scrollY>
      <View className="index-container">
        <Cell className="header">
          <View className="logo">
            <Image src={HEADER_IMAGE_URL} mode="widthFix" />
          </View>
          <Divider />
          <View className="navs">
            <View
              className="nav"
              onClick={() => {
                Taro.navigateTo({
                  url: "/pages/search/index",
                });
              }}
            >
              <Search color="#ffbf00" size="24" />
              <Text>搜索</Text>
            </View>
            <View
              className="nav"
              onClick={() => {
                Taro.navigateTo({
                  url: "/pages/artists/index",
                });
              }}
            >
              <User color="#ffbf00" size="24" />
              <Text>歌手</Text>
            </View>
            <View
              className="nav"
              onClick={() => {
                Taro.navigateTo({
                  url: "/pages/playlists/index",
                });
              }}
            >
              <Feedback color="#ffbf00" size="24" />
              <Text>歌单</Text>
            </View>
            <View
              className="nav"
              onClick={() => {
                Taro.setClipboardData({
                  data: "https://universe.tonzhon.whamon.com/pedia/top-10-musical-instruments-of-ancient-china/",
                  success: () => {
                    Taro.showToast({
                      title: "铜钟百科地址已复制, 请前往浏览器粘贴访问",
                      icon: "none",
                    });
                  },
                });
              }}
            >
              <Internation color="#ffbf00" size="24" />
              <Text>百科</Text>
            </View>
          </View>
        </Cell>
        <SongList
          title="热门歌曲"
          songs={hotSongs}
          // 首页仅展示 5 首歌曲
          showCount={3}
          extra={
            <View
              className="song-list-title-extra"
              onClick={() => {
                Taro.navigateTo({
                  url: "/pages/recommend/index?type=hot",
                  success: (res) => {
                    res.eventChannel.emit("hotSongs", {
                      title: "热门歌曲",
                      songs: hotSongs,
                    });
                  },
                });
              }}
            >
              <Text>更多</Text>
              <ArrowRight size={16} color="#505259" />
            </View>
          }
        />
        <SongList
          title="最新歌曲"
          songs={newSongs}
          // 首页仅展示 5 首歌曲
          showCount={3}
          extra={
            <View
              className="song-list-title-extra"
              onClick={() => {
                Taro.navigateTo({
                  url: "/pages/recommend/index?type=new",
                  success: (res) => {
                    res.eventChannel.emit("hotSongs", {
                      title: "最新歌曲",
                      songs: newSongs,
                    });
                  },
                });
              }}
            >
              <Text>更多</Text>
              <ArrowRight size={16} color="#505259" />
            </View>
          }
        />
      </View>

      <Player />
    </ScrollView>
  );
}
