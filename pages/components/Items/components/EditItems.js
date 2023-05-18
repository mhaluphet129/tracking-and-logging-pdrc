import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Tag,
} from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";

const EditItems = ({ open, close, data, refresh }) => {
  const [status, setStatus] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const [form] = Form.useForm();

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
        <Form.Item
          label="Status"
          name="status"
          style={{ marginBottom: 0 }}
          initialValue={data?.status}
        >
          <Radio.Group
            value={status != null ? status : data?.status}
            onChange={(e) => {
              setIsChanged(true);
              setStatus(e.target.value);
            }}
          >
            <Space direction="vertical">
              <Radio value="claimed">CLAIM</Radio>
              <Radio value="unclaimed">UNCLAIM</Radio>
              <Radio value="disposed">DISPOSE</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditItems;
