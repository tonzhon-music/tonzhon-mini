import { Heart, HeartF, Image, More, Pin, Play } from "@nutui/icons-react-taro";
import { Avatar, Button, Cell, Swipe } from "@nutui/nutui-react-taro";
import { View, Text } from "@tarojs/components";
import { type Song } from "@/api";
import { useAuth, useFavorite, usePlayer } from "@/hooks";
import { clsx } from "@/utils";
import { useMemo, useState } from "react";
import SongActionsPopup from "@/components/song-actions-popup";

import "./index.scss";

type SongListProps = {
  title?: React.ReactNode;
  songs: Song[];
  // 展示的歌曲数量, 默认全部展示
  showCount?: number;
  extra?: React.ReactNode;
  // 每一首歌曲可以滑动进行删除操作, 但是删除操作取决于父组件传递的函数, 例如喜欢歌曲页面滑动操作为取消喜欢
  deleteAction?: (song?: Song) => void;
  deleteText?: string;
};

// 歌曲列表组件
export default function SongList({
  title = "全部播放",
  songs = [],
  showCount,
  extra,
  deleteAction,
  deleteText,
}: SongListProps) {
  const { resetSongs, matchCurrentSong, playSong, addSongToQueue } = usePlayer();
  const { checkLogin } = useAuth();
  const { checkSongFavorite, favoriteSong, unFavoriteSong } = useFavorite();
  const [showSongActionsPopup, setShowSongActionsPopup] = useState<boolean>(false);
  const [selectedSong, setSelectedSong] = useState<Song>();

  // 展示的歌曲
  const displayedSongs = useMemo(() => (showCount ? songs.slice(0, showCount) : songs), [showCount, songs]);

  return (
    <>
      <View className="song-list-title">
        <View className="song-list-title-label">
          {typeof title === "string" ? <Text>{title}</Text> : <>{title}</>}
          {songs.length ? (
            <Avatar
              size="small"
              icon={<Play />}
              background="white"
              shape="round"
              color="black"
              onClick={() => {
                resetSongs(songs);
              }}
            />
          ) : null}
        </View>
        {extra}
      </View>
      <Cell.Group>
        {displayedSongs.map((song) => (
          <View
            className="song-list-wrapper"
            key={song.newId}
            onLongPress={() => {
              // 这里包一层, 因为 Cell 上不支持 onLongPress 事件
              console.log("长按歌曲");
              setSelectedSong(song);
              setShowSongActionsPopup(true);
            }}
          >
            <Swipe
              rightAction={
                <Button shape="square" type="danger">
                  {deleteText || "删除"}
                </Button>
              }
              onActionClick={(e, position) => {
                if (position === "right") {
                  deleteAction?.(song);
                }
              }}
              disabled={!deleteAction}
            >
              <Cell
                className="song-cell"
                clickable
                onClick={() => {
                  playSong(song);
                }}
              >
                <View className="song-info">
                  {song.cover ? (
                    <Avatar src={song.cover} shape="square" size="normal" />
                  ) : (
                    <Avatar shape="square" size="normal" icon={<Image />} />
                  )}
                  <View className={clsx("song-label", matchCurrentSong(song) && "match-current-song")}>
                    <Text className="song-label-name ellipsis">{song.name}</Text>
                    <Text className="song-label-artist ellipsis">{song.artists?.map((a) => a.name)?.join(" / ")}</Text>
                  </View>
                </View>
                <View className="song-list-actions">
                  {checkSongFavorite(song) ? (
                    <HeartF
                      size={18}
                      color="#ff4d4f"
                      onClick={(e) => {
                        e.stopPropagation();
                        checkLogin().then(() => {
                          unFavoriteSong(song);
                        });
                      }}
                    />
                  ) : (
                    <Heart
                      size={18}
                      color="#505259"
                      onClick={(e) => {
                        e.stopPropagation();
                        checkLogin().then(() => {
                          favoriteSong(song);
                        });
                      }}
                    />
                  )}
                  <Pin
                    size={18}
                    color="#505259"
                    onClick={(e) => {
                      // 阻止冒泡, 否则会触发播放歌曲事件
                      e.stopPropagation();
                      addSongToQueue(song);
                    }}
                  />
                  <More
                    size={18}
                    color="#505259"
                    style={{ transform: "rotate(90deg)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSong(song);
                      setShowSongActionsPopup(true);
                    }}
                  />
                </View>
              </Cell>
            </Swipe>
          </View>
        ))}
      </Cell.Group>

      <SongActionsPopup
        song={selectedSong}
        visible={showSongActionsPopup}
        deleteAction={deleteAction}
        onClose={() => {
          setShowSongActionsPopup(false);
          // 不清空选中歌曲, 否则在打开后续的 popup 例如 playlistPickerPopup 里会拿不到 song, 改成每次打开的时候都先重置
          // setSelectedSong(undefined);
        }}
      />
    </>
  );
}
