import { usePlayerStore, backgroundAudioManager } from "@/store";
import { Popup } from "@nutui/nutui-react-taro";
import { Slider, View } from "@tarojs/components";
import { useState } from "react";

type PlaybackRatePopupProps = {
  visible: boolean;
  onClose: () => void;
};

export default function PlaybackRatePopup({ visible, onClose }: PlaybackRatePopupProps) {
  const playbackRate = usePlayerStore((state) => state.playbackRate);
  const setPlaybackRate = usePlayerStore((state) => state.setPlaybackRate);
  // 定义局部变量以避免频繁更新全局状态
  const [_playbackRate, _setPlaybackRate] = useState<number>(playbackRate);

  return (
    <Popup
      visible={visible}
      closeable
      title="播放速度"
      description={`${playbackRate.toFixed(1)}X`}
      onClose={onClose}
      position="bottom"
      round
    >
      <View className="playback-rate-popup">
        <Slider
          min={0.5}
          max={2.0}
          step={0.1}
          showValue
          value={_playbackRate}
          blockSize={20}
          activeColor="#dc8f03"
          onChange={(e) => {
            const value = e.detail.value || 1;
            setPlaybackRate(value);
            // 同步局部状态
            _setPlaybackRate(value);
            backgroundAudioManager.playbackRate = value;
          }}
          onChanging={(e) => {
            _setPlaybackRate(e.detail.value || 1);
          }}
        />
      </View>
    </Popup>
  );
}
