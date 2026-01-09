import { getCloud } from "@/cloud";
import { Button, ImagePreview, Table, Tabs, type TableProps } from "@nutui/nutui-react-taro";
import { View } from "@tarojs/components";
import { useEffect, useState } from "react";

export default function Wiki() {
  const [wikiData, setWikiData] = useState<any[]>([]);
  const [showImages, setShowImages] = useState(false);

  console.log("wikiData", wikiData);

  useEffect(() => {
    getCloud().then((cloud) => {
      cloud
        .database()
        .collection("tz-wiki")
        .get()
        .then((res) => {
          setWikiData(res.data);
        });
    });
  }, []);

  return (
    <View>
      <Tabs defaultValue="中国古代十大乐器">
        {wikiData.map(({ name, columns, data }) => (
          <Tabs.TabPane title={name} key={name} value={name}>
            <Table
              columns={columns.map((c, i) => ({
                title: c,
                key: c,
                fixed: i === 0 ? "left" : undefined,
              }))}
              data={data}
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
      <Button type="warning" block onClick={() => setShowImages(true)}>
        查看乐器图片
      </Button>

      <ImagePreview
        autoPlay
        indicator
        visible={showImages}
        onClose={() => setShowImages(false)}
        images={[
          {
            src: "https://yk2.fenx.top/e/d3d8bafaaef1091fe869a268a7d4ed82.jpeg",
          },
          {
            src: "https://yk2.fenx.top/e/ab5086f97b6e3a7b9d6ab821bc1576f2.jpg",
          },
          {
            src: "https://yk2.fenx.top/e/bdfc1d2b719c49d1f404cf7a691c5c82.jpg",
          },
          {
            src: "https://yk2.fenx.top/e/77ec4f462bef5fe8275c508949d871cf.jpg",
          },
          {
            src: "https://yk2.fenx.top/e/7517bc82cf9766a76897a9cffc5b5754.jpg",
          },
        ]}
      />
    </View>
  );
}
