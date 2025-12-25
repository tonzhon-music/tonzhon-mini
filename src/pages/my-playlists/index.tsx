import PlaylistGroup from "@/components/playlist-group";
import { useAuthStore } from "@/store";
import { Button, SafeArea, type TabPaneProps, Tabs } from "@nutui/nutui-react-taro";
import { ScrollView, View } from "@tarojs/components";
import { useRouter } from "@tarojs/taro";
import { useEffect, useState } from "react";
import Player from "@/components/player";
import { Plus } from "@nutui/icons-react-taro";
import CreatePlaylistPopup from "@/components/create-playlist-popup";

import "./index.scss";

type Tab = "created" | "collected";

export default function MyPlaylists() {
  const {
    params: { tab },
  } = useRouter<{ tab?: Tab }>();
  const myPlaylists = useAuthStore((state) => state.user?.playlists);
  const collectedPlaylists = useAuthStore((state) => state.user?.collectedPlaylists);
  const [currentTab, setCurrentTab] = useState<Tab>("created");
  const openCreatePlaylistPopup = useAuthStore((state) => state.openCreatePlaylistPopup);

  const tabs: Array<Partial<TabPaneProps & { children: React.ReactNode }>> = [
    {
      title: "自建歌单",
      value: "created",
      children: (
        <PlaylistGroup
          playlists={myPlaylists ?? []}
          extra={
            <Button
              size="mini"
              type="warning"
              icon={<Plus size={10} color="#ffffff" />}
              style={{
                marginRight: 8,
              }}
              onClick={() => {
                openCreatePlaylistPopup();
              }}
            >
              新建歌单
            </Button>
          }
        />
      ),
    },
    {
      title: "收藏歌单",
      value: "collected",
      children: <PlaylistGroup playlists={collectedPlaylists ?? []} />,
    },
  ];

  useEffect(() => {
    if (tab) {
      // 如果跳转过来带 tab, 那么切换到对应 tab
      setCurrentTab(tab);
    }
  }, [tab]);

  return (
    <ScrollView scrollY>
      <Tabs
        value={currentTab}
        onChange={(value) => {
          setCurrentTab(value as Tab);
        }}
      >
        {tabs.map(({ title, value }) => (
          <Tabs.TabPane key={value} title={title} value={value} />
        ))}
      </Tabs>
      <View className="my-playlists-container">{tabs.find((t) => t.value === currentTab)?.children}</View>

      <CreatePlaylistPopup />

      <SafeArea position="bottom" />
      <Player />
    </ScrollView>
  );
}
