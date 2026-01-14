import PlaylistGroup from "@/components/playlist-group";
import { useAuthStore, useReviewerStore } from "@/store";
import { Button, SafeArea, type TabPaneProps, Tabs } from "@nutui/nutui-react-taro";
import { ScrollView, View } from "@tarojs/components";
import { useRouter } from "@tarojs/taro";
import { useEffect, useState } from "react";
import Player from "@/components/player";
import { Plus } from "@nutui/icons-react-taro";
import CreatePlaylistPopup from "@/components/create-playlist-popup";
import Instrument from "@/components/instrument";

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
  const isReviewed = useReviewerStore((state) => state.isReviewed);

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

  if (!isReviewed) {
    return (
      <Instrument
        title="琴"
        description="中国琴主要指古琴（亦称“琴”），是中国最古老的弹拨乐器之一，历史超过三千年，是文人雅士“琴棋书画”四艺之首，音色深沉、余音悠远，有七弦并配有十三徽（音位），承载着深厚的文化底蕴，现已列入世界非物质文化遗产。除了古琴，中国常见的“琴”类乐器还包括古筝（筝）和阮（阮咸），它们都是历史悠久、独具特色的拨弦乐器。 "
      />
    );
  }

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
