import React, { useState } from "react";
import { DatePicker, Drawer, Space, Table } from "antd";
import moment from "moment";

const History = ({ open, close, id }) => {
  return (
    <Drawer
      open={open}
      onClose={close}
      placement="bottom"
      height="100%"
      title="Records"
    >
      <Space style={{ float: "right" }}>
        Date Range: <DatePicker.RangePicker format="MMM DD YYYY" />
      </Space>
      <Table />
    </Drawer>
  );
};

export default History;
