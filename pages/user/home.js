import React, { useState } from "react";
import { Layout } from "antd";
import Main, { Sider, Header, Content } from "../layout";
import SettingsContextProvider from "../context";

export default () => {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  return (
    <SettingsContextProvider>
      <Main />
      <Layout>
        <Sider selectedIndex={(e) => setSelectedKey(e.key)} />
        <Layout>
          <Header />
          <Content selectedKey={selectedKey} />
        </Layout>
      </Layout>
      {/* <Footer>Footer</Footer> */}
    </SettingsContextProvider>
  );
};
