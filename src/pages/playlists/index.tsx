import PlaylistGroup from "@/components/playlist-group";
import { ScrollView, View, Text } from "@tarojs/components";
import { SafeArea, Tabs, TabPaneProps, Pagination, Tag, Badge } from "@nutui/nutui-react-taro";
import Player from "@/components/player";
import { useEffect, useMemo, useState } from "react";
import Taro, { useReachBottom } from "@tarojs/taro";
import { getPlaylists, getPlaylistsTotal, getRecommendPlaylists, type Playlist } from "@/api";
import { PLAYLIST_PAGE_SIZE } from "@/constants";

import "./index.scss";

type Tab = "recommend" | "all";

// 歌单列表页面
export default function Playlists() {
  const [recommendPlaylists, setRecommendPlaylists] = useState<Playlist[]>([]);
  const [tab, setTab] = useState<Tab>("recommend");
  const [page, setPage] = useState<number>(1);
  const [allTotal, setAllTotal] = useState<number>(0);
  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
  const skipIndex = useMemo(() => (page - 1) * PLAYLIST_PAGE_SIZE, [page]);

  const tabs: Array<Partial<TabPaneProps & { children: React.ReactNode }>> = [
    {
      title: "推荐歌单",
      value: "recommend",
      children: <PlaylistGroup playlists={recommendPlaylists} />,
    },
    {
      title: "全部歌单",
      value: "all",
      children: <PlaylistGroup playlists={allPlaylists} extra={<Text className="total-text">共 {allTotal} 张</Text>} />,
    },
  ];

  useReachBottom(() => {
    if (tab === "all") {
      setPage((prevPage) => prevPage + 1);
    }
  });

  useEffect(() => {
    Taro.showLoading({
      title: "加载推荐歌单中",
    });
    getRecommendPlaylists()
      .then((res) => {
        if (res.data.success) {
          setRecommendPlaylists(res.data.playlists);
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        Taro.showToast({
          title: "获取推荐歌单失败",
        });
      })
      .finally(() => {
        Taro.hideLoading();
      });
  }, []);

  useEffect(() => {
    // 获取所有歌单总数
    getPlaylistsTotal().then((res) => {
      setAllTotal(res.data.total ?? 0);
    });
  }, []);

  useEffect(() => {
    // 获取当前页码下的歌单
    getPlaylists(skipIndex).then((res) => {
      if (res.data.success) {
        setAllPlaylists((prevAllPlaylists) => [...prevAllPlaylists, ...res.data.playlists]);
      } else {
        throw new Error();
      }
    });
  }, [skipIndex]);

  return (
    <ScrollView scrollY>
      <Tabs
        value={tab}
        onChange={(value) => {
          setTab(value as Tab);
        }}
      >
        {tabs.map(({ title, value }) => (
          <Tabs.TabPane title={title} key={title} value={value} />
        ))}
      </Tabs>

      <View className="playlists-container">{tabs.find(({ value }) => value === tab)?.children}</View>

      <SafeArea position="bottom" />
      <Player />
    </ScrollView>
  );
}
