import React, { useEffect, useState } from "react";
import { FloatButton, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import io from "socket.io-client";
import Cookies from "js-cookie";

let socket;

const Settings = () => {
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
  }, []);
  return (
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{
        right: 24,
        bottom: 24,
      }}
      icon={<SettingOutlined />}
    >
      <Typography>{keyPair}</Typography>
    </FloatButton.Group>
  );
};

export default Settings;
