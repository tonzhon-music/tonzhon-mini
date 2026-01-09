export default defineAppConfig({
  pages: ["pages/index/index", "pages/profile/index"],
  subPackages: [
    {
      root: "pages/search",
      pages: ["index"],
    },
    {
      root: "pages/search-result",
      pages: ["index"],
    },
    {
      root: "pages/recommend",
      pages: ["index"],
    },
    {
      root: "pages/artists",
      pages: ["index"],
    },
    {
      root: "pages/artist",
      pages: ["index"],
    },
    {
      root: "pages/my-playlists",
      pages: ["index"],
    },
    {
      root: "pages/playlists",
      pages: ["index"],
    },
    {
      root: "pages/playlist",
      pages: ["index"],
    },
    {
      root: "pages/player-full",
      pages: ["index"],
    },
    {
      root: "pages/favorite-songs",
      pages: ["index"],
    },
    {
      root: "pages/settings",
      pages: ["index"],
    },
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "铜钟",
    navigationBarTextStyle: "black",
  },
  // 申明需要后台运行的能力
  requiredBackgroundModes: ["audio"],
  tabBar: {
    selectedColor: "#dc8f03",
    color: "#000000",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "assets/img/home.png",
        selectedIconPath: "assets/img/home-selected.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "assets/img/user.png",
        selectedIconPath: "assets/img/user-selected.png",
      },
    ],
  },
});
