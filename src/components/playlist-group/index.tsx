import { View, Text } from "@tarojs/components";
import { type Playlist } from "@/api";
import { Row, Col, Avatar, Cell, Segmented } from "@nutui/nutui-react-taro";
import { getPlaylistCoverUrl } from "@/utils";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { AddToHome, ArrowRight, Feedback, Image } from "@nutui/icons-react-taro";

import "./index.scss";

type PlaylistGroupProps = {
  playlists: Playlist[];
  extra?: React.ReactNode;
};

// 宫格模式和列表模式
type Mode = "grid" | "list";

export default function PlaylistGroup({ playlists, extra }: PlaylistGroupProps) {
  const [mode, setMode] = useState<Mode>("list");

  return (
    <View className="playlist-group-container">
      <View className="playlist-group-header">
        <Segmented
          value={mode}
          options={[
            {
              label: "列表",
              value: "list",
              icon: <Feedback />,
            },
            {
              label: "宫格",
              value: "grid",
              icon: <AddToHome />,
            },
          ]}
          onChange={(v) => {
            setMode(v as Mode);
          }}
        />
        {extra}
      </View>

      {mode === "grid" ? (
        <Cell>
          <Row gutter={16} wrap="wrap" type="flex">
            {playlists?.map((playlist) => (
              <Col span={8} key={playlist.id}>
                <View
                  className="playlist-grid-item"
                  onClick={() => {
                    Taro.navigateTo({
                      url: `/pages/playlist/index?id=${playlist.id}`,
                    });
                  }}
                >
                  <Avatar
                    src={playlist.cover ? getPlaylistCoverUrl(playlist.cover) : undefined}
                    icon={playlist.cover ? undefined : <Image />}
                    size="96"
                    shape="square"
                  />
                  <Text>{playlist.name}</Text>
                </View>
              </Col>
            ))}
          </Row>
        </Cell>
      ) : (
        <Cell.Group>
          {playlists?.map((playlist) => (
            <Cell
              key={playlist.id}
              className="playlist-list-cell"
              clickable
              onClick={() => {
                Taro.navigateTo({
                  url: `/pages/playlist/index?id=${playlist.id}`,
                });
              }}
            >
              <View className="playlist-info">
                <Avatar
                  src={playlist.cover ? getPlaylistCoverUrl(playlist.cover) : undefined}
                  icon={playlist.cover ? undefined : <Image />}
                  shape="square"
                />
                <Text className="ellipsis">{playlist.name}</Text>
              </View>
              <View className="playlist-actions">
                <ArrowRight />
              </View>
            </Cell>
          ))}
        </Cell.Group>
      )}
    </View>
  );
}
