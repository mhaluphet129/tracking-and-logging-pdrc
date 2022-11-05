import React, { useState } from "react";
import { Layout } from "antd";
import { Sider, Header, Content, Footer } from "../layout";

export default () => {
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
      <Footer>Footer</Footer>
    </>
  );
};
