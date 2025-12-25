import { Close, Del, Refresh, Reload } from "@nutui/icons-react-taro";
import { Cell, Popup, Empty } from "@nutui/nutui-react-taro";
import { View, Text, ScrollView } from "@tarojs/components";
import { usePlayerStore } from "@/store";
import { usePlayer } from "@/hooks";
import Taro from "@tarojs/taro";
import { clsx } from "@/utils";

import "./index.scss";

type PlayerQueuePopupProps = {
  visible: boolean;
  onClose: () => void;
};

// 播放队列弹窗
export default function PlayerQueuePopup({ visible, onClose }: PlayerQueuePopupProps) {
  const playbackOrder = usePlayerStore((state) => state.playbackOrder);
  const { clearPlayerQueue, removeSongFromQueue, matchCurrentSong, playSongInQueue, togglePlaybackOrder } = usePlayer();
  const playerQueue = usePlayerStore((state) => state.playerQueue);

  return (
    <Popup visible={visible} closeable title="播放队列" onClose={onClose} position="bottom" round>
      <ScrollView scrollY style={{ height: 400 }}>
        {playerQueue.length ? (
          <Cell.Group divider={false}>
            <Cell
              title={
                <View
                  className="playback-order"
                  onClick={() => {
                    togglePlaybackOrder();
                  }}
                >
                  {playbackOrder === "repeatAll" ? (
                    <Refresh color="#505259" size={16} />
                  ) : (
                    <Reload color="#505259" size={16} />
                  )}
                  <Text style={{ color: "#505259" }}>{playbackOrder === "repeatAll" ? "列表循环" : "单曲循环"}</Text>
                </View>
              }
              extra={
                <Del
                  color="#505259"
                  onClick={() => {
                    Taro.showModal({
                      title: "清空当前播放列表?",
                      confirmText: "清空",
                      confirmColor: "#dc8f03",
                      success: (res) => {
                        if (res.confirm) {
                          clearPlayerQueue();
                          onClose();
                        }
                      },
                    });
                  }}
                />
              }
            />
            {playerQueue.map((song) => (
              <Cell
                key={song.newId}
                className="player-queue-song-cell"
                clickable
                onClick={(e) => {
                  playSongInQueue(song);
                }}
              >
                <View className="player-queue-song-info">
                  <Text className={clsx("ellipsis", matchCurrentSong(song) && "match-current-song")}>{song.name}</Text>
                  <Text
                    className={clsx("player-queue-song-artist", matchCurrentSong(song) ? "match-current-song" : "grey")}
                  >
                    -
                  </Text>
                  <Text
                    className={clsx(
                      "player-queue-song-artist",
                      "ellipsis",
                      matchCurrentSong(song) ? "match-current-song" : "grey"
                    )}
                  >
                    {song.artists?.map((a) => a.name).join(" / ")}
                  </Text>
                </View>
                <View className="player-queue-song-actions">
                  <Close
                    color="#505259"
                    size={18}
                    onClick={(e) => {
                      // 阻止冒泡, 否则会触发播放歌曲事件
                      e.stopPropagation();
                      removeSongFromQueue(song);
                    }}
                  />
                </View>
              </Cell>
            ))}
          </Cell.Group>
        ) : (
          <View style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Empty title="暂无歌曲" />
          </View>
        )}
      </ScrollView>
    </Popup>
  );
}
