import { Avatar, Cell, pxTransform } from "@nutui/nutui-react-taro";
import { View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect } from "react";

type InstrumentProps = {
  title: string;
  description: string;
  src?: string;
};

export default function Instrument({ title, description, src }: InstrumentProps) {
  useEffect(() => {
    if (title) {
      Taro.setNavigationBarTitle({
        title: title,
      });
    }
  }, [title]);

  return (
    <Cell className="cell-avatar">
      {src ? <Avatar src={src} style={{ marginRight: pxTransform(10) }} /> : null}
      <View>
        <View style={{ fontSize: pxTransform(16) }}>{title}</View>
        <View style={{ fontSize: pxTransform(12) }}>{description}</View>
      </View>
    </Cell>
  );
}
