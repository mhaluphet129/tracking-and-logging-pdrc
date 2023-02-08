import React, { useState } from "react";
import { Button, Modal, QRCode, theme, Typography } from "antd";

const { useToken } = theme;

const qrview = ({ open, close, id }) => {
  const [size, setSize] = useState(300);
  const { token } = useToken();

  const downloadQRCode = () => {
    const canvas = document.getElementById("myqrcode")?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL();
      console.log(url);
      const a = document.createElement("a");
      a.download = "QRCode.png";
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      style={{ display: "flex", justifyContent: "center" }}
      footer={null}
      closable={false}
    >
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}
      >
        <Button
          disabled={size >= 500}
          style={{ width: 70, marginRight: 5 }}
          onClick={() => {
            setSize(() => {
              if (size >= 500) return 500;
              else return size + 20;
            });
          }}
        >
          +
        </Button>
        <Button
          disabled={size <= 300}
          style={{ width: 70, marginLeft: 5 }}
          onClick={() => {
            setSize(() => {
              if (size <= 300) return 300;
              else return size - 20;
            });
          }}
        >
          -
        </Button>
      </div>
      <div id="myqrcode">
        <QRCode
          icon="/pdrc-logo2.png"
          value={id}
          size={size}
          iconSize={size / 4}
          errorLevel="H"
          style={{
            backgroundColor: token.colorBgLayout,
            marginLeft: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      <Typography style={{ fontSize: "0.7rem", textAlign: "center" }}>
        {id}
      </Typography>
      <Button
        type="primary"
        onClick={downloadQRCode}
        style={{
          marginLeft: "50%",
          transform: "translateX(-50%)",
        }}
      >
        Download
      </Button>
    </Modal>
  );
};

export default qrview;
