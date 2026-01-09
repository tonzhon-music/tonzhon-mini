import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { taroStorage } from "./storage";

type SettingsStore = {
  // 是否显示歌词, 默认关闭, 开启影响性能
  showLyrics: boolean;
  // 是否持久化歌曲和播放队列, 默认开启
  persistSongAndQueue: boolean;

  toggleShowLyrics: () => void;
  setShowLyrics: (show: boolean) => void;
  setPersistSongAndQueue: (p: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      showLyrics: false,
      persistSongAndQueue: true,

      toggleShowLyrics: () => set((state) => ({ showLyrics: !state.showLyrics })),
      setShowLyrics: (show: boolean) => set({ showLyrics: show }),
      setPersistSongAndQueue: (p: boolean) => set({ persistSongAndQueue: p }),
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({ showLyrics: state.showLyrics, persistSongAndQueue: state.persistSongAndQueue }),
      storage: createJSONStorage(() => taroStorage),
      skipHydration: true,
    }
  )
);
