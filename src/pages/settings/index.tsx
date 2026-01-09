import { ScrollView, View, Text } from "@tarojs/components";
import Player from "@/components/player";
import { Cell, SafeArea, Switch } from "@nutui/nutui-react-taro";
import { useState } from "react";
import { ArrowRight } from "@nutui/icons-react-taro";
import Taro from "@tarojs/taro";
import { usePlayerStore, useSettingsStore } from "@/store";
import PlaybackRatePopup from "@/components/playback-rate-popup";

import AboutPopup from "./AboutPopup";
import "./index.scss";

export default function Settings() {
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const playbackRate = usePlayerStore((state) => state.playbackRate);
  const [showPlaybackRatePopup, setShowPlaybackRatePopup] = useState(false);
  const showLyrics = useSettingsStore((state) => state.showLyrics);
  const setShowLyrics = useSettingsStore((state) => state.setShowLyrics);
  const persistSongAndQueue = useSettingsStore((state) => state.persistSongAndQueue);
  const setPersistSongAndQueue = useSettingsStore((state) => state.setPersistSongAndQueue);

  return (
    <ScrollView scrollY>
      <View className="settings-container">
        <Cell.Group title="播放设置">
          <Cell
            className="cell-extra-with-text"
            title="播放速度"
            clickable
            onClick={() => {
              setShowPlaybackRatePopup(true);
            }}
            extra={
              <View className="cell-extra-with-text-wrapper">
                <Text>{playbackRate.toFixed(1)}X</Text>
                <ArrowRight />
              </View>
            }
          />
          <Cell
            align="center"
            title="歌词显示"
            extra={
              <Switch
                checked={showLyrics}
                loading={false}
                onChange={(value) => {
                  setShowLyrics(value);
                }}
              />
            }
          />
          <Cell
            align="center"
            title="缓存歌曲和播放队列"
            extra={
              <Switch
                checked={persistSongAndQueue}
                loading={false}
                onChange={(value) => {
                  setPersistSongAndQueue(value);
                }}
              />
            }
          />
          <Cell
            title="清空缓存"
            clickable
            onClick={() => {
              usePlayerStore.persist.clearStorage();
              Taro.showToast({
                title: "缓存已清空",
                icon: "success",
              });
            }}
            extra={<ArrowRight />}
          />
        </Cell.Group>

        <Cell.Group title="关于">
          <Cell
            title="关于铜钟"
            clickable
            extra={<ArrowRight />}
            onClick={() => {
              setShowAboutPopup(true);
            }}
          />
          <Cell
            title="网页版"
            clickable
            className="cell-extra-with-text"
            extra={<ArrowRight />}
            onClick={() => {
              Taro.setClipboardData({
                data: "https://tonzhon.whamon.com/",
              }).then(() => {
                Taro.showToast({
                  title: "链接已复制",
                  icon: "success",
                });
              });
            }}
          />
        </Cell.Group>
      </View>

      <SafeArea position="bottom" />

      <AboutPopup
        visible={showAboutPopup}
        onClose={() => {
          setShowAboutPopup(false);
        }}
      />
      <PlaybackRatePopup
        visible={showPlaybackRatePopup}
        onClose={() => {
          setShowPlaybackRatePopup(false);
        }}
      />

      <Player />
    </ScrollView>
  );
}
