import { Avatar, Badge, Cell, pxTransform, SafeArea } from "@nutui/nutui-react-taro";
import { View, Text, Image } from "@tarojs/components";
import {
  usePlayerStore,
  backgroundAudioManager,
  useAuthStore,
  useSettingsStore,
  playBackgroundAudioManager,
  useReviewerStore,
} from "@/store";
import {
  Articles,
  Category,
  Copy,
  Heart,
  HeartF,
  IconFont,
  ImageError,
  Link,
  More,
  PlayStart,
  PlayStop,
  Refresh,
  Reload,
  Share,
} from "@nutui/icons-react-taro";
import { useAuth, useFavorite, usePlayer } from "@/hooks";
import { useState } from "react";
import PlayerQueuePopup from "@/components/player-queue-popup";
import { downloadAndShareSong } from "@/utils";
import SongActionsPopup from "@/components/song-actions-popup";
import Taro from "@tarojs/taro";
import Instrument from "@/components/instrument";

import Lyrics from "./Lyrics";
import SeekBar from "./SeekBar";

import "./index.scss";

export default function PlayerFull() {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playbackOrder = usePlayerStore((state) => state.playbackOrder);
  const { playNextSong, playPreviousSong, togglePlaybackOrder } = usePlayer();
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const [showPlayerQueuePopup, setShowPlayerQueuePopup] = useState(false);
  const { checkSongFavorite, favoriteSong, unFavoriteSong } = useFavorite();
  const { checkLogin } = useAuth();
  const [showSongActionsPopup, setShowSongActionsPopup] = useState(false);
  const openPlaylistPickerPopup = useAuthStore((state) => state.openPlaylistPickerPopup);
  const showLyrics = useSettingsStore((state) => state.showLyrics);
  const toggleShowLyrics = useSettingsStore((state) => state.toggleShowLyrics);
  const isReviewed = useReviewerStore((state) => state.isReviewed);

  if (!isReviewed) {
    return (
      <Instrument
        title="笛子"
        description="竹笛，汉族乐器名，中国传统乐器。笛子是中国广为流传的吹奏乐器，因为是用天然竹材制成，所以也称为“竹笛”。竹笛流传地域广大，品种繁多。使用最普遍的有曲笛、梆笛和定调笛。还有玉屏笛、七孔笛、短笛和顺笛等。中国笛子具有强烈的华夏民族特色，发音动情、婉转。龙吟，古人谓“荡涤之声”， 故笛子原名为“涤”。笛子是中国民族乐队中重要的旋律乐器，多用于独奏、主奏，也可参与合奏。"
        src="https://yk2.fenx.top/e/d3d8bafaaef1091fe869a268a7d4ed82.jpeg"
      />
    );
  }

  return (
    <View className="player-full-container">
      <View className="player-full-info">
        <Avatar
          src={currentSong?.cover ? currentSong.cover : undefined}
          icon={currentSong?.cover ? undefined : <ImageError />}
          className="player-full-cover"
          size="200"
          shape="square"
        />
        <Text className="player-full-title">{currentSong?.name ?? "暂无歌曲"}</Text>
        <Text className="player-full-artist">{currentSong?.artists?.map((a) => a.name).join(" / ") ?? "未知歌手"}</Text>
        {showLyrics ? <Lyrics /> : null}
      </View>
      <View className="player-full-controls">
        <View className="player-full-actions">
          <Badge value={showLyrics ? "开启" : "关闭"} disabled={!showLyrics}>
            <Text
              onClick={() => {
                Taro.showToast({
                  title: showLyrics ? "已关闭歌词显示" : "已开启歌词显示",
                  icon: "none",
                });
                toggleShowLyrics();
              }}
            >
              歌词
            </Text>
          </Badge>
          <Articles
            size={20}
            color="#505259"
            onClick={() => {
              checkLogin().then(() => {
                openPlaylistPickerPopup();
              });
            }}
          />
          {checkSongFavorite(currentSong) ? (
            <HeartF
              size={20}
              color="#ff4d4f"
              onClick={() => {
                checkLogin().then(() => {
                  unFavoriteSong(currentSong);
                });
              }}
            />
          ) : (
            <Heart
              size={20}
              color="#505259"
              onClick={() => {
                checkLogin().then(() => {
                  favoriteSong(currentSong);
                });
              }}
            />
          )}
          <Share
            size={20}
            color="#505259"
            onClick={() => {
              downloadAndShareSong(currentSong);
            }}
          />
          <More
            size={20}
            color="#505259"
            style={{ transform: "rotate(90deg)" }}
            onClick={() => {
              setShowSongActionsPopup(true);
            }}
          />
        </View>

        <SeekBar />

        <View className="player-full-buttons">
          <View
            style={{ marginTop: pxTransform(4) }}
            onClick={() => {
              togglePlaybackOrder();
            }}
          >
            {playbackOrder === "repeatAll" ? (
              <Refresh color="#505259" size={24} />
            ) : (
              <Reload color="#505259" size={24} />
            )}
          </View>
          <IconFont
            fontClassName="iconfont"
            classPrefix="icon"
            name="shangyishoushangyige"
            size={24}
            onClick={() => {
              playPreviousSong();
            }}
          />
          {isPlaying ? (
            <PlayStop
              size={48}
              onClick={() => {
                if (currentSong) {
                  backgroundAudioManager.pause();
                }
              }}
            />
          ) : (
            <PlayStart
              size={48}
              onClick={() => {
                if (currentSong) {
                  playBackgroundAudioManager();
                }
              }}
            />
          )}
          <IconFont
            fontClassName="iconfont"
            classPrefix="icon"
            name="xiayigexiayishou"
            size={24}
            onClick={() => {
              playNextSong();
            }}
          />
          <Category
            size={24}
            style={{ marginLeft: pxTransform(4) }}
            onClick={() => {
              setShowPlayerQueuePopup(true);
            }}
          />
        </View>
        <SafeArea position="bottom" />
      </View>

      <PlayerQueuePopup
        visible={showPlayerQueuePopup}
        onClose={() => {
          setShowPlayerQueuePopup(false);
        }}
      />

      <SongActionsPopup
        song={currentSong}
        visible={showSongActionsPopup}
        onClose={() => {
          setShowSongActionsPopup(false);
        }}
      />
    </View>
  );
}
