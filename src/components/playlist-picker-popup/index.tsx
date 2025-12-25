import { Avatar, Cell, Popup, pxTransform } from "@nutui/nutui-react-taro";
import { ScrollView, View, Text } from "@tarojs/components";
import { useAuthStore } from "@/store";
import { Image, Plus } from "@nutui/icons-react-taro";
import { getPlaylistCoverUrl } from "@/utils";
import { addSongToMyPlaylist, type Song } from "@/api";
import Taro from "@tarojs/taro";

import "./index.scss";
import CreatePlaylistPopup from "../create-playlist-popup";

type PlaylistPickerPopupProps = {
  visible: boolean;
  onClose: () => void;
  songToAdd?: Song;
};

// 添加歌曲到歌单的时候展示的 popup
export default function PlaylistPickerPopup({ visible, onClose, songToAdd }: PlaylistPickerPopupProps) {
  const myPlaylists = useAuthStore((state) => state.user?.playlists) ?? [];
  const openCreatePlaylistPopup = useAuthStore((state) => state.openCreatePlaylistPopup);

  return (
    <>
      <Popup visible={visible} onClose={onClose} position="bottom" title="添加歌曲到歌单" closeable>
        <ScrollView scrollY style={{ maxHeight: pxTransform(350) }}>
          <View className="playlist-picker-container">
            <Cell.Group>
              <Cell
                clickable
                onClick={() => {
                  // 打开创建歌单的 popup
                  openCreatePlaylistPopup(songToAdd);
                  onClose();
                }}
              >
                <View className="playlist-info">
                  <Avatar icon={<Plus />} shape="square" />
                  <Text>新建歌单</Text>
                </View>
              </Cell>
              {myPlaylists.map(({ name, id, cover }) => (
                <Cell
                  key={id}
                  clickable
                  onClick={() => {
                    if (songToAdd) {
                      addSongToMyPlaylist(id, songToAdd)
                        .then((res) => {
                          if (res.data.success) {
                            Taro.showToast({
                              title: "已添加到歌单",
                              icon: "success",
                            });
                            onClose();
                          } else {
                            throw new Error();
                          }
                        })
                        .catch(() => {
                          Taro.showToast({
                            title: "添加到歌单失败",
                            icon: "error",
                          });
                        });
                    }
                  }}
                >
                  <View className="playlist-info">
                    <Avatar
                      src={cover ? getPlaylistCoverUrl(cover) : undefined}
                      icon={cover ? undefined : <Image />}
                      shape="square"
                    />
                    <Text className="ellipsis">{name}</Text>
                  </View>
                </Cell>
              ))}
            </Cell.Group>
          </View>
        </ScrollView>
      </Popup>

      <CreatePlaylistPopup />
    </>
  );
}
