import React, { useContext, useEffect, useState } from "react";
import { Typography, Table, message, notification } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { SettingsContext } from "../../pages/context";
import axios from "axios";
import Timer from "./timer";
import changeTitle from "./title";

const InvisibleTimer = () => {
  const [api, contextHolder] = notification.useNotification();

  const { setOpenProfile, setProfileData, titleRef } =
    useContext(SettingsContext);
  const [visitorWithTimer, setVisitorWithTimer] = useState();

  useEffect(() => {
    clearInterval(titleRef.current);
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
    <>
      {contextHolder}
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
                    titleRef.current = changeTitle({
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
                                setOpenProfile(true);
                                setProfileData(data.data);
                                api["destroy"](row?._id);
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
    </>
  );
};

export default InvisibleTimer;
