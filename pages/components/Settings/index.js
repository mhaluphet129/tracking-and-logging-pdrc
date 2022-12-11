import React, { useState, useContext, useEffect } from "react";
import {
  PageHeader,
  Card,
  DatePicker,
  Form,
  Button,
  Typography,
  Tooltip,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { SettingsContext } from "../../context";
import Cookies from "js-cookie";
import io from "socket.io-client";
let socket;

const Settings = () => {
  const { setVisitHour, visitHour } = useContext(SettingsContext);
  const [isChanged, setIsChanged] = useState(false);
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
    <PageHeader title="Settings">
      <Card>
        <Form
          labelCol={{
            flex: "90px",
          }}
          wrapperCol={{
            flex: 1,
          }}
          onChange={(e) => setIsChanged(true)}
          colon={false}
          labelAlign="left"
          labelWrap
        >
          <Form.Item label="KEY">
            <Tooltip
              title={isConnected ? "Connected" : "Not Connected to any device"}
            >
              <Tag color={isConnected ? "success" : "red"}>
                <Typography.Text strong>
                  {keyPair.toUpperCase()}
                </Typography.Text>
                {isConnected ? <CheckCircleOutlined /> : <WarningOutlined />}
              </Tag>
            </Tooltip>
            <Tooltip title="Generate a new key and disconnect current device.">
              <Button size="small" onClick={() => socket.emit("new-key")}>
                <ReloadOutlined />
              </Button>
            </Tooltip>
          </Form.Item>
          <Form.Item label="Visit Time" initialValue={visitHour}>
            <DatePicker.TimePicker
              style={{ width: 200 }}
              format="hh:mm a"
              defaultValue={visitHour}
              onChange={() => setIsChanged(true)}
            />
          </Form.Item>
          <Button
            size="large"
            type="primary"
            disabled={!isChanged}
            style={{ float: "right", width: 200 }}
          >
            SAVE
          </Button>
        </Form>
      </Card>
    </PageHeader>
  );
};

export default Settings;
