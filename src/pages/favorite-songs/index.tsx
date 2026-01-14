import { ScrollView, View } from "@tarojs/components";
import { SafeArea } from "@nutui/nutui-react-taro";
import Player from "@/components/player";
import SongList from "@/components/song-list";
import { useAuthStore, useReviewerStore } from "@/store";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { useAuth, useFavorite } from "@/hooks";
import Instrument from "@/components/instrument";

import "./index.scss";

export default function FavoriteSongs() {
  const favoriteSongs = useAuthStore((state) => state.favoriteSongs);
  const { refreshFavoriteSongs } = useAuth();
  const login = useAuthStore((state) => state.login);
  const { unFavoriteSong } = useFavorite();
  const isReviewed = useReviewerStore((state) => state.isReviewed);

  usePullDownRefresh(() => {
    refreshFavoriteSongs().finally(() => {
      Taro.showToast({
        title: "刷新数据成功",
        icon: "none",
      });
    });
  });

  useDidShow(() => {
    // 页面路由拦截
    if (!login) {
      Taro.switchTab({
        url: "pages/index/index",
      }).then(() => {
        Taro.showToast({
          title: "暂无权限访问, 已跳转到首页",
          icon: "none",
        });
      });
    }
  });

  if (!isReviewed) {
    return (
      <Instrument
        title="瑟"
        description="中国瑟（sè）是一种历史悠久的古老弹拨乐器，形似宽大的长方形木质共鸣箱，通常有25根弦，用双手弹奏，在古代常与古琴合称“琴瑟”，是周代至汉代盛行的礼乐之器，对琴、筝等乐器发展影响深远，后逐渐失传，今多见于文物和复原品。 "
      />
    );
  }

  return (
    <ScrollView scrollY>
      <View className="favorite-songs-container">
        <SongList songs={favoriteSongs} deleteAction={unFavoriteSong} deleteText="取消喜欢" />
      </View>

      <SafeArea position="bottom" />
      <Player />
    </ScrollView>
  );
}
