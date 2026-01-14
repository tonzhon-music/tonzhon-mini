import { useEffect, useState } from "react";
import { ScrollView, View } from "@tarojs/components";
import { Button, NoticeBar, SafeArea } from "@nutui/nutui-react-taro";
import Player from "@/components/player";
import ArtistList from "@/components/artist-list";
import { type Artist } from "@/api";
import { getCloud } from "@/cloud";
import { clsx } from "@/utils";
import Taro from "@tarojs/taro";
import { useReviewerStore } from "@/store";
import Instrument from "@/components/instrument";

import "./index.scss";

const categories = [
  {
    label: "华语男歌手",
    value: "chinese-male-singers",
  },
  {
    label: "华语女歌手",
    value: "chinese-female-singers",
  },
  {
    label: "华语组合",
    value: "chinese-teams",
  },
  {
    label: "海外男歌手",
    value: "overseas-male-singers",
  },
  {
    label: "海外女歌手",
    value: "overseas-female-singers",
  },
  {
    label: "海外组合",
    value: "overseas-teams",
  },
];

// 歌手列表页面
export default function Artists() {
  // 当前选中的分类的 value
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0].value);
  const [singers, setSingers] = useState<Record<string, Artist[]>>({});
  const isReviewed = useReviewerStore((state) => state.isReviewed);

  useEffect(() => {
    // 分页获取热门歌手
    getCloud().then((cloud) => {
      const allCategoryValues = categories.map((c) => c.value);
      Taro.showLoading({
        title: "获取歌手中...",
      });
      Promise.allSettled(allCategoryValues.map((c) => cloud.database().collection(`tz-${c}`).get()))
        .then((results) => {
          results.forEach((result, i) => {
            if (result.status === "fulfilled") {
              const data = result.value.data as Artist[];
              setSingers((prev) => ({ ...prev, [allCategoryValues[i]]: data ?? [] }));
            }
          });
        })
        .catch(() => {
          Taro.showToast({
            title: "获取歌手失败",
            icon: "error",
          });
        })
        .finally(() => {
          Taro.hideLoading();
        });
    });
  }, []);

  if (!isReviewed) {
    return (
      <Instrument
        title="箫"
        description="中国箫（洞箫）是一种历史悠久的竖吹竹制吹管乐器，音色圆润、幽静典雅，由竹管、吹孔、音孔（六孔或八孔）组成，以其悠扬空灵的音色常用于独奏、琴箫合奏，区别于横吹的笛子，具有独特的文化底蕴和养生价值。 "
      />
    );
  }

  return (
    <ScrollView scrollY>
      <NoticeBar
        scrollable
        style={{
          // @ts-ignore
          "--nutui-noticebar-background": "#EDF4FF",
          "--nutui-noticebar-color": "#3768FA",
        }}
        content="该页面仅列出部分热门歌手, 如果想要具体搜某歌手的歌曲请回到主页使用搜索功能"
      />
      <View className="artists-container">
        <ScrollView scrollX className="category-filter-wrapper">
          <View className="category-filter">
            {categories.map(({ label, value }) => (
              <Button
                key={value}
                size="small"
                shape="round"
                type={value === selectedCategory ? "warning" : "default"}
                className={clsx("category-btn", value !== selectedCategory && "white-btn")}
                onClick={() => {
                  setSelectedCategory(value);
                }}
              >
                {label}
              </Button>
            ))}
          </View>
        </ScrollView>

        <ArtistList singers={singers[selectedCategory] ?? []} />
      </View>

      <SafeArea position="bottom" />

      <Player />
    </ScrollView>
  );
}
