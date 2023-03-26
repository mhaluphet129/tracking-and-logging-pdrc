import React, { useEffect, useState } from "react";
import {
  Menu,
  Layout,
  Avatar,
  Modal,
  Button,
  Typography,
  Space,
  Form,
  Input,
  Dropdown,
  message,
  Affix,
} from "antd";
import {
  SettingFilled,
  LogoutOutlined,
  BarChartOutlined,
  TeamOutlined,
  SnippetsOutlined,
  WarningOutlined,
  UserAddOutlined,
  SettingOutlined,
  BlockOutlined,
  LoginOutlined,
  DiffOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import axios from "axios";
import moment from "moment";
import VisitorPage from "../components/Visitor";
import DashboardPage from "../components/Dashboard";
import VisitorLog from "../components/VisitorLog";
import ItemPage from "../components/Items";
import Violation from "../components/Violation";
import CheckIn from "../components/CheckIn";
import Report from "../components/Reports";
import Admin from "../components/Admin";
import io from "socket.io-client";
let socket;

const Sider = ({ selectedIndex }) => {
  let [items, setItems] = useState([
    {
      label: "Dashboard",
      key: "dashboard",
      icon: <BarChartOutlined style={{ fontSize: 20 }} />,
    },
    {
      label: "Visitors Profile",
      key: "visitor",
      icon: <TeamOutlined style={{ fontSize: 20 }} />,
    },
    {
      label: "Admin Page",
      key: "admin",
      icon: <UserAddOutlined style={{ fontSize: 20 }} />,
    },
    {
      label: "Visit Logs",
      key: "visitor-log",
      icon: <SnippetsOutlined style={{ fontSize: 20 }} />,
    },

    {
      label: "Items Page",
      key: "item",
      icon: <BlockOutlined style={{ fontSize: 20 }} />,
    },
    {
      label: "Check In",
      key: "checkin",
      icon: <LoginOutlined style={{ fontSize: 20 }} />,
    },
    {
      label: "Violations",
      key: "violations",
      icon: <WarningOutlined style={{ fontSize: 20 }} />,
    },
    {
      label: "Reports",
      key: "reports",
      icon: <DiffOutlined style={{ fontSize: 20 }} />,
    },
  ]);

  useEffect(() => {
    let currentUser = JSON.parse(Cookies.get("currentUser"));
    if (!currentUser?.role.includes("superadmin")) {
      setItems((e) => e.filter((_) => _.key != "admin"));
    }
  }, []);

  return (
    <Affix>
      <Layout.Sider collapsible theme="light">
        <Menu
          onClick={selectedIndex}
          items={items}
          defaultSelectedKeys="dashboard"
          style={{
            height: "100vh",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            marginTop: 30,
          }}
        />
      </Layout.Sider>
    </Affix>
  );
};

const Header = () => {
  const [currentUser, setCurrentUser] = useState({ name: "", lastname: "" });
  const [isConnected, setIsConnected] = useState(false);
  const [keyPair, setKeypair] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();

  const handleChangePassword = async (val) => {
    const { oldpass, newpass, confirmpass } = val;

    if (oldpass != currentUser?.password) {
      message.error("Old password is incorrect. Try Again");
      return;
    }

    if (newpass != confirmpass) {
      message.warn(
        "New password is not the same with Confirm Password. Try Again."
      );
      return;
    }

    let { data } = await axios.post("/api/etc", {
      payload: {
        mode: "change-password-admin",
        password: newpass,
      },
    });

    if (data.status == 200) {
      message.success(data?.message);
      setOpenPasswordModal(false);
    } else message.error(data?.message);
  };

  const handleUpdateProfile = async (val) => {
    if (
      Object.keys(val).filter((e) => val[e] == "" || val[e] == undefined)
        .length > 0
    ) {
      message.error("Input field should not be empty.");
      return;
    }

    let { data } = await axios.post("/api/etc", {
      payload: {
        mode: "update-admin",
        ...val,
      },
    });

    if (data.status == 200) {
      Cookies.set("currentUser", JSON.stringify(data?.data));
      message.success(data?.message);
      setIsChanged(false);
    } else message.error(data?.message);
  };

  useEffect(() => {
    fetch("/api/socket").finally(() => {
      socket = io();

      socket.emit("is-connected");
      socket.on("connection-status", (status) => {
        setIsConnected(status);
      });

      socket.on("room-connected", (data) => {
        Cookies.set("key", data);
        setKeypair(data);
      });
    });
  });
  useEffect(() => {
    setCurrentUser(JSON.parse(Cookies.get("currentUser")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Cookies.get("currentUser")]);

  return (
    <>
      <Modal
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        maskClosable={false}
        footer={[
          <Space
            style={{ display: "flex", justifyContent: "space-between" }}
            key={1}
          >
            <Typography.Text
              style={{ fontSize: 10, fontStyle: "italic" }}
              type="secondary"
            >
              account created at{" "}
              {moment(currentUser?.createdAt).format("MMMM DD, YYYY")}
            </Typography.Text>
            <Button disabled={!isChanged} onClick={form.submit}>
              SAVE
            </Button>
          </Space>,
        ]}
      >
        <Form
          labelCol={{
            flex: "90px",
          }}
          wrapperCol={{
            flex: 1,
          }}
          onChange={() => {
            setIsChanged(true);
          }}
          labelAlign="left"
          colon={false}
          form={form}
          onFinish={handleUpdateProfile}
          labelWrap
        >
          <Typography.Title level={5} style={{ marginBottom: 20 }}>
            Profile Settings
          </Typography.Title>

          <Form.Item label="Name" name="name" initialValue={currentUser?.name}>
            <Input
              value={currentUser?.name}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, name: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastname"
            initialValue={currentUser?.lastname}
          >
            <Input
              value={currentUser?.lastname}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, lastname: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            initialValue={currentUser?.email}
          >
            <Input
              value={currentUser?.email}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, email: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 0,
            }}
          >
            <Button type="primary" onClick={() => setOpenPasswordModal(true)}>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={openPasswordModal}
        onCancel={() => setOpenPasswordModal(false)}
        maskClosable={false}
        footer={null}
      >
        <Form layout="vertical" form={form2} onFinish={handleChangePassword}>
          <Form.Item label="Old Password" name="oldpass">
            <Input.Password />
          </Form.Item>
          <Form.Item label="New Password" name="newpass">
            <Input.Password />
          </Form.Item>
          <Form.Item label="Confirm Password" name="confirmpass">
            <Input.Password />
          </Form.Item>
          <Form.Item noStyle>
            <Button
              type="primary"
              style={{ width: "100%" }}
              htmlType="submit"
              size="large"
            >
              SUBMIT
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Affix>
        <Layout.Header
          style={{
            backgroundColor: "#aaa",
            display: "flex",
            alignItems: "center",
            paddingInline: 15,
          }}
        >
          <div
            style={{
              marginLeft: "auto",
              cursor: "pointer",

              background: "#fff",
              borderRadius: 5,
            }}
          >
            <Dropdown
              placement="bottom"
              overlayStyle={{ width: 180 }}
              menu={{
                items: [
                  {
                    key: 1,
                    label: "Profile Settings",
                    icon: <SettingFilled />,
                    onClick: () => setShowSettings(true),
                  },
                  {
                    key: 2,
                    label: "Log Out",
                    icon: <LogoutOutlined />,
                    onClick: () => {
                      Cookies.remove("currentUser");
                      Cookies.remove("loggedIn");
                      window.location.reload();
                    },
                  },
                ],
              }}
            >
              <div
                style={{
                  width: 160,
                  display: "flex",
                  alignItems: "center",
                  height: 50,
                  justifyContent: "space-around",
                }}
              >
                <Avatar size={40} icon={<UserOutlined />} />
                <Typography>
                  {currentUser.name[0]?.toUpperCase() +
                    currentUser.name.substring(1, currentUser.name.length)}{" "}
                  {currentUser.lastname[0]?.toUpperCase() +
                    currentUser.lastname.substring(
                      1,
                      currentUser.lastname.length
                    )}
                </Typography>
              </div>
            </Dropdown>
          </div>
        </Layout.Header>
      </Affix>
    </>
  );
};

const Content = ({ selectedKey }) => {
  return (
    <div style={{ backgroundColor: "#eee", height: "100%", padding: "10px" }}>
      {selectedKey == "dashboard" ? <DashboardPage /> : null}
      {selectedKey == "visitor" ? <VisitorPage /> : null}
      {selectedKey == "visitor-log" ? <VisitorLog /> : null}
      {selectedKey == "item" ? <ItemPage /> : null}
      {selectedKey == "checkin" ? <CheckIn /> : null}
      {selectedKey == "violations" ? <Violation /> : null}
      {selectedKey == "reports" ? <Report /> : null}
      {selectedKey == "admin" ? <Admin /> : null}
    </div>
  );
};

const Main = () => {
  return <></>;
};
export default Main;
export { Sider, Header, Content };
