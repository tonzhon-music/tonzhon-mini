// 歌词相关的工具函数
export type LyricLine = {
  // 单位 秒
  time: number;
  text: string;
};

// 将 lrc 字符串解析为 LyricLine 数组, 只包含时间轴和歌词文本
export function parseLRC(lrc: string): LyricLine[] {
  const result: LyricLine[] = [];

  const lines = lrc.split("\n");
  const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})]/g;

  for (const line of lines) {
    if (!line.trim()) continue;

    const times: number[] = [];
    let match: RegExpExecArray | null;

    while ((match = timeReg.exec(line))) {
      const [, mm, ss, ms] = match;
      const time = Number(mm) * 60 + Number(ss) + Number(ms.padEnd(3, "0")) / 1000;
      times.push(time);
    }

    const text = line.replace(timeReg, "").trim();

    // 只有时间轴，没有歌词的行，直接跳过
    if (!text) continue;

    // 一行可能对应多个时间
    for (const time of times) {
      result.push({ time, text });
    }
  }

  // 按时间排序，方便播放器使用
  result.sort((a, b) => a.time - b.time);

  return result;
}

// 给定当前播放时间，获取对应的歌词行索引
export function getCurrentLyricIndex(lyrics: LyricLine[], currentTime: number) {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return i;
    }
  }
  return 0;
}

export function getCurrentLyricIndexBinarySearch(lyrics: LyricLine[], currentTime: number) {
  if (lyrics.length === 0) return 0;

  // 二分查找
  let left = 0;
  let right = lyrics.length - 1;
  let result = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (lyrics[mid].time <= currentTime) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}
