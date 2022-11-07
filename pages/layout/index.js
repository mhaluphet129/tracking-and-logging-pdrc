import React, { useEffect, useState } from "react";
import { Menu, Layout, Avatar, Modal, Button, Typography } from "antd";
import {
  UserOutlined,
  SettingFilled,
  LogoutOutlined,
  BarChartOutlined,
  TeamOutlined,
  SnippetsOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import AdminPage from "../components/Admin";
import VisitorPage from "../components/Visitor";

const Sider = ({ selectedIndex }) => {
  let [items, setItems] = useState([
    {
      label: "Dashboard",
      key: "dashboard",
      icon: <BarChartOutlined />,
    },
    {
      label: "Manage Admin",
      key: "admin",
      icon: <UsergroupAddOutlined />,
    },
    {
      label: "Visitor Page",
      key: "visitor",
      icon: <TeamOutlined />,
    },
    {
      label: "Report",
      key: "report",
      icon: <SnippetsOutlined />,
      style: {
        paddingRight: "40px",
      },
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
        }}
      />
    </Layout.Sider>
  );
};

const Header = () => {
  const [showModal, setShowModal] = useState(false);

  const [currentUser, setCurrentUser] = useState({ name: "", lastname: "" });

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
              Cookies.remove("user");
              Cookies.set("loggedIn", "false");
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
      {selectedKey == "dashboard" ? "dashboard" : null}
      {selectedKey == "admin" ? <AdminPage /> : null}
      {selectedKey == "visitor" ? <VisitorPage /> : null}
      {selectedKey == "report" ? "report" : null}
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

export { Sider, Header, Content, Footer };
