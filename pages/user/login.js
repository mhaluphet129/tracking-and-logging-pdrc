import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Form, Input, Button, Alert, Modal, message } from "antd";
import { MobileView, BrowserView } from "react-device-detect";
import { QRCamera } from "../assets/utilities";
import axios from "axios";

const Login = () => {
  const [isError, setIsError] = useState({ show: false, description: "" });
  const [email, setEmail] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [form] = Form.useForm();

  const handleLogin = async (val) => {
    let { data } = await axios.post("/api/auth", {
      payload: {
        mode: "login",
        email: val.email,
        password: val.password,
      },
    });
    if (data.status == 404)
      setIsError({ show: true, description: "Account doesn't exist" });
    else if (data.status == 403)
      setIsError({ show: true, description: "Wrong password" });
    else if (data.status == 200) {
      Cookies.set("currentUser", JSON.stringify(data.currentUser));
      Cookies.set("loggedIn", "true");
      message.success(data.message);
      window.location.reload();
    }
  };

  return (
    <>
      <div className="main-body-login">
        <BrowserView>
          <Modal
            open={openModal}
            title={`Setup account for email '${email}'`}
            onCancel={() => setOpenModal(false)}
            footer={[
              <Button key="key 1" type="primary" onClick={form.submit}>
                Update
              </Button>,
            ]}
          >
            <Form
              form={form}
              onFinish={async (val) => {
                const { confirm, password } = val;
                if (confirm != password) {
                  message.error("password and confirm password didn't match.");
                  return;
                }

                let { data } = await axios.post("/api/auth", {
                  payload: {
                    ...val,
                    email,
                    mode: "new-user",
                  },
                });

                if (data.status == 200) {
                  Cookies.set("currentUser", JSON.stringify(data.currentUser));
                  Cookies.set("loggedIn", "true");
                  message.success(data.message);
                  window.location.reload();
                }
              }}
              labelCol={{ span: 7 }}
            >
              <Form.Item
                label="Name"
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
              <Form.Item
                label="Lastname"
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
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "This is required.",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                label="Confirm Password"
                name="confirm"
                rules={[
                  {
                    required: true,
                    message: "This is required.",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Form>
          </Modal>
          <Form
            labelCol={{
              span: 24,
            }}
            wrapperCol={{
              span: 24,
            }}
            labelAlign="right"
            style={{
              width: 400,
              padding: 30,
              background: "#fff",
            }}
            onFinish={handleLogin}
          >
            {isError.show && (
              <Alert
                description={isError.description}
                onClose={() => setIsError({ show: false, description: "" })}
                type="error"
                closable
              />
            )}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input size="large" onChange={(e) => setEmail(e.target.value)} />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                style={{ width: "100%" }}
                htmlType="submit"
                onClick={() => setIsError({ show: false, description: "" })}
              >
                Log In
              </Button>
            </Form.Item>
          </Form>
        </BrowserView>
        <MobileView>
          <QRCamera />
        </MobileView>
      </div>
    </>
  );
};

export default Login;
