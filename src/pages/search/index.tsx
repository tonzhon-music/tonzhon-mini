import { Menu, pxTransform, SearchBar, Tag } from "@nutui/nutui-react-taro";
import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Articles, Del, Notice, User } from "@nutui/icons-react-taro";
import { useCallback, useEffect, useState } from "react";
import Player from "@/components/player";

import "./index.scss";

const SEARCH_HISTORY_STORAGE_KEY = "search_history";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const getSearchHistory = useCallback(() => {
    Taro.getStorage({ key: SEARCH_HISTORY_STORAGE_KEY })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length) {
          setSearchHistory(res.data);
        }
      })
      .catch(() => {
        console.log("获取搜索历史记录失败");
        setSearchHistory([]);
      });
  }, []);

  // 往搜索历史添加一项
  const setSearchHistoryByItem = useCallback(
    (historyItem: string) => {
      const newHistory = [historyItem, ...searchHistory.filter((item) => item !== historyItem)];
      Taro.setStorage({
        key: SEARCH_HISTORY_STORAGE_KEY,
        data: newHistory,
      }).finally(() => {
        // 不管存储成功与否都刷新搜索历史
        getSearchHistory();
      });
    },
    [getSearchHistory, searchHistory]
  );

  useEffect(() => {
    getSearchHistory();
  }, [getSearchHistory]);

  return (
    <View className="search-container">
      <SearchBar
        value={searchText}
        onChange={(value) => {
          setSearchText(value.trim());
        }}
        // shape="round"
        placeholder="安全搜索"
        autoFocus
        clearable
        onSearch={(value) => {
          // 跳转到搜索结果页并存储搜索历史
          Taro.navigateTo({
            url: `/pages/search-result/index?keyword=${value.trim()}`,
          });
          setSearchHistoryByItem(value.trim());
        }}
      />

      {searchHistory.length ? (
        <View className="search-history-container">
          <View className="search-history-title">
            <Text className="search-history-label">搜索历史</Text>
            <Del
              size={18}
              style={{ marginRight: pxTransform(8) }}
              onClick={() => {
                Taro.showModal({
                  title: "是否清空所有搜索历史?",
                  confirmText: "清空",
                  confirmColor: "#dc8f03",
                  success: (res) => {
                    if (res.confirm) {
                      Taro.removeStorage({ key: SEARCH_HISTORY_STORAGE_KEY }).finally(() => {
                        // 不管删除成功与否都刷新搜索历史
                        getSearchHistory();
                      });
                    }
                  },
                });
              }}
            />
          </View>
          <View className="search-history-tags">
            {searchHistory.map((historyItem) => (
              <Tag
                plain
                round
                className="search-history-tag"
                key={historyItem}
                onClick={() => {
                  // 点击某一项搜索历史, 直接跳转到搜索结果页
                  Taro.navigateTo({
                    url: `/pages/search-result/index?keyword=${historyItem}`,
                  });
                  setSearchHistoryByItem(historyItem);
                }}
              >
                {historyItem}
              </Tag>
            ))}
          </View>
        </View>
      ) : null}

      <Player />
    </View>
  );
}
