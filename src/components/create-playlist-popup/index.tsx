import { useAuthStore } from "@/store";
import { Input, Popup } from "@nutui/nutui-react-taro";
import { View, Text } from "@tarojs/components";
import { useRef } from "react";
import Taro from "@tarojs/taro";
import { addSongToMyPlaylist, createPlaylist } from "@/api";
import { useAuth } from "@/hooks";

import "./index.scss";

export default function CreatePlaylistPopup() {
  const showCreatePlaylistPopup = useAuthStore((state) => state.showCreatePlaylistPopup);
  const songForCreatePlaylistPopup = useAuthStore((state) => state.songForCreatePlaylistPopup);
  const { closeCreatePlaylistPopup } = useAuthStore();
  const { refreshUserInfo } = useAuth();
  const inputRef = useRef<any>();

  return (
    <Popup
      // 自动清空 input 内容
      destroyOnClose
      className="create-playlist-popup"
      title="新建歌单"
      position="bottom"
      visible={showCreatePlaylistPopup}
      round
      onClose={() => {
        closeCreatePlaylistPopup();
      }}
      closeable
      closeIcon={<Text style={{ color: "#dc8f03" }}>创建</Text>}
      left={
        <Text
          onClick={() => {
            closeCreatePlaylistPopup();
          }}
        >
          取消
        </Text>
      }
      onCloseIconClick={() => {
        const name = inputRef.current?.nativeElement?.value?.trim();

        if (!name) {
          Taro.showToast({
            title: "歌单名称不能为空",
            icon: "none",
          });
        } else {
          Taro.showLoading({
            title: "创建歌单中...",
          });
          createPlaylist(name)
            .then((res) => {
              if (res.data.playlistId) {
                if (songForCreatePlaylistPopup) {
                  // 如果提供了歌曲, 则添加到歌单
                  addSongToMyPlaylist(res.data.playlistId, songForCreatePlaylistPopup)
                    .then((r) => {
                      if (r.data.success) {
                        Taro.showToast({
                          title: "创建歌单并添加歌曲成功",
                          icon: "none",
                        });
                        closeCreatePlaylistPopup();
                        // 跳转到最新创建的歌单页面
                        Taro.navigateTo({
                          url: `/pages/playlist/index?id=${res.data.playlistId}`,
                        });
                      }
                    })
                    .catch(() => {
                      Taro.showToast({
                        title: "创建歌单成功, 但添加歌曲失败, 请手动添加",
                        icon: "none",
                      });
                    });
                } else {
                  Taro.showToast({
                    title: "创建歌单成功",
                    icon: "success",
                  });
                  closeCreatePlaylistPopup();
                  // 跳转到新建的歌单页面
                  Taro.navigateTo({
                    url: `/pages/playlist/index?id=${res.data.playlistId}`,
                  });
                }
              }
            })
            .catch(() => {
              Taro.showToast({
                title: "创建歌单失败",
                icon: "error",
              });
            })
            .finally(() => {
              // 更新用户信息
              refreshUserInfo();
              Taro.hideLoading();
            });
        }
      }}
    >
      <View className="create-playlist-popup-container">
        <Input ref={inputRef} clearable placeholder="输入歌单名称" maxLength={20} />
      </View>
    </Popup>
  );
}
