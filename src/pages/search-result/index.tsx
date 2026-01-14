import { ScrollView, View, Text } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { searchAll, getSongsOfArtist, searchFromPlatform, type Song } from "@/api";
import { useEffect, useMemo, useState } from "react";
import SongList from "@/components/song-list";
import Player from "@/components/player";
import { SafeArea } from "@nutui/nutui-react-taro";
import { uniqBy } from "@/utils";
import { useReviewerStore } from "@/store";
import Instrument from "@/components/instrument";

import "./index.scss";

export default function SearchResult() {
  const {
    params: { keyword },
  } = useRouter<{ keyword: string }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchArtistSongLoading, setSearchArtistSongLoading] = useState(false);
  const [searchPlatformLoading, setSearchPlatformLoading] = useState(false);
  const isReviewed = useReviewerStore((state) => state.isReviewed);

  // 整合所有的搜索结果，去重并排序
  const filteredSongs = useMemo(() => {
    if (songs.length) {
      const uniqueSongs = uniqBy(songs, "newId");
      // 有封面的在前面
      return [...uniqueSongs].sort((a, b) => {
        const aHasCover = Boolean(a.cover);
        const bHasCover = Boolean(b.cover);

        if (aHasCover === bHasCover) return 0;
        return aHasCover ? -1 : 1;
      });
    }
    return [];
  }, [songs]);

  useEffect(() => {
    if (keyword) {
      setSearchLoading(true);
      searchAll(keyword)
        .then((res) => {
          if (res.data.success) {
            setSongs((prevSongs) => [...prevSongs, ...(res.data.data ?? [])]);
          } else {
            throw new Error();
          }
        })
        .finally(() => {
          setSearchLoading(false);
        });
    }
  }, [keyword]);

  useEffect(() => {
    if (keyword) {
      setSearchArtistSongLoading(true);
      getSongsOfArtist(keyword)
        .then((res) => {
          if (res.data?.songs?.length) {
            setSongs((prevSongs) => [...prevSongs, ...(res.data?.songs ?? [])]);
          }
        })
        .finally(() => {
          setSearchArtistSongLoading(false);
        });
    }
  }, [keyword]);

  useEffect(() => {
    const platforms = ["q", "n", "k"] as const;
    if (keyword) {
      setSearchPlatformLoading(true);
      Promise.allSettled(platforms.map((c) => searchFromPlatform(keyword, c)))
        .then((results) => {
          results.forEach((r) => {
            if (r.status === "fulfilled") {
              if (r.value.data.success) {
                setSongs((prevSongs) => [...prevSongs, ...(r.value.data?.data?.songs ?? [])]);
              }
            }
          });
        })
        .finally(() => {
          setSearchPlatformLoading(false);
        });
    }
  }, [keyword]);

  useEffect(() => {
    if (searchLoading || searchArtistSongLoading || searchPlatformLoading) {
      Taro.showLoading({
        title: "搜索中...",
      });
    } else {
      Taro.hideLoading();
    }
  }, [searchLoading, searchArtistSongLoading, searchPlatformLoading]);

  if (!isReviewed) {
    return (
      <Instrument
        title="埙"
        description="中国埙是中国最古老的吹奏乐器之一，由陶土烧制，外形多为椭圆或卵形，音色古朴醇厚，起源可追溯至七千多年前新石器时代，最初可能用于模仿鸟兽声诱捕猎物，后演化为可吹奏旋律的乐器，是古代宫廷雅乐和民间喜爱的乐器。 "
      />
    );
  }

  return (
    <ScrollView scrollY>
      <View className="search-result">
        <SongList
          songs={filteredSongs}
          title={
            <View>
              <Text>搜索</Text>
              <Text className="highlight">{keyword}</Text>
            </View>
          }
          extra={<Text className="grey">共 {filteredSongs.length} 搜索结果</Text>}
        />
      </View>
      <SafeArea position="bottom" />
      <Player />
    </ScrollView>
  );
}
