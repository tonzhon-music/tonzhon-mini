import { getSongSrc, type Song } from "@/api";
import Taro from "@tarojs/taro";

/**
 * 简易版 clsx 实现
 * clsx(
  'base',
  isActive && 'active',
  ['a', 'b'],
  { highlight: count > 3 }
)
 */
export function clsx(...args: any[]): string {
  const classes: string[] = [];

  args.forEach((arg) => {
    if (!arg) return;

    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      classes.push(clsx(...arg));
    } else if (typeof arg === "object") {
      Object.entries(arg).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  });

  return classes.join(" ");
}

// 判断值是否为 null 或 undefined
export function isNil(value: any): value is null | undefined {
  return value === null || value === undefined;
}

// 类似 lodash 的 uniqBy 方法
export function uniqBy<T, K = any>(arr: readonly T[], iteratee: ((item: T) => K) | keyof T): T[] {
  if (!Array.isArray(arr) || arr.length === 0) return [];

  const getKey: (item: T) => K =
    typeof iteratee === "function" ? (iteratee as (item: T) => K) : (item) => (item as any)[iteratee as string] as K;

  const seen = new Map<K, boolean>();
  const res: T[] = [];

  for (const item of arr) {
    const key = getKey(item);
    // Map uses SameValueZero for keys (NaN 等特殊情况也能处理)
    if (!seen.has(key)) {
      seen.set(key, true);
      res.push(item);
    }
  }

  return res;
}

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
      title: "下载中...",
    });
    return getSongSrc(song.newId)
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
              }).catch(console.error);
            })
            .catch(() => {
              Taro.showToast({
                title: "分享失败",
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
          title: "分享失败",
          icon: "error",
        });
      })
      .finally(() => {
        Taro.hideLoading();
      });
  }
}
