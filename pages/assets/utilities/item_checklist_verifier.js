import { Modal, Typography, Table, message } from "antd";
import React, { useState } from "react";
import axios from "axios";

const ItemChecklistVerifier = ({ open, close, data, update }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loader, setLoader] = useState("");
  const [changed, setChanged] = useState(false);
  const column = [
    {
      title: "Name",
      align: "center",
      render: (_, row) => (
        <Typography.Title level={5}>{row?.name}</Typography.Title>
      ),
    },
    {
      title: "Description",
      render: (_, row) => <Typography.Text>{row?.description}</Typography.Text>,
    },
  ];

  const handleProceed = async () => {
    setLoader("proceed");
    let res = await axios.get("/api/items", {
      params: {
        mode: "claim-true",
        ids: JSON.stringify(selectedItems),
      },
    });

    if (res.data.status == 200) {
      message.success(res.data.message);
      update();
      close();
    }
    setLoader("");
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      okText="Verify"
      onOk={handleProceed}
      okButtonProps={{ disabled: !changed }} //loading: loader == "proceed",
      closable={false}
    >
      <Table
        columns={column}
        dataSource={data}
        pagination={false}
        rowKey={(row) => row?._id}
        rowSelection={{
          type: "checkbox",
          onChange: (_, row) => {
            setSelectedItems(row.map((e) => e?._id));
            if (row.length > 0) setChanged(true);
            else setChanged(false);
          },
        }}
      />
    </Modal>
  );
};

export default ItemChecklistVerifier;
