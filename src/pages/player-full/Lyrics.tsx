import { getSongLyrics } from "@/api";
import { usePlayerStore } from "@/store";
import { clsx, getCurrentLyricIndex, parseLRC, type LyricLine } from "@/utils";
import { ScrollView, Text } from "@tarojs/components";
import { useEffect, useMemo, useState } from "react";

// 因为 playbackProgress 会频繁触发渲染, 为了不触发其他父组件的渲染, 单独抽出歌词组件, 只在该组件内重复渲染
export default function Lyrics() {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playbackProgress = usePlayerStore((state) => state.playbackProgress);
  const [currentLyrics, setCurrentLyrics] = useState<LyricLine[]>([]);

  // 当前歌词索引
  const currentLyricLineIndex = useMemo(() => {
    return getCurrentLyricIndex(currentLyrics, playbackProgress);
  }, [currentLyrics, playbackProgress]);

  // 获取歌词
  useEffect(() => {
    if (currentSong) {
      getSongLyrics(currentSong.newId)
        .then((res) => {
          if (res.data.success) {
            const lyrics = parseLRC(res.data.data);
            setCurrentLyrics(lyrics);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          setCurrentLyrics([]);
        });
    }
  }, [currentSong]);

  return (
    <ScrollView
      className="player-full-lyrics"
      scrollY
      scrollIntoView={`lyric-${currentLyricLineIndex}`}
      scrollWithAnimation
    >
      {currentLyrics.length ? (
        currentLyrics.map(({ text }, index) => (
          <Text
            key={index}
            id={`lyric-${index}`}
            className={clsx("lyric-line", index === currentLyricLineIndex && "active")}
          >
            {text}
          </Text>
        ))
      ) : (
        <Text className="lyric-line">暂无歌词</Text>
      )}
    </ScrollView>
  );
}
