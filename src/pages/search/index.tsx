import { Menu, pxTransform, Tag } from "@nutui/nutui-react-taro";
import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Del } from "@nutui/icons-react-taro";
import { useCallback, useEffect, useState } from "react";
import Player from "@/components/player";
import { Search as VSearch } from "@taroify/core";
import "@taroify/core/search/style";
import { useReviewerStore } from "@/store";
import Instrument from "@/components/instrument";

import "./index.scss";

const SEARCH_HISTORY_STORAGE_KEY = "search_history";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const isReviewed = useReviewerStore((state) => state.isReviewed);

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

  // 跳转到搜索结果页并存储搜索历史
  const saveHistoryAndNavigate = useCallback(
    (value: string) => {
      Taro.navigateTo({
        url: `/pages/search-result/index?keyword=${value.trim()}`,
      });
      setSearchHistoryByItem(value.trim());
    },
    [setSearchHistoryByItem]
  );

  useEffect(() => {
    getSearchHistory();
  }, [getSearchHistory]);

  if (!isReviewed) {
    Taro.setNavigationBarTitle({
      title: "鼓",
    });
    return (
      <Instrument
        title="鼓"
        description="中国鼓是历史悠久、种类繁多的传统打击乐器，由鼓身（木框或陶土）和蒙面（通常是牛皮）组成，功能从远古的祭祀、战争、狩猎信号，发展到后来的礼乐、戏曲、歌舞伴奏，常见有大鼓、花盆鼓、腰鼓、堂鼓等，其文化内涵深刻，象征着力量与精神，至今仍活跃在各种表演与庆典中。 "
      />
    );
  }

  return (
    <View className="search-container">
      <VSearch
        value={searchText}
        onChange={(e) => {
          const value = e.detail.value;
          setSearchText(value.trim());
        }}
        placeholder="安全搜索"
        autoFocus
        action={
          <Text
            onClick={() => {
              saveHistoryAndNavigate(searchText);
            }}
          >
            搜索
          </Text>
        }
        onSearch={(e) => {
          const value = e.detail.value.trim();
          saveHistoryAndNavigate(value);
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
