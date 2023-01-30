import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import "../styles/main.styles.css";
import SettingsContextProvider from "./context";
import axios from "axios";

import Head from "next/head";
import { message, Typography, Table, notification } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { Timer, Profiler, changeTitle } from "./assets/utilities";

function MyApp({ Component, pageProps }) {
  const [visitorWithTimer, setVisitorWithTimer] = useState();
  const [openProfile, setOpenProfile] = useState({ show: false, data: null });
  const [api, contextHolder] = notification.useNotification();

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

  useEffect(() => {
    (async () => {
      let res = await axios.get("/api/visit", {
        params: { mode: "visit-with-timers" },
      });
      if (res.data.status == 200) setVisitorWithTimer(res.data.data);
    })();
  }, []);

  return (
    <SettingsContextProvider>
      {contextHolder}
      <Profiler
        openModal={openProfile.show}
        setOpenModal={() => setOpenProfile({ show: false, data: null })}
        data={openProfile.data}
      />
      <div style={{ display: "none" }}>
        <Table
          dataSource={visitorWithTimer}
          footer={() => (
            <Typography.Text>
              Total: {visitorWithTimer?.length ?? 0}
            </Typography.Text>
          )}
          columns={[
            {
              title: "Visitor Name",
              render: (_, row) => (
                <Typography>
                  {row?.visitorId.name}
                  {row?.visitorId.middlename
                    ? " " + row?.visitorId.middlename
                    : ""}{" "}
                  {row.visitorId.lastname}
                </Typography>
              ),
            },
            {
              title: "Time left",
              align: "center",
              width: 200,
              render: (_, row) => (
                <Timer
                  endDate={row?.timeOut}
                  end={() => {
                    let audio = new Audio("/notif-sound.wav");
                    audio.play();
                    changeTitle({
                      title:
                        row?.visitorId.name +
                        (row?.visitorId.middlename
                          ? " " + row?.visitorId.middlename
                          : "") +
                        " " +
                        row.visitorId.lastname +
                        " exceed visit duration.",
                      metaDescription:
                        "Dynamic title should when there is a visitor exceed their time visit.",
                    });
                    api["warning"]({
                      key: row?._id,
                      icon: <WarningOutlined style={{ color: "red" }} />,
                      description: (
                        <span>
                          {row?.visitorId.name}
                          {row?.visitorId.middlename
                            ? " " + row?.visitorId.middlename
                            : ""}{" "}
                          {row.visitorId.lastname} exceed visit duration.
                          <br />
                          <Typography.Link
                            onClick={async () => {
                              let { data } = await axios.get("/api/visitor", {
                                params: {
                                  mode: "get-visitor",
                                  id: row?.visitorId?._id,
                                },
                              });

                              if (data.status == 200) {
                                setOpenProfile({ show: true, data: data.data });
                                notification.close(row?._id);
                              }
                            }}
                          >
                            Click here
                          </Typography.Link>
                        </span>
                      ),
                      duration: 0,
                    });
                  }}
                />
              ),
            },
          ]}
          rowKey={(row) => row._id}
          pagination={{
            pageSize: 8,
          }}
        />
      </div>
      <Head>
        {/* <link rel='shortcut icon' href='/logo-icon.svg' /> */}
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
