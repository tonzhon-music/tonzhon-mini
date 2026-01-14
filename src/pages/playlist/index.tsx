import Player from "@/components/player";
import { ScrollView, View, Text } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { type PlaylistInfo, getPlaylistInfo, removeSongFromMyPlaylist } from "@/api";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Avatar, Cell, SafeArea } from "@nutui/nutui-react-taro";
import { getPlaylistCoverUrl, formatCount } from "@/utils";
import { Heart, HeartF, Image, Service, Share } from "@nutui/icons-react-taro";
import SongList from "@/components/song-list";
import { useAuth, usePlayer, usePlaylistCollection } from "@/hooks";
import { useAuthStore, useReviewerStore } from "@/store";
import Instrument from "@/components/instrument";

import "./index.scss";

export default function Playlist() {
  const {
    params: { id },
  } = useRouter<{ id: string }>();
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo>();
  const { resetSongs } = usePlayer();
  const { checkPlaylistCollected, collectPlaylist } = usePlaylistCollection();
  const myPlaylists = useAuthStore((state) => state.user?.playlists);
  // 判断该歌单是否是我的歌单
  const isMyPlaylist = useMemo(() => (myPlaylists ?? []).some((p) => p.id === id), [id, myPlaylists]);
  const [updateState, forceUpdate] = useReducer((x) => x + 1, 0);
  const { checkLogin } = useAuth();
  const isReviewed = useReviewerStore((state) => state.isReviewed);

  const deleteSongFromMyPlaylist = useCallback(
    (newId?: string) => {
      if (id && newId) {
        removeSongFromMyPlaylist(id, newId)
          .then((res) => {
            if (res.data.success) {
              Taro.showToast({
                title: "移除成功",
                icon: "success",
              });
            } else {
              throw new Error();
            }
          })
          .catch(() => {
            Taro.showToast({
              title: "移除失败",
              icon: "error",
            });
          })
          .finally(() => {
            // 重新获取歌单信息
            forceUpdate();
          });
      }
    },
    [id]
  );

  useEffect(() => {
    if (id) {
      Taro.showLoading({
        title: "获取歌单信息中",
      });
      getPlaylistInfo(id)
        .then((res) => {
          if (res.data.success) {
            setPlaylistInfo(res.data.playlist);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Taro.showToast({
            title: "获取歌单失败",
            icon: "error",
          });
        })
        .finally(() => {
          Taro.hideLoading();
        });
    }
  }, [id, updateState]);

  if (!isReviewed) {
    return (
      <Instrument
        title="编钟"
        description="编钟是中国的传统打击乐器，始于青铜器时代。编钟由青铜铸成，由不同的钟依照大小排列，并悬挂在一个巨大的钟架上。编钟常与编磬组合使用；“金石之声”中的“金”就是指编钟，“石”指编磬。"
      />
    );
  }

  return (
    <ScrollView>
      <View className="playlist-container">
        <Cell.Group className="playlist-info-container">
          <Cell className="playlist-info-cell">
            <Avatar
              size="80"
              shape="square"
              src={playlistInfo?.cover ? getPlaylistCoverUrl(playlistInfo?.cover) : undefined}
              icon={playlistInfo?.cover ? undefined : <Image />}
            />
            <View className="playlist-info-details">
              <Text className="playlist-name">{playlistInfo?.name}</Text>
              <Text>创建者: {playlistInfo?.author}</Text>
            </View>
          </Cell>
          <Cell className="playlist-actions-cell">
            <View
              className="playlist-action-item"
              onClick={() => {
                resetSongs(playlistInfo?.songs ?? []);
              }}
            >
              <Service size={20} />
              <Text>{formatCount(playlistInfo?.playCount)}</Text>
            </View>
            <View
              className="playlist-action-item"
              onClick={() => {
                checkLogin().then(() => {
                  const isCollected = checkPlaylistCollected(playlistInfo);

                  if (!isCollected) {
                    collectPlaylist(playlistInfo);
                    // TODO: 收藏量也要改变一下
                  } else {
                    // TODO: 暂无取消收藏歌单
                  }
                });
              }}
            >
              {checkPlaylistCollected(playlistInfo) ? <HeartF color="#ff4d4f" size={20} /> : <Heart size={20} />}
              <Text>{formatCount(playlistInfo?.collectCount)}</Text>
            </View>
            <View
              className="playlist-action-item"
              onClick={() => {
                Taro.setClipboardData({
                  data: `https://tonzhon.whamon.com/playlist/${id}`,
                  success: () => {
                    Taro.showToast({
                      title: "歌单链接已复制",
                      icon: "success",
                    });
                  },
                });
              }}
            >
              <Share size={20} />
              <Text>分享</Text>
            </View>
          </Cell>
        </Cell.Group>

        <SongList
          songs={playlistInfo?.songs ?? []}
          title="歌曲"
          deleteAction={isMyPlaylist ? (song) => deleteSongFromMyPlaylist(song?.newId) : undefined}
        />
      </View>

      <SafeArea position="bottom" />
      <Player />
    </ScrollView>
  );
}
