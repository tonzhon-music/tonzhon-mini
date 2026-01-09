import { Button, Form, Input, Popup, Tabs, type TabPaneProps } from "@nutui/nutui-react-taro";
import { useAuthStore } from "@/store";
import { View, Text } from "@tarojs/components";
import { signin, COOKIE_KEY, checkEmail, checkUsername, signup } from "@/api";
import Taro from "@tarojs/taro";
import { useState } from "react";

import "./index.scss";

type LoginFormValues = {
  username: string;
  password: string;
};

type SignupFormValues = {
  username: string;
  email: string;
  password: string;
};

const tabs: Partial<TabPaneProps>[] = [
  {
    title: "登录铜钟",
    value: "login",
  },
  {
    title: "注册铜钟",
    value: "signup",
  },
];

// 包含注册功能的登录弹框, 名字不改了
export default function LoginPopup() {
  const { showLoginPopup, closeLoginPopup, setLogin, setUser } = useAuthStore();
  const [loginForm] = Form.useForm();
  const [signupForm] = Form.useForm();
  const [tab, setTab] = useState<string>("login");

  const closeAndResetPopup = () => {
    // 重置表单
    loginForm.resetFields();
    signupForm.resetFields();
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
        <Tabs
          value={tab}
          onChange={(value) => {
            setTab(value as string);
          }}
        >
          {tabs.map(({ value, title }) => (
            <Tabs.TabPane key={value} title={title} value={value} />
          ))}
        </Tabs>

        {/* 这里保留两个表单的 DOM, 仅使用 display 来显影, 如果直接使用三元表达式例如 tab === login ? LoginForm : SignupForm 的话校验会丢失, 目前暂不知道原因, 推测是组件库的问题 */}

        <Form
          style={{ display: tab === "login" ? "block" : "none" }}
          form={loginForm}
          onFinish={(values: LoginFormValues) => {
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
                loginForm.submit();
              }}
            >
              登录
            </Button>
          }
        >
          <Form.Item name="username" label="账号" rules={[{ required: true, message: "请输入账号" }]}>
            <Input placeholder="请输入账号" clearable />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
            <Input placeholder="请输入密码" type="password" clearable />
          </Form.Item>
        </Form>

        <Form
          style={{ display: tab === "signup" ? "block" : "none" }}
          form={signupForm}
          onFinish={(values: SignupFormValues) => {
            Taro.showLoading({
              title: "注册中...",
            });
            signup(values)
              .then((res) => {
                if (res.statusCode < 300 && res.statusCode >= 200) {
                  Taro.showToast({
                    title: "注册成功, 请前往邮箱进行验证",
                    icon: "none",
                    duration: 2000,
                  });
                  // 切换到登录页
                  setTab("login");
                  loginForm.setFieldsValue({
                    username: values.username,
                    password: values.password,
                  });
                } else {
                  throw new Error();
                }
              })
              .catch(() => {
                Taro.showToast({
                  title: "注册失败请重试",
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
                signupForm.submit();
              }}
            >
              注册
            </Button>
          }
        >
          <Form.Item
            name="username"
            label="账号"
            validateTrigger="onBlur"
            rules={[
              { required: true, message: "请输入账号" },
              {
                validator: (rule, value) => {
                  // 注意这里一个非常坑的设计, Taro.request 在 status 为 422 仍旧进入 then 而非 catch
                  return checkUsername({ username: value }).then((res) => {
                    if (res.statusCode === 422) {
                      throw new Error();
                    } else {
                      return true;
                    }
                  });
                },
                message: "用户名已被占用",
              },
            ]}
          >
            <Input placeholder="请输入账号" clearable />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            validateTrigger="onBlur"
            required
            rules={[
              { required: true, message: "请输入邮箱" },
              {
                validator: (rule, value) => {
                  // 注意这里一个非常坑的设计, Taro.request 在 status 422 仍旧进入 then 而非 catch
                  return checkEmail({ email: value }).then((res) => {
                    if (res.statusCode === 422) {
                      throw new Error();
                    } else {
                      return true;
                    }
                  });
                },
                message: "邮箱已被占用",
              },
            ]}
          >
            <Input placeholder="请输入邮箱" clearable />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
            <Input placeholder="请输入密码" type="password" clearable />
          </Form.Item>
        </Form>
      </View>
    </Popup>
  );
}
