import React, { useState, useEffect } from "react";
import { PageHeader, Table, Typography, Space, Button } from "antd";
import { Timer } from "../../assets/utilities";
import axios from "axios";
import moment from "moment";

const VisitTime = () => {
  const [visitorWithTimer, setVisitorWithTimer] = useState();
  const [load, setLoad] = useState("");
  const [dismissClick, setDismmissClick] = useState({
    show: false,
    index: null,
  });

  const column2 = [
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
      width: 100,
      render: (_, row, i) =>
        moment(row?.timeOut).diff(moment()) > 0 ? (
          <Timer
            startDate={row?.timeIn}
            endDate={row?.timeOut}
            end={() => {}}
          />
        ) : dismissClick.show && dismissClick.index == i ? (
          <Space>
            <Button
              onClick={async () => {
                let res = await axios.get("/api/visit", {
                  params: { mode: "visit-out", id: row._id },
                });
                if (res.data.status == 200) {
                  setDismmissClick({ show: false, index: null });
                }
              }}
              type="primary"
            >
              Confirm
            </Button>
            <Button
              onClick={() => setDismmissClick({ show: false, index: null })}
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Button
            onClick={() => setDismmissClick({ show: true, index: i })}
            danger
          >
            DISMISS
          </Button>
        ),
    },
  ];

  useEffect(() => {
    (async () => {
      setLoad("fetch");
      let res = await axios.get("/api/visit", {
        params: { mode: "visit-with-timers" },
      });
      if (res.data.status == 200) setVisitorWithTimer(res.data.data);
      setLoad("");
    })();
  }, []);

  return (
    <PageHeader title="Visit Time">
      <Table
        dataSource={visitorWithTimer}
        columns={column2}
        rowKey={(row) => row._id}
        pagination={false}
        loading={load == "fetch"}
        style={{ width: 400 }}
      />
    </PageHeader>
  );
};

export default VisitTime;
