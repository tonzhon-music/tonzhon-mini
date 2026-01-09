import { getSongLyrics, getSongSrc, type Song } from "@/api";
import Taro from "@tarojs/taro";

// 播放器相关的工具函数

export function getPlaylistCoverUrl(cover?: string) {
  if (!cover) {
    return "";
  }
  return `https://playlist-covers.oss-cn-shanghai.aliyuncs.com/${cover}?x-oss-process=style/150`;
}

export function formatCount(count = 0) {
  if (count >= 10000) {
    return (count / 10000).toFixed(1).replace(/\.0$/, "") + "万";
  }
  return count.toString();
}

// 格式化歌曲时长, 返回 mm:ss 格式, 默认返回 00:00, duration 单位为秒
export function formatSongDuration(duration = 0) {
  const m = Math.floor(duration / 60);
  const s = Math.floor(duration % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${mm}:${ss}`;
}

// 格式化歌曲播放进度百分比
export function formatSongDurationToPercent(current: number, total: number) {
  if (total === 0) return 0;
  return (current / total) * 100 || 0;
}

// 复制歌曲信息到剪贴板, 格式为: 歌曲名: xxx, 艺人: xxx, 专辑: xxx
export function copySongInfoToClipboard(song?: Song) {
  const info = `歌曲名: ${song?.name}, 艺人: ${song?.artists?.map((a) => a.name).join(" / ")}, 专辑名: ${
    song?.album.name
  }`;
  return Taro.setClipboardData({
    data: info,
    success: () => {
      Taro.showToast({
        title: "歌曲信息已复制",
        icon: "success",
      });
    },
  });
}

export function copySongLinkToClipboard(song?: Song) {
  if (song) {
    return getSongSrc(song.newId).then((res) => {
      if (res.data.success) {
        Taro.setClipboardData({
          data: res.data.data,
          success: () => {
            Taro.showToast({
              title: "歌曲链接已复制",
              icon: "success",
            });
          },
        });
      }
    });
  }
}

// 某个音乐文件获取他的后缀名, 默认为 .mp3
function getSongFileExt(url: string): string | null {
  const match = url.match(/\.([^.\/?#]+)(?:[?#]|$)/);
  return match ? match[1] : "mp3";
}

// 下载并且通过微信分享给其他人保存, 该函数需要在真机上测试
export function downloadAndShareSong(song?: Song) {
  if (song) {
    Taro.showLoading({
      title: "下载歌词中...",
    });
    getSongSrc(song.newId)
      .then((res) => {
        if (res.data.success) {
          const url = res.data.data;
          Taro.downloadFile({
            url,
          })
            .then((r) => {
              const ext = getSongFileExt(url);
              Taro.shareFileMessage({
                filePath: r.tempFilePath,
                fileName: `${song.name}.${ext}`,
              }).catch(() => {
                throw new Error();
              });
            })
            .catch(() => {
              Taro.showToast({
                title: "分享歌曲失败",
                icon: "error",
              });
            })
            .finally(() => {
              Taro.hideLoading();
            });
        }
      })
      .catch(() => {
        Taro.showToast({
          title: "分享歌曲失败",
          icon: "error",
        });
      })
      .finally(() => {
        Taro.hideLoading();
      });
  }
}

// 下载并通过微信分享歌词给他人保存, 默认歌词格式为 .lrc
export function downloadAndShareLyric(song?: Song) {
  const fs = Taro.getFileSystemManager();
  const filePath = `${Taro.env.USER_DATA_PATH}/${song?.name}.lrc`;

  if (song) {
    Taro.showLoading({
      title: "下载歌词中...",
    });
    getSongLyrics(song.newId)
      .then((res) => {
        if (res.data.success) {
          const lyric = res.data.data;
          // 这里只能用同步方式, 使用异步方式会报错, 原因暂且不明
          try {
            fs.writeFileSync(filePath, lyric, "utf8");
            Taro.shareFileMessage({
              filePath,
            }).catch(() => {
              throw new Error();
            });
          } catch (err) {
            console.error("写入歌词文件失败", err);
            Taro.showToast({
              title: "分享歌词失败",
              icon: "error",
            });
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        Taro.showToast({
          title: "获取歌词失败",
          icon: "error",
        });
      })
      .finally(() => {
        Taro.hideLoading();
      });
  }
}
