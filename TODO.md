# 需求

## 高优先级

- [x] [更新通知](https://developers.weixin.qq.com/miniprogram/dev/api/base/update/wx.getUpdateManager.html)
- [x] 歌词
- [x] 注册
- [x] 歌曲持久化
- [x] 个人主页改成横向排列
- [x] 歌词下载
- [x] 设置页面, 设置也需要持久化
  - [x] 关于
  - [x] 显示歌词
  - [x] 播放速度
  - [x] 是否缓存歌曲和队列
  - [x] 清空缓存

## 低优先级

- [ ] 增加搜索标志
- [ ] 横幅放到关于页面
- [ ] 首页增加搜索框, 新歌放到导航, 热门歌曲单独在首页
- [x] 部分不好看的组件使用 [taroify](https://taroify.github.io/taroify.com/introduce/) 替代
  - [x] 搜索框
  - [ ] Segmented 暂无该组件

## BUG

- [x] 微信小程序自带的播放图标点击删除音频后, 铜钟小程序点击播放按钮就无法再播放
- [ ] 有歌词的播放器页面, 包括底部小播放也都存在性能问题, 怀疑和歌曲有关, 例如播放毛不易的《像我这样的人》时会卡顿
