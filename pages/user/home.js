import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { Sider, Header, Content, Footer } from "../layout";
import io from "socket.io-client";
let socket;

export default () => {
  useEffect(() => {
    fetch("/api/socket").finally(() => {
      socket = io();
      socket.on("room-connected", (data) => console.log(data));
    });
  }, []);
  const [selectedKey, setSelectedKey] = useState(1);
  return (
    <>
      <Layout>
        <Sider selectedIndex={(e) => setSelectedKey(e.key)} />
        <Layout>
          <Header />
          <Content selectedKey={selectedKey} />
        </Layout>
      </Layout>
      {/* <Footer>Footer</Footer> */}
    </>
  );
};
