import { Avatar, Cell, Progress, SafeArea, pxTransform } from "@nutui/nutui-react-taro";
import { View, Text } from "@tarojs/components";
import { Image, PlayStart, IconFont, PlayStop, HeartF, Heart, Category } from "@nutui/icons-react-taro";
import { useMemo, useState } from "react";
import PlayerQueuePopup from "@/components/player-queue-popup";
import { usePlayerStore, backgroundAudioManager, playBackgroundAudioManager } from "@/store";
import Taro, { useRouter } from "@tarojs/taro";
import { useAuth, useFavorite, usePlayer } from "@/hooks";
import { formatSongDurationToPercent } from "@/utils";

import "./index.scss";

export default function Player() {
  const [showPlayerQueuePopup, setShowPlayerQueuePopup] = useState(false);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playbackProgress = usePlayerStore((state) => state.playbackProgress);
  const { playNextSong, playPreviousSong } = usePlayer();
  const { checkLogin } = useAuth();
  const { checkSongFavorite, favoriteSong, unFavoriteSong } = useFavorite();
  const { path } = useRouter();
  // 当前页面是否包含在 tabbar 中
  const isInTabbarPage = useMemo(() => {
    return ["/pages/index/index", "/pages/profile/index"].includes(path);
  }, [path]);

  return (
    <View className="player">
      <Progress
        strokeWidth="3"
        percent={formatSongDurationToPercent(playbackProgress, backgroundAudioManager.duration)}
        color="var(--nutui-color-primary)"
      />
      <Cell className="player-cell song-cell">
        <View
          className="song-info"
          // 这里用 flex 撑满左边的空间, 以便点击区域更大
          style={{ flex: 1 }}
          onClick={() => {
            // 跳转到全屏播放页面
            if (currentSong) {
              Taro.navigateTo({
                url: "/pages/player-full/index",
              });
            } else {
              Taro.showToast({
                title: "暂无播放歌曲",
                icon: "none",
              });
            }
          }}
        >
          <Avatar src={currentSong?.cover} icon={currentSong ? undefined : <Image />} shape="square" size="normal" />
          <View className="song-label">
            <Text className="song-label-name ellipsis">{currentSong?.name || "暂无歌曲"}</Text>
            <Text className="song-label-artist ellipsis">
              {currentSong?.artists?.map((a) => a.name).join(" / ") || "未知歌手"}
            </Text>
          </View>
        </View>
        <View className="song-actions">
          {checkSongFavorite(currentSong) ? (
            <HeartF
              size={20}
              color="#ff4d4f"
              style={{ marginRight: pxTransform(4) }}
              onClick={(e) => {
                e.stopPropagation();
                checkLogin().then(() => {
                  if (currentSong) {
                    unFavoriteSong(currentSong);
                  } else {
                    Taro.showToast({
                      title: "暂无播放歌曲",
                      icon: "none",
                    });
                  }
                });
              }}
            />
          ) : (
            <Heart
              size={20}
              style={{ marginRight: pxTransform(8) }}
              onClick={(e) => {
                e.stopPropagation();
                checkLogin().then(() => {
                  if (currentSong) {
                    favoriteSong(currentSong);
                  } else {
                    Taro.showToast({
                      title: "暂无播放歌曲",
                      icon: "none",
                    });
                  }
                });
              }}
            />
          )}

          <IconFont
            fontClassName="iconfont"
            classPrefix="icon"
            name="shangyishoushangyige"
            size={22}
            style={{ marginTop: pxTransform(4) }}
            onClick={() => {
              if (currentSong) {
                playPreviousSong();
              } else {
                Taro.showToast({
                  title: "暂无播放歌曲",
                  icon: "none",
                });
              }
            }}
          />
          {isPlaying ? (
            <PlayStop
              size={28}
              onClick={() => {
                if (currentSong) {
                  backgroundAudioManager.pause();
                } else {
                  Taro.showToast({
                    title: "暂无播放歌曲",
                    icon: "none",
                  });
                }
              }}
            />
          ) : (
            <PlayStart
              size={28}
              onClick={() => {
                if (currentSong) {
                  playBackgroundAudioManager();
                } else {
                  Taro.showToast({
                    title: "暂无播放歌曲",
                    icon: "none",
                  });
                }
              }}
            />
          )}
          <IconFont
            fontClassName="iconfont"
            classPrefix="icon"
            name="xiayigexiayishou"
            size={22}
            style={{ marginTop: pxTransform(4) }}
            onClick={() => {
              if (currentSong) {
                playNextSong();
              } else {
                Taro.showToast({
                  title: "暂无播放歌曲",
                  icon: "none",
                });
              }
            }}
          />
          <Category
            size={20}
            style={{ marginLeft: pxTransform(4) }}
            onClick={() => {
              setShowPlayerQueuePopup(true);
            }}
          />
        </View>
      </Cell>
      <PlayerQueuePopup
        visible={showPlayerQueuePopup}
        onClose={() => {
          setShowPlayerQueuePopup(false);
        }}
      />
      {/* tabbar 页面不需要 SafeArea */}
      {isInTabbarPage ? null : <SafeArea position="bottom" className="player-safe-area" />}
    </View>
  );
}
