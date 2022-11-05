import React, { useEffect } from "react";
import "antd/dist/antd.css";
import "../styles/main.styles.css";

import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* <link rel='shortcut icon' href='/logo-icon.svg' /> */}
        <title>AgriSUPPORT</title>
        <meta
          name="description"
          content="This system develop to help MAGRO manage farmers, farmworkers and fisherfolk data and information to be manage."
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
