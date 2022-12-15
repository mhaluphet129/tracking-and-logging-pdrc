import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
} from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";

const EditItems = ({ open, close, data, refresh }) => {
  const [status, setStatus] = useState([]);
  const [itemName, setItemName] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setStatus(data?.status);
  }, [data]);

  return (
    <Modal
      open={open}
      onCancel={() => {
        close();
        setStatus([]);
        setIsChanged(false);
      }}
      maskClosable={false}
      title="Edit Item Info"
      okText="Save"
      okButtonProps={{
        disabled: !isChanged,
        onClick: () => form.submit(),
      }}
      destroyOnClose
    >
      <Form
        onChange={() => {
          setIsChanged(true);
        }}
        wrapperCol={{
          flex: 1,
        }}
        labelCol={{
          flex: "110px",
        }}
        form={form}
        labelAlign="left"
        labelWrap
        onFinish={async (val) => {
          val = { ...val, id: data?._id, status };
          const res = await axios.post("/api/items", {
            payload: {
              mode: "edit-items",
              ...val,
            },
          });

          if (res.data.status == 200) {
            message.success(res.data.message);
            refresh();
            close();
          } else message.error(res.data.message);
        }}
      >
        <Form.Item label="Name" name="name" initialValue={data?.name}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          initialValue={data?.description}
        >
          <Input.TextArea rows={5} />
        </Form.Item>
        <Form.Item
          label="Deposit Date"
          name="depositDate"
          initialValue={moment(data?.createdAt)}
        >
          <DatePicker
            format="MMMM DD, YYYY"
            style={{ width: 200 }}
            onChange={() => setIsChanged(true)}
          />
        </Form.Item>
        <Form.Item label="Status" name="status" style={{ marginBottom: 0 }}>
          <Space direction="vertical">
            <Space>
              <Select
                options={[{ label: "Disposed", value: "dispose" }]}
                style={{ width: 120 }}
                onChange={(e) => {
                  setItemName(e);
                  setIsChanged(true);
                }}
              />
              <Button
                onClick={() => {
                  if (!status?.includes(itemName) && itemName != "")
                    setStatus((e) => [itemName, ...e]);
                }}
              >
                Add Status
              </Button>
            </Space>
            <Space
              direction="vertical"
              style={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 200px)",
                maxHeight: 200,
              }}
            >
              {status?.map((e, i) => (
                <div key={e + i} style={{ fontSize: 15, width: 300 }}>
                  <MinusCircleOutlined
                    style={{
                      color: "red",
                      marginRight: 10,
                      cursor: "pointer",
                      fontSize: 20,
                    }}
                    onClick={() => {
                      setStatus((_) => _?.filter((__) => __ != e));
                      setIsChanged(true);
                    }}
                  />
                  <Tag>{e}</Tag>
                </div>
              ))}
            </Space>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditItems;
