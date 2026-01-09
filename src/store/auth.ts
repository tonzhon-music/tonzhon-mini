import { create } from "zustand";
import { type User, type Song, type AccountInfo } from "../api";

type AuthStore = {
  login: boolean;
  showLoginPopup: boolean;
  user?: User;
  accountInfo?: AccountInfo;
  // 喜欢的歌曲
  favoriteSongs: Song[];
  // 展示创建歌单的弹框
  showCreatePlaylistPopup: boolean;
  // 创建歌单后添加到该歌单的歌曲
  songForCreatePlaylistPopup?: Song;
  // 添加到歌单选择的弹框
  showPlaylistPickerPopup: boolean;

  // 打开登录弹框
  openLoginPopup: () => void;
  closeLoginPopup: () => void;
  setLogin: (login: boolean) => void;
  setUser: (user?: User) => void;
  setAccountInfo: (info?: AccountInfo) => void;
  // 打开创建歌单弹框
  openCreatePlaylistPopup: (song?: Song) => void;
  closeCreatePlaylistPopup: () => void;
  // 设置喜欢的歌曲
  setFavoriteSongs: (songs: Song[]) => void;
  // 重置 store, 一般用于登出后的操作
  resetAuth: () => void;
  // 打开添加到歌单选择弹框
  openPlaylistPickerPopup: () => void;
  closePlaylistPickerPopup: () => void;
};

export const useAuthStore = create<AuthStore>()((set) => ({
  login: false,
  showLoginPopup: false,
  showCreatePlaylistPopup: false,
  favoriteSongs: [],
  user: undefined,
  songForCreatePlaylistPopup: undefined,
  showPlaylistPickerPopup: false,

  openLoginPopup: () => set({ showLoginPopup: true }),
  closeLoginPopup: () => set({ showLoginPopup: false }),
  setLogin: (login) => set({ login }),
  setUser: (user) => set({ user }),
  setAccountInfo: (accountInfo) => set({ accountInfo }),
  openCreatePlaylistPopup: (song) => set({ showCreatePlaylistPopup: true, songForCreatePlaylistPopup: song }),
  closeCreatePlaylistPopup: () =>
    set({
      showCreatePlaylistPopup: false,
      songForCreatePlaylistPopup: undefined,
    }),
  setFavoriteSongs: (songs) => set({ favoriteSongs: songs }),
  resetAuth: () =>
    set({
      login: false,
      user: undefined,
      accountInfo: undefined,
      favoriteSongs: [],
      songForCreatePlaylistPopup: undefined,
    }),
  openPlaylistPickerPopup: () => set({ showPlaylistPickerPopup: true }),
  closePlaylistPickerPopup: () => set({ showPlaylistPickerPopup: false }),
}));
