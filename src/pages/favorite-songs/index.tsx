import { ScrollView, View } from "@tarojs/components";
import { SafeArea } from "@nutui/nutui-react-taro";
import Player from "@/components/player";
import SongList from "@/components/song-list";
import { useAuthStore } from "@/store";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { useAuth, useFavorite } from "@/hooks";

import "./index.scss";

export default function FavoriteSongs() {
  const favoriteSongs = useAuthStore((state) => state.favoriteSongs);
  const { refreshFavoriteSongs } = useAuth();
  const login = useAuthStore((state) => state.login);
  const { unFavoriteSong } = useFavorite();

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
