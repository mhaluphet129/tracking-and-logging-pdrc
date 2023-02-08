import React, { useState, useContext, useEffect } from "react";
import {
  // PageHeader,
  Card,
  DatePicker,
  Form,
  Button,
  Typography,
  Tooltip,
  Tag,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { SettingsContext } from "../../context";
import Cookies from "js-cookie";
import axios from "axios";
import io from "socket.io-client";
import moment from "moment";
let socket;

const Settings = () => {
  const { setVisitHour, visitHour } = useContext(SettingsContext);
  const [isChanged, setIsChanged] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [keyPair, setKeypair] = useState("");
  const [date, setDate] = useState();

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
    // <PageHeader title="Settings">
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
              <Typography.Text strong>{keyPair.toUpperCase()}</Typography.Text>
              {isConnected ? <CheckCircleOutlined /> : <WarningOutlined />}
            </Tag>
          </Tooltip>
          <Tooltip title="Generate a new key and disconnect current device.">
            <Button size="small" onClick={() => socket.emit("new-key")}>
              <ReloadOutlined />
            </Button>
          </Tooltip>
        </Form.Item>
        <Form.Item label="Visit Time" initialValue={moment(visitHour)}>
          <DatePicker.TimePicker
            style={{ width: 200 }}
            format="hh:mm a"
            defaultValue={moment(visitHour)}
            onChange={(e) => {
              setIsChanged(true);
              setDate(e);
            }}
          />
        </Form.Item>
        <Button
          size="large"
          type="primary"
          disabled={!isChanged}
          style={{ float: "right", width: 200 }}
          onClick={async () => {
            let payload = {};
            if (date) payload["visitLimit"] = date;
            const { data } = await axios.get("/api/etc", {
              params: {
                mode: "update",
                ...payload,
              },
            });

            if (data.status == 200) {
              message.success(data?.message);
              Cookies.set("currentUser", JSON.stringify(data?.data));
              setVisitHour(data?.data?.visitLimit);
            }
          }}
        >
          SAVE
        </Button>
      </Form>
    </Card>
    // </PageHeader>
  );
};

export default Settings;
