import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Input, Button, Space, message, Typography } from "antd";
import io from "socket.io-client";
import { CheckCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";

let socket;

const QRCamera = () => {
  const [connected, setConnected] = useState(false);
  const [load, setLoad] = useState("");
  const [key, setKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [visitHour, setVisitHour] = useState(null);
  const [counter, setCounter] = useState(0);

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

  const handleSuccessScan = async (_) => {
    if (counter % 10 == 0) {
      const [id, _id] = _.split("/");
      let { data } = await axios.get("/api/visitor", {
        params: {
          mode: "check-validity",
          userId: _id,
          qrId: id,
        },
      });

      if (data.status == 200) {
        socket.emit("open-visitor", _id);
      } else message.error(data.message);
    } else setCounter(counter + 1);
  };

  useEffect(() => {
    if (visitHour != null) {
      let html5QrcodeScanner = new Html5QrcodeScanner("reader", {
        fps: 30,
        qrbox: 300,
      });
      html5QrcodeScanner.render(handleSuccessScan);
    }
  }, [visitHour]);

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

  useEffect(() => {
    (async () => {
      let { data } = await axios.get("/api/etc", {
        params: {
          mode: "get-visit-hour",
        },
      });

      if (data.status == 200) {
        setVisitHour(data.data.visitLimit);
      } else message.error(data.data.message);
    })();
  }, []);

  return (
    <>
      {moment().hour() < moment(visitHour).hour() && visitHour != undefined ? (
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
          Visiting hours is limited to {moment(visitHour).format("HH:mm a")}{" "}
          only.
        </Typography.Text>
      )}
    </>
  );

  return 1;
};

export default QRCamera;
