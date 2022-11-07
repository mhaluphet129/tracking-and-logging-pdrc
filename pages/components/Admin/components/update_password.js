import React, { useState } from "react";
import { Modal, Input, Button, Form, Alert, message } from "antd";
import { EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";
import axios from "axios";

const UpdatePassword = ({ open, close }) => {
  const [error, setError] = useState(false);

  const handleOnFinish = async (val) => {
    const { password, confirmPassword } = val;
    if (password != confirmPassword) setError(true);
    else {
      let { data } = await axios.post("/api/admin", {
        payload: {
          mode: "change-pass-admin",
          password: password,
        },
      });

      if (data.status == 200) {
        message.success(data.message);
        close();
      } else message.error(data.message);
    }
  };

  return (
    <Modal
      title="Update Password"
      open={open}
      onCancel={close}
      closable={false}
      footer={null}
      destroyOnClose
    >
      {error && (
        <Alert
          message="Passwords didn't match"
          type="error"
          onClose={() => setError(false)}
          showIcon
          closable
        />
      )}
      <Form layout="vertical" onFinish={handleOnFinish}>
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            {
              required: true,
              message: "Input is blank",
            },
          ]}
        >
          <Input.Password
            placeholder="Input New Password"
            size="large"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          rules={[
            {
              required: true,
              message: "Input is blank",
            },
          ]}
        >
          <Input.Password
            placeholder="Confirm your new password"
            size="large"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>
        <Form.Item>
          <Button
            style={{ width: "100%" }}
            type="primary"
            htmlType="submit"
            size="large"
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdatePassword;
