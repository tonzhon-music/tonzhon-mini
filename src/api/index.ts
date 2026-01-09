import Taro from "@tarojs/taro";

const BASE_URL_1 = "https://tonzhon-music-api.whamon.com";
const BASE_URL_2 = "https://tonzhon.whamon.com/api";

// 小程序端存储的 cookie key
export const COOKIE_KEY = "cookie";

export type Song = {
  // 用于获取歌曲内容和歌词等
  newId: string;
  name: string;
  // 艺人
  artists?: [
    {
      name: string;
      id: string;
    },
    {
      name: string;
      id: string;
    }
  ];
  // 专辑
  album: {
    name: string;
    id: string;
  };
  // 其他信息
  alias?: string;
  // e.g. 5964088
  mvId?: string;
  originalId?: string;
  // 来自什么平台, e.g. qq
  platform?: string;
  // 封面
  cover?: string;
};

export type Artist = {
  // 艺人名
  name: string;
  // 图片
  pic: string;
};

export type Playlist = {
  cover?: string;
  id: string;
  name: string;
};

export type PlaylistInfo = {
  author: string;
  // 收藏量
  collectCount: number;
  cover: string;
  // 创建时间
  created: string;
  name: string;
  // 播放量
  playCount: number;
  songs: Song[];
  __v: number;
  _id: string;
};

export type User = {
  username: string;
  // 收藏的歌单
  collectedPlaylists: Playlist[];
  // 创建的歌单
  playlists: Playlist[];
  songWorks: [];
};

export type AccountInfo = {
  email: string;
};

// 获取热门歌曲
export function getHotSongs() {
  return Taro.request<{ success: boolean; songs: Song[] | { error: string } }>({
    url: `${BASE_URL_1}/hot-songs`,
  });
}

// 根据 newId 获取歌曲播放地址
export function getSongSrc(newId: string) {
  return Taro.request<{ success: boolean; data: string }>({
    url: `${BASE_URL_1}/song_file/${newId}`,
  });
}

// 根据 newId 获取歌曲歌词
export function getSongLyrics(newId: string) {
  return Taro.request<{ success: boolean; data: string }>({
    url: `${BASE_URL_1}/lyrics/${newId}`,
  });
}

// 获取新歌
export function getNewSongs() {
  return Taro.request<{ success: boolean; songs: Song[] | { error: string } }>({
    url: `${BASE_URL_1}/new-songs`,
  });
}

// 根据关键词搜索所有歌曲
export function searchAll(keyword: string) {
  return Taro.request<{ success: boolean; data: Song[] }>({
    url: `${BASE_URL_1}/safe-search?keyword=${keyword}`,
  });
}

// 获取某个歌手的所有歌曲
export function getSongsOfArtist(name: string) {
  return Taro.request<{ songs?: Song[]; error?: string }>({
    url: `${BASE_URL_1}/songs_of_artist/${encodeURIComponent(name)}`,
  });
}

// 从三大平台搜索歌曲, q 为 qq 音乐, n 为网易云, k 为酷我
export function searchFromPlatform(name: string, platform: "q" | "n" | "k" = "q") {
  return Taro.request<{ success: boolean; data: { songs: Song[] } }>({
    url: `${BASE_URL_1}/search/${platform}/${encodeURIComponent(name)}`,
  });
}

// 获取精选歌单
export function getRecommendPlaylists() {
  return Taro.request<{ success: boolean; playlists: Playlist[] }>({
    url: `${BASE_URL_2}/recommended_playlists`,
  });
}

// 获取歌单详情
export function getPlaylistInfo(id: string) {
  return Taro.request<{ success: boolean; playlist: PlaylistInfo }>({
    url: `${BASE_URL_2}/playlists/${id}`,
  });
}

// 登录
export function signin(payload: { username: string; password: string }) {
  return Taro.request<{
    success: boolean;
    message?: string;
    data?: User;
  }>({
    url: `${BASE_URL_2}/sign_in`,
    method: "POST",
    data: payload,
  });
}

// 登出, status 200 以及 string "OK" 表示成功
export function signout() {
  return Taro.request<string>({
    url: `${BASE_URL_2}/sign_out`,
    method: "POST",
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 获取用户信息, 需要携带 cookie, 401 表示未登录
export function getUserInfo() {
  return Taro.request<User>({
    url: `${BASE_URL_2}/me`,
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 获取账户信息, 邮箱
export function getAccountInfo() {
  return Taro.request<AccountInfo>({
    url: `${BASE_URL_2}/account`,
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 获取喜欢的歌曲
export function getFavoriteSongs() {
  return Taro.request<{ success: boolean; songs: Song[] }>({
    url: `${BASE_URL_2}/favorites`,
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 添加一首歌到喜欢列表
export function addSongToFavorite(song: Song) {
  return Taro.request<{ success: boolean }>({
    url: `${BASE_URL_2}/favorites`,
    method: "POST",
    data: {
      // TODO: 这里可能要注意一下, 给后端传多余的歌曲信息都可以, 只要有 newId, 但是后端是无脑存的不做校验, 所以封面什么如果有也传进来
      song,
    },
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 移除一首歌从喜欢列表
export function removeSongFromFavorite(newId: string) {
  return Taro.request<{ success: boolean }>({
    url: `${BASE_URL_2}/favorites/${newId}`,
    method: "DELETE",
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 创建歌单 status 201 表示成功, 返回歌单 id
export function createPlaylist(name: string) {
  return Taro.request<{ playlistId: string }>({
    url: `${BASE_URL_2}/playlists`,
    method: "POST",
    data: { name },
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 收藏歌单, 成功返回 201 和 Created 文字
export function addPlaylistToCollection(playlistId: string, playlistName: string) {
  return Taro.request<string>({
    url: `${BASE_URL_2}/playlists/${playlistId}/collectedPlaylists`,
    method: "POST",
    data: {
      playlistName,
    },
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 添加一首歌到我的某个歌单
export function addSongToMyPlaylist(playlistId: string, song: Song) {
  return Taro.request<{ success: boolean }>({
    url: `${BASE_URL_2}/playlists/${playlistId}/addSong`,
    method: "PUT",
    data: { toAdd: song },
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 从我的某个歌单中移除一首歌
export function removeSongFromMyPlaylist(playlistId: string, newId: string) {
  return Taro.request<{ success: boolean }>({
    url: `${BASE_URL_2}/playlists/${playlistId}/songs/${newId}`,
    method: "DELETE",
    header: {
      cookie: Taro.getStorageSync(COOKIE_KEY),
    },
  });
}

// 获取所有歌单列表总数
export function getPlaylistsTotal() {
  return Taro.request<{ total: number }>({
    url: `${BASE_URL_2}/num_playlists_with_covers`,
  });
}

// 获取所有歌单列表, index 为 playlist 的索引位置, 默认为 0, 每次返回 30 个
export function getPlaylists(index: number) {
  return Taro.request<{ success: boolean; playlists: Playlist[] }>({
    url: `${BASE_URL_2}/latest_playlists_with_covers?skip=${index}`,
  });
}

// 注册时校验用户名, status 200 表示可用, 422 表示已被占用
export function checkUsername(payload: { username: string }) {
  return Taro.request<string>({
    url: `${BASE_URL_2}/username_availability_check`,
    method: "POST",
    data: payload,
  });
}

// 注册时校验邮箱, status 200 表示可用, 422 表示已被占用
export function checkEmail(payload: { email: string }) {
  return Taro.request<string>({
    url: `${BASE_URL_2}/email_availability_check`,
    method: "POST",
    data: payload,
  });
}

// 注册接口, status 201 代表注册成功, 返回 Created
export function signup(payload: { username: string; email: string; password: string }) {
  return Taro.request<string>({
    url: `${BASE_URL_2}/sign_up`,
    method: "POST",
    data: payload,
  });
}
