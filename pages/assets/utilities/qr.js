import React, { useEffect, useState, useContext } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Input, Button, Space, message, Typography } from "antd";
import io from "socket.io-client";
import { CheckCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { SettingsContext } from "../../context";

let socket;

const QRCamera = () => {
  const [connected, setConnected] = useState(false);
  const [load, setLoad] = useState("");
  const [key, setKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const { visitHour } = useContext(SettingsContext);

  const handleConnect = () => {
    setLoad("connecting");
    if (
      inputKey != "" &&
      key != "" &&
      inputKey.toLowerCase() == key.toLowerCase()
    ) {
      setConnected(true);
      socket.emit("connected");
    } else if (inputKey.length == 0) message.warning("Input is blank.");
    else message.error("Wrong Key. Try again.");
    setLoad("");
  };

  const handleSuccessScan = (data) => {
    socket.emit("open-visitor", data);
  };

  useEffect(() => {
    let html5QrcodeScanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 300,
    });

    html5QrcodeScanner.render(handleSuccessScan);
  }, []);

  useEffect(() => {
    fetch("/api/socket").finally(() => {
      socket = io();

      socket.emit("get-key");
      socket.on("on-getKey", (data) => {
        setKey(data);
      });
      socket.emit("is-connected");
      socket.on("connection-status", (data) => {
        setConnected(data);
      });
    });
  }, []);

  return (
    <>
      {moment().isBefore(visitHour) ? (
        <>
          <div>
            <div id="reader" style={{ alignSelf: "flex-start" }} />
          </div>
          <div>
            {connected ? (
              <Space
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                <CheckCircleOutlined /> Connected <br />
                <Button
                  onClick={() => {
                    setConnected(false);
                    socket.emit("disconnected");
                  }}
                >
                  DISCONNECT
                </Button>
              </Space>
            ) : (
              <Space
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                <Input
                  onChange={(e) => setInputKey(e.target.value)}
                  value={inputKey}
                />
                <Button onClick={handleConnect} loading={load == "connecting"}>
                  CONNECT
                </Button>
              </Space>
            )}
          </div>
        </>
      ) : (
        <Typography.Text>
          Visiting hours is limited to 2:00PM only.
        </Typography.Text>
      )}
    </>
  );
};

export default QRCamera;
