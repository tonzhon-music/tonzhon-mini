import type { StateStorage } from "zustand/middleware";
import Taro from "@tarojs/taro";

// 使用 Taro 的本地存储作为 Zustand 的存储方案
export const taroStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const res = await Taro.getStorage({ key: name });
      return res.data;
    } catch {
      return null;
    }
  },

  setItem: async (name, value) => {
    await Taro.setStorage({ key: name, data: value });
  },

  removeItem: async (name) => {
    await Taro.removeStorage({ key: name });
  },
};
