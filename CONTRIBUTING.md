# 贡献指南

## 项目架构

- 框架: [Taro](https://docs.taro.zone/docs/) + React + TypeScript + Sass
- UI 组件库: [NutUI React](https://nutui.jd.com/taro/react/3x/#/zh-CN/guide/intro-react)
- 状态管理: [Zustand](https://zustand.docs.pmnd.rs/)

## 本地开发

### 启动

```bash
# 安装依赖
npm install
# 启动项目
npm run dev:weapp
```

- 打开微信开发者工具, 导入整个工程, 选择**根目录**进行预览
- 可考虑关闭热重载, 避免频繁编译卡顿以及缓存问题
- 部分接口例如分享文件功能不支持在微信开发者工具里预览, 如需测试请使用真机调试

### 开发

- 由于小程序包有大小限制, 项目使用了分包, 新页面均需要到 `app.config.ts` 中注册分包
- 尽量不要引入过多第三方库, 会影响包体积, 一些工具函数可以自行实现, 参考 `src/utils` 目录下的代码. 如一定要引用, 第三方库最好是支持按需引入的方式
- 组件库除了搜索框以为均使用的是 NutUI React, 搜索框因为样式问题使用了 Taroify 的组件
- 小程序用到了部分微信云服务, 包括云存储和云数据库. 云服务暂时和我的另一个小程序公用环境, 如果打开页面云服务报错, 请联系我开通权限

## 打包发布

```bash
# 打包命令
npm run build:weapp
```

- 发布前更新百科的相关代码, 小变更即可
- `CHNAGELOG.md` 里记录了每个版本的更新内容, 发布新版本时请更新该文件
- 打包完成后, 在微信开发者工具中点击上传, 上传最新版本, 版本号小版本号递增即可
- 代码审核时把云存储里的 `isReviewed` 标记改成 `false`, 审核通过后再改回 `true`
