import React, { useEffect } from "react";
import "../styles/main.styles.css";
import SettingsContextProvider from "./context";
import axios from "axios";

import Head from "next/head";
import { message } from "antd";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    (async () => {
      let { data } = await axios.get("/api/etc", {
        params: {
          mode: "check-admin-exist",
        },
      });

      if (data.status == 200)
        if (data.data?.length == 0) {
          let res = await axios.post("/api/etc", {
            payload: {
              mode: "init",
            },
          });

          if (res.data.status == 200) message.success(res.data.message);
        }
    })();
  }, []);

  return (
    <SettingsContextProvider>
      <Head>
        <link rel="shortcut icon" href="/pdrc-logo2.png" />
        <title>PDRC - Visitor Tracking and Logging System</title>
        <meta
          name="description"
          content="This system develop to help PDRC staff to manage visitor data and information."
        />
      </Head>
      <Component {...pageProps} />
    </SettingsContextProvider>
  );
}

export default MyApp;
