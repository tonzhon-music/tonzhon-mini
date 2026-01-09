import { Popup, pxTransform } from "@nutui/nutui-react-taro";
import { View, Text } from "@tarojs/components";

type AboutPopupProps = {
  visible: boolean;
  onClose: () => void;
};

export default function AboutPopup({ visible, onClose }: AboutPopupProps) {
  return (
    <Popup
      title="关于铜钟"
      round
      visible={visible}
      onClose={onClose}
      style={{ height: 450 }}
      position="bottom"
      closeable
    >
      <View className="about-popup-content">
        <Text className="content-title">铜钟</Text>
        <Text className="content-body" userSelect>
          铜钟 (Tonzhon) 是一个主打「听歌」功能的 web app,
          致力于为人们带来卓越的听歌体验。铜钟有着丰富的音乐资源，干净清爽的 UI
          和方便的交互。在铜钟上，你不仅可以方便地找到并聆听你喜欢的歌曲，还可以将它们保存下来。
        </Text>
        <Text className="content-body" userSelect>
          铜钟上的一切内容都是与音乐直接相关的，没有广告，社交和直播，不会干扰你的听歌心情。在铜钟上，你可以沉浸到属于你自己一个人的那片天地，忘却世间的纷纷扰扰...
        </Text>
        <Text className="content-title" style={{ marginTop: pxTransform(16) }}>
          铜钟小程序
        </Text>
        <Text className="content-body" userSelect>
          铜钟小程序为社区爱好者基于铜钟网页的功能开发的一款轻量级应用, 由于 ios 端上架独立的铜钟 App 难度较大,
          固考虑通过实现小程序来磨平双端差异, 不管用户手机是安卓, 苹果还是鸿蒙均可以愉快的听歌了~
        </Text>
      </View>
    </Popup>
  );
}
