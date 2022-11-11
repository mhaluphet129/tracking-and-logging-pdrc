import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import parse from "html-react-parser";

export default () => {
  const [qr, setQr] = useState("");

  useEffect(() => {
    QRCode.toString("636743b309db93e3ae13ed48", function (err, url) {
      setQr(parse(url || ""));
    });
  }, []);
  return <div style={{ width: 200 }}>{qr}</div>;
};
