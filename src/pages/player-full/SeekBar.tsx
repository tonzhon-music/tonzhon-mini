import { backgroundAudioManager, usePlayerStore } from "@/store";
import { formatSongDuration, formatSongDurationToPercent } from "@/utils";
import { Slider, View, Text } from "@tarojs/components";

// 因为 playbackProgress 频繁渲染的原因, 单独抽取组件防止父组件被频繁渲染, 单独抽出播放控制条
export default function SeekBar() {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playbackProgress = usePlayerStore((state) => state.playbackProgress);

  return (
    <>
      <Slider
        disabled={!currentSong || !backgroundAudioManager.duration}
        className="player-full-slider"
        activeColor="black"
        blockColor="black"
        blockSize={12}
        value={formatSongDurationToPercent(playbackProgress, backgroundAudioManager.duration)}
        step={0.1}
        onChange={(e) => {
          if (currentSong && backgroundAudioManager.duration) {
            const value = e.detail.value || 0;
            const newTime = (value / 100) * backgroundAudioManager.duration;
            backgroundAudioManager.seek(newTime);
          }
        }}
        onChanging={(e) => {
          // TODO: 滑动过程中更加丝滑
        }}
      />
      <View className="player-full-time-info">
        <Text>{currentSong ? formatSongDuration(playbackProgress) : "00:00"}</Text>
        <Text>{currentSong ? formatSongDuration(backgroundAudioManager.duration) : "00:00"}</Text>
      </View>
    </>
  );
}
