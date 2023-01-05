import React, { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  Form,
  Input,
  message,
  Space,
  Modal,
  Typography,
} from "antd";
import axios from "axios";
import UpdatePassword from "./update_password";
import Cookies from "js-cookie";
import moment from "moment";

const UpdateAdmin = ({ open, close, data, refresh }) => {
  const [edited, setEdited] = useState(false);
  const [inputData, setInputData] = useState({
    name: "",
    lastname: "",
    email: "",
  });
  const [openModal, setOpenModal] = useState(false);

  const handleSave = async () => {
    let res = await axios.post("/api/admin", {
      payload: {
        id: data._id,
        data: inputData,
        mode: "update-admin",
      },
    });

    if (res.data.status == 200) {
      message.success(res.data.message);
      setEdited(false);
      refresh();
    } else message.error(res.data.message);
  };

  const handleDelete = async () => {
    let currentUser = JSON.parse(Cookies.get("currentUser"));
    if (currentUser?._id == data._id) {
      message.warning("You cannot remove your own account");
      return;
    }
    let res = await axios.delete("/api/admin", {
      params: { id: data._id },
    });

    if (res.data.status == 200) {
      setEdited(false);
      refresh();
      close();
      message.success(res.data.message);
    } else message.error(res.data.message);
  };

  useEffect(() => {
    setInputData(data);
  }, [data]);

  return (
    <>
      <UpdatePassword open={openModal} close={() => setOpenModal(false)} />
      <Drawer
        open={open}
        onClose={close}
        width={350}
        title="Update Admin"
        extra={[
          <Space key="key 1">
            <Button type="primary" disabled={!edited} onClick={handleSave}>
              SAVE
            </Button>
            {!data?.role.includes("superadmin") ? (
              <Button
                danger
                onClick={() => {
                  Modal.confirm({
                    title: "are you sure ?",
                    okText: "Confirm",
                    onOk: handleDelete,
                  });
                }}
              >
                DELETE
              </Button>
            ) : null}
          </Space>,
        ]}
        closable={false}
      >
        <Form layout="vertical" onChange={() => setEdited(true)}>
          <Form.Item label="Name">
            <Input
              value={inputData?.name || ""}
              onChange={(e) =>
                setInputData((prev) => {
                  return { ...prev, name: e.target.value };
                })
              }
            />
          </Form.Item>
          <Form.Item label="Lastname">
            <Input
              value={inputData?.lastname || ""}
              onChange={(e) =>
                setInputData((prev) => {
                  return { ...prev, lastname: e.target.value };
                })
              }
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              value={inputData?.email || ""}
              onChange={(e) =>
                setInputData((prev) => {
                  return { ...prev, email: e.target.value };
                })
              }
            />
          </Form.Item>
          <Form.Item noStyle>
            <Button
              style={{ width: "100%" }}
              type="primary"
              onClick={() => setOpenModal(true)}
            >
              Update Password
            </Button>
          </Form.Item>
          {data?.lastLogin && (
            <Typography.Text type="secondary" italic>
              Last login @{" "}
              {moment(data?.lastLogin).format("MMM DD, YYYY - HH:mm a")}
            </Typography.Text>
          )}
        </Form>
      </Drawer>
    </>
  );
};

export default UpdateAdmin;
