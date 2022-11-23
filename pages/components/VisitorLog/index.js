import React, { useState, useEffect, useRef } from "react";
import { Table, Typography, Space, AutoComplete, DatePicker } from "antd";
import axios from "axios";
import moment from "moment";

const VisitorLog = () => {
  const [recentVisit, setRecentVisit] = useState([]);
  const [trigger, setTrigger] = useState(0);
  const [loader, setLoader] = useState(false);
  const timerRef = useRef(null);
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
  }, [trigger]);

  const searchName = async (keyword) => {
    if (keyword != "" && keyword != null) {
      let { data } = await axios.get("/api/visit", {
        params: {
          mode: "search-visit",
          searchKeyword: keyword,
        },
      });
      if (data.status == 200) {
        setRecentVisit(data.searchData);
        setLoader(false);
      }
    }
  };

  const runTimer = (key) => {
    setLoader(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(function () {
      searchName(key);
    }, 500);
  };

  const handleCalendarChange = async (e) => {
    let startDate = moment("01/01/1990").format("MM/DD/YYYY");
    let endDate = moment().format("MM/DD/YYYY");

    if (e?.length > 0) {
      if (e[0] != null) startDate = moment(e[0]).format("MM/DD/YYYY");
      if (e[1] != null) endDate = moment(e[1]).format("MM/DD/YYYY");
    }

    let { data } = await axios.get("/api/visit", {
      params: { mode: "filter-date", startDate, endDate },
    });
    if (data.status == 200) setRecentVisit(data.data);
  };

  return (
    <Space direction="vertical">
      <Space>
        <AutoComplete
          style={{
            width: 200,
          }}
          loading={loader}
          placeholder="Search by Name/ID"
          filterOption={(inputValue, option) =>
            option.value?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          onChange={(_) => {
            runTimer(_);
            if (_?.length <= 0) {
              setLoader(false);
              setTrigger(trigger + 1);
            }
          }}
          autoFocus
          allowClear
        />
        Date:
        <DatePicker.RangePicker
          format="MMM DD, YYYY"
          defaultValue={[moment("01/01/1990"), moment()]}
          onCalendarChange={handleCalendarChange}
        />
      </Space>
      <Table columns={column2} dataSource={recentVisit} />
    </Space>
  );
};

export default VisitorLog;
