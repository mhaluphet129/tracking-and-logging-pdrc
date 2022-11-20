import React, { useState, useEffect } from "react";
import { Table, Typography, Tag } from "antd";
import { IDGen } from "../../assets/utilities";
import axios from "axios";
import moment from "moment";

const VisitorLog = () => {
  const [recentVisit, setRecentVisit] = useState([]);
  const column2 = [
    {
      title: "VISIT ID",
      align: "center",
      render: (_, row) => (
        <Typography.Link>{IDGen(row?._id, 6)}</Typography.Link>
      ),
    },
    {
      title: "Name",
      render: (_, row) => (
        <Typography>
          {row?.visitorId.name}
          {row?.visitorId.middlename
            ? " " + row?.visitorId.middlename
            : ""}{" "}
          {row?.visitorId.lastname}
        </Typography>
      ),
    },
    {
      title: "Time",
      render: (_, row) => (
        <Typography.Text>
          {row?.timeOutDone ? (
            <Tag color="error">OUT</Tag>
          ) : (
            <Tag color="success">IN</Tag>
          )}
          {moment(row?.data).format("MMM DD, YYYY")}
        </Typography.Text>
      ),
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
