import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  InputNumber,
  message,
  Modal,
  QRCode,
  Select,
  theme,
  Typography,
} from "antd";
import moment from "moment";
import { v4 } from "uuid";
import axios from "axios";

const { useToken } = theme;

const qrview = ({ open, close, id, data }) => {
  const [size, setSize] = useState(300);
  const [mode, setMode] = useState("hour");
  const [inputData, setInputData] = useState("");
  const [triggerGenerateNew, setIsTriggerGenerateNew] = useState(false);
  const [isValidDate, setIsvalidDate] = useState(true);
  const [error, setError] = useState({ status: false, message: "" });
  const { token } = useToken();

  const downloadQRCode = () => {
    const canvas = document.getElementById("myqrcode")?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement("a");
      a.download = "QRCode.png";
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleGenerate = async () => {
    let validTill = moment().add(mode, inputData);
    let _id = v4();
    let res = await axios.post("/api/visitor", {
      payload: {
        mode: "new-qr-key",
        id,
        data: {
          id: _id,
          dateCreated: moment(),
          dateValid: validTill,
        },
      },
    });

    if (res.data.status == 200) {
      message.success(res.data.message);
      if (data?.qr == undefined || data.qr == null) data.qr = [];

      data?.qr.push({
        id: _id + "/" + id,
        dateCreated: moment(),
        dateValid: validTill,
      });
      close();
    } else {
      setError({ status: true, message: res.data.message });
    }
  };

  useEffect(() => {
    if (data?.qr?.length > 0) {
      setIsvalidDate(
        moment(data?.qr[data?.qr.length - 1].dateValid).isSameOrAfter(moment())
      );
    }
  }, [data]);

  return (
    <Modal
      open={open}
      onCancel={close}
      style={{ display: "flex", justifyContent: "center" }}
      footer={null}
      closable={false}
    >
      {error.status && (
        <Alert
          message="Error"
          description={error.message}
          type="error"
          closable
        />
      )}
      {data?.qr?.length > 0 && data?.qr != undefined && (
        <>
          <div id="myqrcode">
            <Badge.Ribbon
              text={isValidDate ? "VALID" : "EXPIRED"}
              color={isValidDate ? "blue" : "red"}
            >
              <QRCode
                icon="/pdrc-logo2.png"
                value={data.qr[data?.qr.length - 1].id}
                size={size}
                iconSize={size / 4}
                errorLevel="H"
                style={{
                  backgroundColor: token.colorBgLayout,
                  marginLeft: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            </Badge.Ribbon>

            <p style={{ textAlign: "center", color: "#aaa" }}>
              Created:{" "}
              {moment(data.qr[data?.qr.length - 1].dateCreated).format(
                "MMM DD, YYYY hh:mm a"
              )}
              <br />
              Valid till:{" "}
              {moment(data.qr[data?.qr.length - 1].dateValid).format(
                "MMM DD, YYYY hh:mm a"
              )}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: 10,
            }}
          >
            <Button onClick={downloadQRCode} disabled={!isValidDate}>
              DOWNLOAD
            </Button>
            <Button
              type="primary"
              onClick={() => setIsTriggerGenerateNew(!triggerGenerateNew)}
              style={{ width: 170 }}
            >
              {triggerGenerateNew ? "COLLAPSE" : "GENERATE NEW QR"}
            </Button>
          </div>
          {triggerGenerateNew && (
            <div style={{ marginTop: 10 }}>
              <InputNumber
                min={0}
                style={{ width: 200, marginRight: 10 }}
                onChange={(e) => setInputData(e)}
                addonAfter={
                  <Select
                    defaultValue="hour"
                    style={{ width: 80 }}
                    onChange={(e) => setMode(e)}
                  >
                    <Select.Option value="h">HOUR</Select.Option>
                    <Select.Option value="w">WEEK</Select.Option>
                    <Select.Option value="m">MONTH</Select.Option>
                    <Select.Option value="y">YEAR</Select.Option>
                  </Select>
                }
              />
              <Button
                type="primary"
                disabled={inputData == ""}
                onClick={handleGenerate}
              >
                SUBMIT
              </Button>
            </div>
          )}
        </>
      )}

      {(data?.qr?.length == 0 || data?.qr == undefined || data?.qr == null) && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
              backgroundColor: token.colorBgLayout,
              borderRadius: 10,
            }}
          >
            <Typography.Text style={{ fontWeight: 900, color: "#aaa" }}>
              NO QR GENERATED
            </Typography.Text>
          </div>
          <Button
            type="primary"
            onClick={() => setIsTriggerGenerateNew(!triggerGenerateNew)}
            style={{ width: 170, marginTop: 10 }}
          >
            {triggerGenerateNew ? "COLLAPSE" : "GENERATE NEW QR"}
          </Button>
          {triggerGenerateNew && (
            <div style={{ marginTop: 10 }}>
              <InputNumber
                min={0}
                style={{ width: 200, marginRight: 10 }}
                onChange={(e) => setInputData(e)}
                addonAfter={
                  <Select
                    defaultValue="hour"
                    style={{ width: 80 }}
                    onChange={(e) => setMode(e)}
                  >
                    <Select.Option value="h">HOUR</Select.Option>
                    <Select.Option value="w">WEEK</Select.Option>
                    <Select.Option value="m">MONTH</Select.Option>
                    <Select.Option value="y">YEAR</Select.Option>
                  </Select>
                }
              />
              <Button
                type="primary"
                disabled={inputData == ""}
                onClick={handleGenerate}
              >
                SUBMIT
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default qrview;
