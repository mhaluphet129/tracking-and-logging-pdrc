import React, { useState } from "react";
import { Layout } from "antd";
import Main, { Sider, Header, Content } from "../layout";

const Home = () => {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  return (
    <>
      <Main />
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

export default Home;
