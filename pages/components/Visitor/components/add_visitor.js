import React, { useState } from "react";
import {
  Input,
  Modal,
  Form,
  Radio,
  Space,
  DatePicker,
  InputNumber,
  Checkbox,
  Button,
  message,
} from "antd";
import axios from "axios";

const AddVisitor = ({ open, close, refresh }) => {
  let [form] = Form.useForm();

  const handleFinish = async (val) => {
    let { data } = await axios.post("/api/visitor", {
      payload: {
        mode: "add-visitor",
        visitor: val,
      },
    });

    if (data.status == 200) {
      close();
      refresh();
      message.success(data.message);
    } else message.error(data.message);
  };

  return (
    <Modal
      title={"PDRC VISITOR INFORMATION REGISTRATION FORM"}
      open={open}
      onCancel={close}
      closable={false}
      width={550}
      footer={
        <Button type="primary" onClick={form.submit}>
          Register
        </Button>
      }
    >
      <Form
        form={form}
        labelCol={{
          flex: "110px",
        }}
        labelAlign="left"
        labelWrap
        wrapperCol={{
          flex: 1,
        }}
        colon={false}
        onFinish={handleFinish}
      >
        <Form.Item
          label="First Name"
          name="name"
          rules={[
            {
              required: true,
              message: "This is required.",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Middle Name (Optional)" name="middlename">
          <Input />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lastname"
          rules={[
            {
              required: true,
              message: "This is required.",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Gender" name="gender" initialValue="male">
          <Radio.Group defaultValue="male">
            <Space>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Date of Birth"
          name="dateOfBirth"
          rules={[
            {
              required: true,
              message: "This is required.",
            },
          ]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          label="Age"
          name="age"
          rules={[
            {
              required: true,
              message: "This is required.",
            },
          ]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[
            {
              required: true,
              message: "This is required.",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Contact Number"
          name="contactNumber"
          rules={[
            {
              required: true,
              message: "This is required.",
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddVisitor;
