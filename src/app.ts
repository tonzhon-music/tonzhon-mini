import { PropsWithChildren, useEffect } from "react";
import { backgroundAudioManager, useAuthStore, usePlayerStore, useSettingsStore } from "@/store";
import Taro, { useLaunch } from "@tarojs/taro";
import { useAuth, usePlayer } from "@/hooks";

import "@nutui/nutui-react-taro/dist/style.css";
import "@/assets/font/iconfont.css";
import "./app.scss";
import { getAccountInfo } from "./api";

function App({ children }: PropsWithChildren<any>) {
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setPlaybackProgress = usePlayerStore((state) => state.setPlaybackProgress);
  const login = useAuthStore((state) => state.login);
  const { playNextSong, playPreviousSong } = usePlayer();
  const { refreshUserInfo, refreshFavoriteSongs } = useAuth();
  const setAccountInfo = useAuthStore((state) => state.setAccountInfo);

  useLaunch(() => {
    console.log("App Launch");
    // 检测版本更新并自动下载最新版本
    const updateManager = Taro.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      console.log("检查更新", res.hasUpdate);
    });

    updateManager.onUpdateReady(() => {
      Taro.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    updateManager.onUpdateFailed(() => {
      Taro.showToast({
        title: "更新失败请重启",
        icon: "error",
        duration: 2000,
      });
    });

    // 载入缓存的设置, 根据设置里是否缓存歌曲和播放队列来决定是否载入播放器状态
    (useSettingsStore.persist.rehydrate() as Promise<void>).then(() => {
      if (useSettingsStore.getState().persistSongAndQueue) {
        usePlayerStore.persist.rehydrate();
      }
    });
  });

  // 全局监听播放器状态变化
  useEffect(() => {
    backgroundAudioManager.onError(() => {
      Taro.showToast({
        title: "播放错误",
        icon: "error",
      });
    });

    backgroundAudioManager.onPlay(() => {
      console.log("监听到 play 事件");
      setIsPlaying(true);
    });

    backgroundAudioManager.onPause(() => {
      console.log("监听到 pause 事件");
      setIsPlaying(false);
    });

    backgroundAudioManager.onStop(() => {
      console.log("监听到 stop 事件");
      setIsPlaying(false);
      setPlaybackProgress(0);
    });

    backgroundAudioManager.onEnded(() => {
      console.log("监听到 ended 事件");
      setPlaybackProgress(0);
      // 虽然这里设置了 false, 但是会触发 onPlay 事件立马设置为 true
      setIsPlaying(false);
      // 自动播放下一首
      playNextSong();
    });

    backgroundAudioManager.onTimeUpdate(() => {
      // 监听播放进度更新, 该事件在播放时持续触发
      console.log("监听到 timeupdate 事件", backgroundAudioManager.currentTime, backgroundAudioManager.duration);
      setPlaybackProgress(backgroundAudioManager.currentTime || 0);
    });

    backgroundAudioManager.onNext(() => {
      console.log("监听到 next 事件");
      playNextSong();
    });

    backgroundAudioManager.onPrev(() => {
      console.log("监听到 prev 事件");
      playPreviousSong();
    });

    backgroundAudioManager.onSeeking(() => {
      console.log("监听到 seeking 事件");
    });

    backgroundAudioManager.onSeeked(() => {
      console.log("监听到 seeked 事件");
    });
  }, [playNextSong, playPreviousSong, setIsPlaying, setPlaybackProgress]);

  useEffect(() => {
    // 初始化登录状态
    refreshUserInfo();
  }, [refreshUserInfo]);

  useEffect(() => {
    if (login) {
      // 若已登录获取我喜欢的音乐
      refreshFavoriteSongs();
    }
  }, [login, refreshFavoriteSongs]);

  useEffect(() => {
    if (login) {
      // 若已登录获取账户信息
      getAccountInfo().then((res) => {
        setAccountInfo(res.data);
      });
    }
  }, [login, setAccountInfo]);

  return children;
}

export default App;
