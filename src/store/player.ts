import Taro from "@tarojs/taro";
import { create } from "zustand";
import { type Song, getSongSrc } from "@/api";
import { uniqBy } from "@/utils";

// 目前暂时仅列表循环和单曲循环
export type PlayBackOrder = "repeatAll" | "repeatOne";

type PlayerStore = {
  // 当前歌曲
  currentSong?: Song;
  // 当前歌曲是否播放
  isPlaying: boolean;
  // 播放队列
  playerQueue: Song[];
  // 播放顺序
  playbackOrder: PlayBackOrder;
  // 播放进度, 单位秒
  playbackProgress: number;
  // 播放速度, 0.5-2.0
  playbackRate: number;

  setCurrentSong: (song?: Song) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlayerQueue: (queue: Song[]) => void;
  togglePlaybackOrder: () => void;
  setPlaybackOrder: (order: PlayBackOrder) => void;
  setPlaybackProgress: (progress: number) => void;
  setPlaybackRate: (rate: number) => void;
};

// 播放器状态管理
export const usePlayerStore = create<PlayerStore>()((set) => ({
  currentSong: undefined,
  isPlaying: false,
  playerQueue: [],
  playbackOrder: "repeatAll",
  playbackProgress: 0,
  playbackRate: 1,

  setCurrentSong: (song: Song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  // 这里做一下去重, 原则上播放队列里不能出现重复歌曲
  setPlayerQueue: (queue: Song[]) => set({ playerQueue: uniqBy(queue, "newId") }),
  togglePlaybackOrder: () =>
    set((state) => ({
      playbackOrder: state.playbackOrder === "repeatAll" ? "repeatOne" : "repeatAll",
    })),
  setPlaybackOrder: (order: PlayBackOrder) => set({ playbackOrder: order }),
  setPlaybackProgress: (progress: number) => set({ playbackProgress: progress }),
  setPlaybackRate: (rate: number) => set({ playbackRate: rate }),
}));

// 获取全局唯一的背景音频管理器
export const backgroundAudioManager = Taro.getBackgroundAudioManager();

// 重置背景音频管理器
export function clearBackgroundAudioManager() {
  backgroundAudioManager.stop();
  backgroundAudioManager.title = "";
  backgroundAudioManager.epname = "";
  backgroundAudioManager.singer = "";
  backgroundAudioManager.coverImgUrl = "";
}

// 添加歌曲到背景音频管理器
export function addSongToBackgroundAudioManager(song: Song) {
  // 获取歌曲播放地址
  getSongSrc(song.newId)
    .then((res) => {
      backgroundAudioManager.title = song.name;
      backgroundAudioManager.epname = song.album?.name || "";
      backgroundAudioManager.singer = song.artists?.map((a) => a.name)?.join(" / ") || "";
      backgroundAudioManager.coverImgUrl = song.cover || "";

      if (res.data.success) {
        backgroundAudioManager.src = res.data.data;
      } else {
        throw new Error();
      }
    })
    .catch(() => {
      // 暂停上一首的播放
      backgroundAudioManager.stop();
      Taro.showToast({
        title: "获取音源失败",
        icon: "error",
      });
    })
    .finally(() => {});
}
