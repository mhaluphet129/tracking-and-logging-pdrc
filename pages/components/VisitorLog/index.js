import React, { useState, useEffect } from "react";
import { Table, Typography, Tag } from "antd";
import { IDGen } from "../../assets/utilities";
import axios from "axios";
import moment from "moment";

const VisitorLog = () => {
  const [recentVisit, setRecentVisit] = useState([]);
  const column2 = [
    {
      title: "Name",
      render: (_, row) => (
        <Typography>
          {row?.visitorId?.name}
          {row?.visitorId?.middlename
            ? " " + row?.visitorId.middlename
            : ""}{" "}
          {row?.visitorId?.lastname}
        </Typography>
      ),
    },
    {
      title: "Date",
      render: (_, row) => moment(row?.date).format("MMM DD, YYYY"),
    },
    {
      title: "Time In/Check In",
      render: (_, row) => moment(row?.timeIn).format("hh:mm a"),
    },
    {
      title: "Time Out/Check Out",
      render: (_, row) => moment(row?.timeOut).format("hh:mm a"),
    },
  ];

  useEffect(() => {
    (async () => {
      let res = await axios.get("/api/visit", {
        params: { mode: "fetch-recent" },
      });
      if (res.data.status == 200) setRecentVisit(res.data.data);
    })();
  }, []);
  return <Table columns={column2} dataSource={recentVisit} />;
};

export default VisitorLog;
