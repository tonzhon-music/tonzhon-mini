import { Song } from "@/api";
import { ScrollView, View, Text } from "@tarojs/components";
import { Cell, Divider, Popup, pxTransform } from "@nutui/nutui-react-taro";
import {
  Articles,
  Copy,
  Del,
  Heart,
  HeartF,
  Hi,
  Link,
  Pin,
  PlayDoubleForward,
  Share,
  User,
  Videos,
} from "@nutui/icons-react-taro";
import { useAuth, useFavorite, usePlayer } from "@/hooks";
import { copySongInfoToClipboard, copySongLinkToClipboard, downloadAndShareLyric, downloadAndShareSong } from "@/utils";
import { useAuthStore, usePlayerStore } from "@/store";
import { useState } from "react";

import PlaylistPickerPopup from "../playlist-picker-popup";

import "./index.scss";
import LoginPopup from "../login-popup";
import PlaybackRatePopup from "../playback-rate-popup";

type SongActionsPopupProps = {
  song?: Song;
  visible: boolean;
  onClose: () => void;
  // 接收上游传来的删除回调, 一般是 SongList 传递进来的
  deleteAction?: (song?: Song) => void;
};

// 歌曲列表或者播放器全屏点击右边的更多图标打开, 这里的 visible 没有做成全局状态, 在各自组件内部实现
export default function SongActionsPopup({ song, visible, onClose, deleteAction }: SongActionsPopupProps) {
  const { checkSongFavorite, favoriteSong, unFavoriteSong } = useFavorite();
  const { checkLogin } = useAuth();
  const { addSongToQueue } = usePlayer();
  const showPlaylistPickerPopup = useAuthStore((state) => state.showPlaylistPickerPopup);
  const { openPlaylistPickerPopup, closePlaylistPickerPopup } = useAuthStore();
  const [showPlaybackRatePopup, setShowPlaybackRatePopup] = useState(false);
  const playbackRate = usePlayerStore((state) => state.playbackRate);

  return (
    <>
      <Popup
        title="歌曲操作"
        position="bottom"
        visible={visible}
        round
        onClose={() => {
          onClose();
        }}
        closeable
      >
        <ScrollView scrollY style={{ height: pxTransform(300) }}>
          <View className="song-actions-popup-container">
            <Cell.Group divider={false}>
              <Cell
                title={
                  <View className="song-actions-popup-title">
                    <Hi />
                    <Text userSelect>歌曲: {song?.name ?? "未知"}</Text>
                  </View>
                }
              />
              <Cell
                title={
                  <View className="song-actions-popup-title">
                    <User />
                    <Text userSelect>歌手: {song?.artists?.map((artist) => artist.name).join(", ") ?? "未知"}</Text>
                  </View>
                }
              />
              <Cell
                title={
                  <View className="song-actions-popup-title">
                    <Videos />
                    <Text userSelect>专辑: {song?.album?.name ?? "未知"}</Text>
                  </View>
                }
              />

              <Divider className="divider-small" />

              <Cell
                clickable
                onClick={() => {
                  if (song) {
                    addSongToQueue(song);
                    onClose();
                  }
                }}
                title={
                  <View className="song-actions-popup-title">
                    <Pin />
                    <Text>下一首播放</Text>
                  </View>
                }
              />
              <Cell
                clickable
                onClick={() => {
                  setShowPlaybackRatePopup(true);
                }}
                title={
                  <View className="song-actions-popup-title">
                    <PlayDoubleForward />
                    <Text>倍速: {playbackRate.toFixed(1)}X</Text>
                  </View>
                }
              />

              <Divider className="divider-small" />

              <Cell
                clickable
                onClick={() => {
                  const isFavorite = checkSongFavorite(song);
                  const action = isFavorite ? unFavoriteSong : favoriteSong;

                  checkLogin().then(() => {
                    action(song);
                    onClose();
                  });
                }}
                title={
                  <View className="song-actions-popup-title">
                    {checkSongFavorite(song) ? <HeartF color="#ff4d4f" /> : <Heart />}
                    <Text>{checkSongFavorite(song) ? "取消喜欢" : "喜欢"}</Text>
                  </View>
                }
              />
              <Cell
                clickable
                onClick={() => {
                  checkLogin().then(() => {
                    openPlaylistPickerPopup();
                    onClose();
                  });
                }}
                title={
                  <View className="song-actions-popup-title">
                    <Articles />
                    <Text>添加到歌单</Text>
                  </View>
                }
              />
              <Cell
                clickable
                onClick={() => {
                  downloadAndShareSong(song);
                  onClose();
                }}
                title={
                  <View className="song-actions-popup-title">
                    <Share />
                    <Text>下载歌曲并分享到微信</Text>
                  </View>
                }
              />
              <Cell
                clickable
                onClick={() => {
                  downloadAndShareLyric(song);
                  onClose();
                }}
                title={
                  <View className="song-actions-popup-title">
                    <Text>词</Text>
                    <Text>下载歌词并分享到微信</Text>
                  </View>
                }
              />

              <Cell
                clickable
                onClick={() => {
                  copySongLinkToClipboard(song)?.then(() => {
                    onClose();
                  });
                }}
                title={
                  <View className="song-actions-popup-title">
                    <Link />
                    <Text>复制歌曲链接</Text>
                  </View>
                }
              />
              <Cell
                clickable
                onClick={() => {
                  copySongInfoToClipboard(song)?.then(() => {
                    onClose();
                  });
                }}
                title={
                  <View className="song-actions-popup-title">
                    <Copy />
                    <Text>复制歌曲信息</Text>
                  </View>
                }
              />
              {deleteAction ? (
                <Cell
                  clickable
                  onClick={() => {
                    deleteAction?.(song);
                    onClose();
                  }}
                  title={
                    <View className="song-actions-popup-title">
                      <Del />
                      <Text>删除</Text>
                    </View>
                  }
                />
              ) : null}
            </Cell.Group>
          </View>
        </ScrollView>
      </Popup>

      <PlaylistPickerPopup
        visible={showPlaylistPickerPopup}
        onClose={() => {
          closePlaylistPickerPopup();
        }}
        songToAdd={song}
      />

      <PlaybackRatePopup
        visible={showPlaybackRatePopup}
        onClose={() => {
          setShowPlaybackRatePopup(false);
        }}
      />

      <LoginPopup />
    </>
  );
}
