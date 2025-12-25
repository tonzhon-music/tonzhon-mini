import { useState, useEffect, useMemo, useCallback } from "react";
import Taro from "@tarojs/taro";
import {
  usePlayerStore,
  clearBackgroundAudioManager,
  addSongToBackgroundAudioManager,
  backgroundAudioManager,
  useAuthStore,
} from "@/store";
import {
  addPlaylistToCollection,
  addSongToFavorite,
  getFavoriteSongs,
  getUserInfo,
  Playlist,
  PlaylistInfo,
  removeSongFromFavorite,
  signout,
  type Song,
} from "@/api";

/**
 * @deprecated
 * 获取播放器高度, 现在高度直接写死
 */
export function usePlayerHeight() {
  const [playerHeight, setPlayerHeight] = useState(0);

  useEffect(() => {
    // 获取播放器的高度
    const query = Taro.createSelectorQuery();
    query.select(".player").boundingClientRect();
    query.exec(function (res) {
      setPlayerHeight(res[0]?.height || 0);
    });
  }, []);

  return playerHeight;
}

// 播放器相关方法
export function usePlayer() {
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const setPlayerQueue = usePlayerStore((state) => state.setPlayerQueue);
  const setPlaybackProgress = usePlayerStore((state) => state.setPlaybackProgress);
  const setPlaybackOrder = usePlayerStore((state) => state.setPlaybackOrder);
  const playerQueue = usePlayerStore((state) => state.playerQueue);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const playbackOrder = usePlayerStore((state) => state.playbackOrder);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  // 清空播放队列
  const clearPlayerQueue = () => {
    setPlayerQueue([]);
    setCurrentSong(undefined);
    setPlaybackProgress(0);

    clearBackgroundAudioManager();
  };

  // 覆盖播放队列并播放第一首
  const resetSongs = (songs: Song[]) => {
    if (songs.length) {
      const firstSong = songs[0];
      setPlayerQueue(songs);
      setCurrentSong(firstSong);

      addSongToBackgroundAudioManager(firstSong);
    } else {
      clearPlayerQueue();
    }
  };

  // 播放上一首或下一首
  const playPreviousOrNextSong = (direction: "next" | "previous") => () => {
    if (currentSong && playerQueue.length) {
      const currentIndex = playerQueue.findIndex((song) => song.newId === currentSong.newId);

      if (currentIndex >= 0) {
        const navigateIndex =
          direction === "next"
            ? (currentIndex + 1) % playerQueue.length
            : (currentIndex - 1 + playerQueue.length) % playerQueue.length;
        // 基于播放顺序获取到下一首歌曲
        const navigateSong = playerQueue[playbackOrder === "repeatAll" ? navigateIndex : currentIndex];

        // 停止当前播放
        backgroundAudioManager.stop();
        setCurrentSong(navigateSong);
        addSongToBackgroundAudioManager(navigateSong);
      } else {
        // 异常情况: 当前歌曲不在播放队列中, 播放第一首
        const firstSong = playerQueue[0];
        setCurrentSong(firstSong);
        addSongToBackgroundAudioManager(firstSong);
      }
    }
  };

  // 播放下一首
  const playNextSong = playPreviousOrNextSong("next");

  // 播放上一首
  const playPreviousSong = playPreviousOrNextSong("previous");

  // 播放队列中移除歌曲
  const removeSongFromQueue = (song: Song) => {
    if (currentSong && playerQueue.length) {
      const newQueue = playerQueue.filter((s) => s.newId !== song.newId);

      if (newQueue.length) {
        // 播放队列不为空
        if (song.newId === currentSong.newId) {
          // 如果移除的是当前播放的歌曲, 则播放下一首
          playNextSong();
        }

        setPlayerQueue(newQueue);
      } else {
        clearPlayerQueue();
      }
    }
  };

  // 判断歌曲是否是当前播放的歌曲
  const matchCurrentSong = (song: Song) => {
    return currentSong && currentSong?.newId === song.newId;
  };

  // 播放队列里的歌曲
  const playSongInQueue = (song: Song) => {
    if (song.newId !== currentSong?.newId) {
      // 正在播放的不是将要播放的歌曲
      setCurrentSong(song);
      addSongToBackgroundAudioManager(song);
    }
  };

  // 播放一首歌
  const playSong = (song: Song) => {
    if (currentSong && playerQueue.length) {
      // 如果播放队列不为空
      if (matchCurrentSong(song)) {
        // 如果播放的歌曲就是当前歌曲, 切换播放状态
        if (isPlaying) {
          backgroundAudioManager.pause();
        } else {
          backgroundAudioManager.play();
        }
      } else {
        // 非正在播放的歌曲, 要判断是否在播放队列中
        const songInQueue = playerQueue.find((s) => s.newId === song.newId);
        if (!songInQueue) {
          // 不在播放队列中, 直接播放, 但是在当前播放的歌曲后面添加该歌曲到播放队列中
          const currentIndex = playerQueue.findIndex((s) => s.newId === currentSong.newId);
          const newQueue = [...playerQueue.slice(0, currentIndex + 1), song, ...playerQueue.slice(currentIndex + 1)];
          setPlayerQueue(newQueue);
        }
        // 不管在不在播放队列中, 都直接播放该歌曲
        setCurrentSong(song);
        addSongToBackgroundAudioManager(song);
      }
    } else {
      // 如果播放队列为空, 则重置播放队列为当前歌曲
      resetSongs([song]);
    }
  };

  // 添加歌曲到播放队列稍后播放
  const addSongToQueue = (song: Song) => {
    if (currentSong && playerQueue.length) {
      if (matchCurrentSong(song)) {
        // 如果添加的歌曲就是当前歌曲, 则不做任何操作
        Taro.showToast({
          title: "歌曲正在播放中",
          icon: "none",
        });
      } else {
        // 非正在播放的歌曲, 要判断是否在播放队列中
        const songInQueue = playerQueue.find((s) => s.newId === song.newId);
        // 当前歌曲在队列中, 过滤掉后插入, 否则直接插入
        const queue = songInQueue ? playerQueue.filter((s) => s.newId !== song.newId) : playerQueue;
        const currentIndex = queue.findIndex((s) => s.newId === currentSong.newId);
        const newQueue = [...queue.slice(0, currentIndex + 1), song, ...queue.slice(currentIndex + 1)];
        setPlayerQueue(newQueue);
        Taro.showToast({
          title: "已添加至播放队列",
          icon: "none",
        });
      }
    } else {
      // 如果播放队列为空, 则重置播放队列为当前歌曲
      resetSongs([song]);
      Taro.showToast({
        title: "已添加至播放队列",
        icon: "none",
      });
    }
  };

  // 播放顺序切换
  const togglePlaybackOrder = () => {
    if (playbackOrder === "repeatAll") {
      setPlaybackOrder("repeatOne");
      Taro.showToast({
        title: "已切换为单曲循环",
        icon: "none",
      });
    } else {
      setPlaybackOrder("repeatAll");
      Taro.showToast({
        title: "已切换为列表循环",
        icon: "none",
      });
    }
  };

  return {
    clearPlayerQueue,
    resetSongs,
    playNextSong,
    playPreviousSong,
    removeSongFromQueue,
    matchCurrentSong,
    playSongInQueue,
    playSong,
    addSongToQueue,
    togglePlaybackOrder,
  };
}

// 认证相关方法
export function useAuth() {
  const { resetAuth, setLogin, setUser, openLoginPopup, setFavoriteSongs } = useAuthStore();
  const login = useAuthStore((state) => state.login);

  // 退出登录确认弹框
  const confirmSignout = useCallback(() => {
    // 退出登录
    Taro.showModal({
      title: "是否退出登录?",
      confirmColor: "#dc8f03",
    }).then((res) => {
      if (res.confirm) {
        signout()
          .then((r) => {
            if (r.statusCode === 200) {
              Taro.showToast({
                title: "已退出登录",
                icon: "success",
              });
              // 清空登录状态
              resetAuth();
            } else {
              throw new Error();
            }
          })
          .catch(() => {
            Taro.showToast({
              title: "退出登录失败",
              icon: "error",
            });
          });
      }
    });
  }, [resetAuth]);

  // 刷新登录状态并且获取最新用户信息
  const refreshUserInfo = useCallback(() => {
    getUserInfo()
      .then((res) => {
        if (res.statusCode === 200) {
          setLogin(true);
          setUser(res.data);
        } else {
          setLogin(false);
        }
      })
      .catch(() => {
        setLogin(false);
      });
  }, [setLogin, setUser]);

  // 获取我喜欢的音乐
  const refreshFavoriteSongs = useCallback(() => {
    return getFavoriteSongs().then((res) => {
      if (res.data.success) {
        setFavoriteSongs(res.data.songs);
      }
    });
  }, [setFavoriteSongs]);

  // 通过 promise 的方式检查是否登录, 未登录则打开登录弹框
  const checkLogin = useCallback(() => {
    if (!login) {
      openLoginPopup();
      return Promise.reject();
    }
    return Promise.resolve();
  }, [login, openLoginPopup]);

  return {
    confirmSignout,
    refreshUserInfo,
    refreshFavoriteSongs,
    checkLogin,
  };
}

// 歌曲喜欢的相关方法
export function useFavorite() {
  const { refreshFavoriteSongs } = useAuth();
  const favoriteSongs = useAuthStore((state) => state.favoriteSongs);

  // 给定一首歌, 返回该歌曲是否在喜欢的列表里
  const checkSongFavorite = useCallback(
    (song?: Song) => {
      if (!song || !favoriteSongs.length) {
        return false;
      }
      return favoriteSongs.some((s) => s.newId === song?.newId);
    },
    [favoriteSongs]
  );

  const favoriteSong = useCallback(
    (song?: Song) => {
      if (!song) {
        return;
      }
      addSongToFavorite(song)
        .then((res) => {
          if (res.data.success) {
            Taro.showToast({
              title: "已添加到我喜欢",
              icon: "success",
            });
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Taro.showToast({
            title: "添加喜欢失败",
            icon: "error",
          });
        })
        .finally(() => {
          // 无论成功失败更新喜欢列表
          refreshFavoriteSongs();
        });
    },
    [refreshFavoriteSongs]
  );

  const unFavoriteSong = useCallback(
    (song?: Song) => {
      if (!song) {
        return;
      }

      removeSongFromFavorite(song.newId)
        .then((res) => {
          if (res.data.success) {
            Taro.showToast({
              title: "已取消喜欢",
              icon: "success",
            });
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          Taro.showToast({
            title: "取消喜欢失败",
            icon: "error",
          });
        })
        .finally(() => {
          // 无论成功失败更新喜欢列表
          refreshFavoriteSongs();
        });
    },
    [refreshFavoriteSongs]
  );

  return {
    checkSongFavorite,
    favoriteSong,
    unFavoriteSong,
  };
}

// 歌单收藏的相关方法
export function usePlaylistCollection() {
  const collectedPlaylists = useAuthStore((state) => state.user?.collectedPlaylists);
  const { refreshUserInfo } = useAuth();

  // 该歌单是否被收藏
  const checkPlaylistCollected = useCallback(
    (playlist?: Partial<Playlist & PlaylistInfo>) => {
      const playlistId = playlist?.id || playlist?._id;
      if (!playlistId) {
        return false;
      }
      return collectedPlaylists?.some((p) => p.id === playlistId);
    },
    [collectedPlaylists]
  );

  // 收藏某歌单
  const collectPlaylist = useCallback(
    (playlist?: Partial<Playlist & PlaylistInfo>) => {
      const playlistId = playlist?.id || playlist?._id;

      if (playlistId && playlist.name) {
        addPlaylistToCollection(playlistId, playlist.name)
          .then((res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              Taro.showToast({
                title: "收藏歌单成功",
                icon: "success",
              });
            } else {
              throw new Error();
            }
          })
          .catch(() => {
            Taro.showToast({
              title: "收藏歌单失败",
              icon: "error",
            });
          })
          .finally(() => {
            refreshUserInfo();
          });
      }
    },
    [refreshUserInfo]
  );

  return {
    checkPlaylistCollected,
    collectPlaylist,
    // TODO: 暂无取消收藏的操作
  };
}

// 我创建的歌单相关方法
export function useMyPlaylist() {
  return {};
}
