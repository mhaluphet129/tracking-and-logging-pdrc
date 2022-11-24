import React from "react";
import "antd/dist/antd.css";
import "../styles/main.styles.css";
import SettingsContextProvider from "./context";

import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <SettingsContextProvider>
      <Head>
        {/* <link rel='shortcut icon' href='/logo-icon.svg' /> */}
        <title>PDRC - Visitour Tracking and Logging System</title>
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
