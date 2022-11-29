import React, { useEffect, useState } from "react";
import {
  Menu,
  Layout,
  Avatar,
  Modal,
  Button,
  Typography,
  Tag,
  Tooltip,
  Space,
} from "antd";
import {
  UserOutlined,
  SettingFilled,
  LogoutOutlined,
  BarChartOutlined,
  TeamOutlined,
  SnippetsOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  BlockOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import axios from "axios";
import VisitorPage from "../components/Visitor";
import DashboardPage from "../components/Dashboard";
import Profiler from "../assets/utilities/profiler";
import VisitorLog from "../components/VisitorLog";
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
      label: "Visit Logs",
      key: "visitor-log",
      icon: <SnippetsOutlined style={{ fontSize: 20 }} />,
    },
  ]);

  useEffect(() => {
    let currentUser = JSON.parse(Cookies.get("currentUser"));
    if (!currentUser?.role.includes("superadmin")) {
      setItems((e) => e.filter((_) => _.key != "admin"));
    }
  }, []);

  return (
    <Layout.Sider collapsible theme="light">
      <div style={{ height: "25vh", backgroundColor: "#fff" }} />
      <Menu
        onClick={selectedIndex}
        items={items}
        defaultSelectedKeys="dashboard"
        style={{
          minHeight: "70vh",
          fontSize: 15,
          fontWeight: 700,
        }}
      />
    </Layout.Sider>
  );
};

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "", lastname: "" });
  const [isConnected, setIsConnected] = useState(false);
  const [keyPair, setKeypair] = useState("");

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
  }, [Cookies.get("currentUser")]);

  return (
    <Layout.Header
      style={{
        backgroundColor: "#aaa",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Space style={{ marginRight: "auto" }}>
        <Tooltip title="Generate a new key and disconnect current device.">
          <Button size="small" onClick={() => socket.emit("new-key")}>
            <ReloadOutlined />
          </Button>
        </Tooltip>
        <Tooltip
          title={isConnected ? "Connected" : "Not Connected to any device"}
        >
          <Tag color={isConnected ? "success" : "red"}>
            <Typography.Text strong>{keyPair.toUpperCase()}</Typography.Text>
            {isConnected ? <CheckCircleOutlined /> : <WarningOutlined />}
          </Tag>
        </Tooltip>
      </Space>
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        closable={false}
        footer={null}
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <UserOutlined style={{ width: "40vw", fontSize: "10rem" }} />
        <Typography.Title level={2} style={{ textAlign: "center" }}>
          {currentUser.name} {currentUser.lastname}
        </Typography.Title>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button icon={<SettingFilled />} style={{ marginRight: "5px" }}>
            Settings
          </Button>
          <Button
            icon={<LogoutOutlined />}
            style={{ marginLeft: "5px" }}
            type="primary"
            onClick={() => {
              Cookies.remove("currentUser");
              Cookies.remove("loggedIn");
              window.location.reload();
            }}
          >
            Logout
          </Button>
        </div>
      </Modal>
      <Avatar
        size="large"
        style={{ marginLeft: "auto", cursor: "pointer" }}
        onClick={() => setShowModal(true)}
      >
        {currentUser.name[0]?.toUpperCase()}{" "}
        {currentUser.lastname[0]?.toUpperCase()}
      </Avatar>
    </Layout.Header>
  );
};

const Content = ({ selectedKey }) => {
  return (
    <div style={{ backgroundColor: "#eee", height: "100%", padding: "10px" }}>
      {selectedKey == "dashboard" ? <DashboardPage /> : null}
      {selectedKey == "visitor" ? <VisitorPage /> : null}
      {selectedKey == "visitor-log" ? <VisitorLog /> : null}
    </div>
  );
};

const Footer = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "#aaa",
        minHeight: "5vh",
      }}
    >
      <Typography.Title level={5}>
        E-Sitizen: A WEB-BASED INFORMATION AND HEALTH MONITORING SYSTEM FOR THE
        SENIOR CITIZEN
      </Typography.Title>
    </div>
  );
};

export default () => {
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState({});

  fetch("/api/socket").finally(() => {
    socket = io();

    socket.on("open-profile", async (id) => {
      if (id != null) {
        let res = await axios.get("/api/visitor", {
          params: { id, mode: "get-visitor" },
        });

        if (res.data.status == 200) {
          setData(res.data.data);
          setOpenModal(true);
        } else message.error("Error on scanning the QR code");
      }
    });
  });
  return (
    <Profiler openModal={openModal} setOpenModal={setOpenModal} data={data} />
  );
};

export { Sider, Header, Content, Footer };
