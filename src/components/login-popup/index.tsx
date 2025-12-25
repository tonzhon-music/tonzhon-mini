import { Button, Form, Input, Popup } from "@nutui/nutui-react-taro";
import { useAuthStore } from "@/store";
import { View, Text } from "@tarojs/components";
import { signin, COOKIE_KEY } from "@/api";
import Taro from "@tarojs/taro";

import "./index.scss";

type FormValues = {
  username: string;
  password: string;
};

// 登录弹窗
export default function LoginPopup() {
  const { showLoginPopup, closeLoginPopup, setLogin, setUser } = useAuthStore();
  const [form] = Form.useForm();

  const closeAndResetPopup = () => {
    // 重置表单
    form.resetFields();
    closeLoginPopup();
  };

  return (
    <Popup
      position="bottom"
      visible={showLoginPopup}
      closeable
      onClose={() => {
        closeAndResetPopup();
      }}
      className="login-popup"
    >
      <View className="login-popup-body">
        <Form
          form={form}
          className="login-form"
          onFinish={(values: FormValues) => {
            Taro.showLoading({
              title: "登录中...",
            });
            signin(values)
              .then((res) => {
                if (res.data?.success) {
                  // 设置登录状态
                  setLogin(true);
                  setUser(res.data.data!);
                  // 手动写入 cookie
                  Taro.setStorageSync(COOKIE_KEY, res.header["Set-Cookie"]);
                  // 重置并关闭弹框
                  closeAndResetPopup();
                } else {
                  throw new Error(res.data?.message);
                }
              })
              .catch((error) => {
                Taro.showToast({
                  title: error.message || "登录失败",
                  icon: "error",
                });
              })
              .finally(() => {
                Taro.hideLoading();
              });
          }}
          divider
          labelPosition="left"
          starPosition="right"
          footer={
            <Button
              block
              type="warning"
              nativeType="submit"
              size="large"
              onClick={() => {
                form.submit();
              }}
            >
              登录
            </Button>
          }
        >
          <Text className="login-title">登录铜钟</Text>
          <Form.Item name="username" label="账号" rules={[{ required: true, message: "请输入账号" }]}>
            <Input placeholder="请输入账号" clearable />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
            <Input placeholder="请输入密码" type="password" clearable />
          </Form.Item>
        </Form>
      </View>
    </Popup>
  );
}
