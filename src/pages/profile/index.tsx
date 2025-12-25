import { ScrollView, View, Text } from "@tarojs/components";
import Player from "@/components/player";
import { Cell, Button, Avatar } from "@nutui/nutui-react-taro";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import { Add, ArrowRight, Articles, Feedback, FollowAdd, Heart, Mail } from "@nutui/icons-react-taro";
import Taro from "@tarojs/taro";
import LoginPopup from "@/components/login-popup";
import { useAuth } from "@/hooks";
import { getAccountInfo } from "@/api";
import CreatePlaylistPopup from "@/components/create-playlist-popup";
import { getCloud } from "@/cloud";

import AboutPopup from "./AboutPopup";
import "./index.scss";
import AboutWiki from "./AboutWiki";

export default function Profile() {
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  // 这里不需要取歌单数据, 只需要取喜欢的歌曲数量
  const favoriteSongsLength = useAuthStore((state) => state.favoriteSongs?.length ?? 0);
  const createdPlaylistsLength = useAuthStore((state) => state.user?.playlists?.length ?? 0);
  const collectedPlaylistsLength = useAuthStore((state) => state.user?.collectedPlaylists?.length ?? 0);
  const openLoginPopup = useAuthStore((state) => state.openLoginPopup);
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const { confirmSignout, checkLogin } = useAuth();
  const [email, setEmail] = useState<string>("");
  const openCreatePlaylistPopup = useAuthStore((state) => state.openCreatePlaylistPopup);
  const [isReviewed, setIsReviewed] = useState<boolean>(false);

  useEffect(() => {
    if (login) {
      // TODO: 理论上 email 应该是写在 store 里的, 但是这里暂时仅在该页面使用
      getAccountInfo().then((res) => {
        setEmail(res.data.email ?? "");
      });
    }
  }, [login]);

  useEffect(() => {
    getCloud().then((cloud) => {
      cloud
        .database()
        .collection("tz-settings")
        .get()
        .then((res) => {
          const data = res.data[0] as { isReviewed: boolean } | undefined;
          setIsReviewed(data?.isReviewed ?? false);
        });
    });
  }, []);

  if (!isReviewed) {
    return <AboutWiki />;
  }

  return (
    <ScrollView scrollY>
      <View className="profile-container">
        <Cell
          className="profile-info"
          clickable
          onClick={() => {
            if (login) {
              confirmSignout();
            } else {
              openLoginPopup();
            }
          }}
        >
          <Avatar size="large" />
          <Text className="profile-name">{login ? user?.username : "未登录"}</Text>
          {login && email ? (
            <View className="profile-email">
              <Mail />
              <Text>{email}</Text>
            </View>
          ) : null}
        </Cell>

        <Cell.Group title="个人" className="profile-personal">
          <Cell
            className="cell-extra-with-text"
            title={
              <View className="profile-personal-cell-title">
                <Heart />
                <Text>喜欢的歌曲</Text>
              </View>
            }
            clickable
            extra={
              <View className="cell-extra-with-text-wrapper">
                <Text>{favoriteSongsLength}</Text>
                <ArrowRight />
              </View>
            }
            onClick={() => {
              checkLogin().then(() => {
                Taro.navigateTo({
                  url: "/pages/favorite-songs/index",
                });
              });
            }}
          />
          <Cell
            className="cell-extra-with-text"
            title={
              <View className="profile-personal-cell-title">
                <Feedback />
                <Text>自建歌单</Text>
              </View>
            }
            clickable
            extra={
              <View className="cell-extra-with-text-wrapper">
                <Text>{createdPlaylistsLength}</Text>
                <ArrowRight />
              </View>
            }
            onClick={() => {
              checkLogin().then(() => {
                Taro.navigateTo({
                  url: "/pages/my-playlists/index?tab=created",
                });
              });
            }}
          />
          <Cell
            className="cell-extra-with-text"
            title={
              <View className="profile-personal-cell-title">
                <Articles />
                <Text>收藏歌单</Text>
              </View>
            }
            clickable
            extra={
              <View className="cell-extra-with-text-wrapper">
                <Text>{collectedPlaylistsLength}</Text>
                <ArrowRight />
              </View>
            }
            onClick={() => {
              checkLogin().then(() => {
                Taro.navigateTo({
                  url: "/pages/my-playlists/index?tab=collected",
                });
              });
            }}
          />

          <Cell
            title={
              <View className="profile-personal-cell-title">
                <FollowAdd />
                <Text>新建歌单</Text>
              </View>
            }
            clickable
            extra={<Add />}
            onClick={() => {
              checkLogin().then(() => {
                openCreatePlaylistPopup();
              });
            }}
          />
        </Cell.Group>

        <Cell.Group title="设置">
          <Cell
            title="关于铜钟"
            clickable
            extra={<ArrowRight />}
            onClick={() => {
              setShowAboutPopup(true);
            }}
          />
          <Cell
            title="网页版"
            clickable
            className="cell-extra-with-text"
            extra={<ArrowRight />}
            onClick={() => {
              Taro.setClipboardData({
                data: "https://tonzhon.whamon.com/",
              }).then(() => {
                Taro.showToast({
                  title: "链接已复制",
                  icon: "success",
                });
              });
            }}
          />
        </Cell.Group>

        <Button
          type="warning"
          block
          className="login-btn"
          size="large"
          onClick={() => {
            if (login) {
              // 退出登录
              confirmSignout();
            } else {
              // 登录
              openLoginPopup();
            }
          }}
        >
          {login ? "退出登录" : "立即登录"}
        </Button>

        <AboutPopup
          visible={showAboutPopup}
          onClose={() => {
            setShowAboutPopup(false);
          }}
        />
        <LoginPopup />
        <CreatePlaylistPopup />

        <Player />
      </View>
    </ScrollView>
  );
}
