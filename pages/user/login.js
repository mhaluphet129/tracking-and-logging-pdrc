import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  Form,
  Input,
  Button,
  Alert,
  Modal,
  Image,
  message,
  Row,
  Col,
  Typography,
} from "antd";
import { MobileView, BrowserView } from "react-device-detect";
import { UserOutlined } from "@ant-design/icons";
import { QRCamera } from "../assets/utilities";
import Jason from "../assets/json/index.json";
import axios from "axios";

const Login = () => {
  const [isError, setIsError] = useState({ show: false, description: "" });
  const [email, setEmail] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, selectedMode] = useState("signup");

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

  const handleLogin2 = async (val) => {
    let { data } = await axios.post("/api/auth", {
      payload: {
        mode: "signup",
        email: val.email,
      },
    });

    if (data.status == 404)
      setIsError({ show: true, description: "Account doesn't exist" });
    else setOpenModal(true);
  };

  return (
    <>
      <div className="main-body-login">
        <BrowserView>
          <Row style={{ display: "flex", justifyContent: "center" }}>
            <Col
              span={12}
              style={{
                backgroundColor: "#eee",
                width: 1000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                padding: 10,
              }}
            >
              <Image
                preview={false}
                src="/pdrc-logo2.png"
                alt="logo"
                height={300}
                width={300}
                style={{ paddingBottom: 20 }}
              />

              <Typography.Title
                level={5}
                style={{
                  fontWeight: 900,
                  textAlign: "center",
                  paddingBottom: 50,
                }}
                italic
              >
                {Jason.loginLabel.toLocaleUpperCase()}
              </Typography.Title>
              {/* <Typography.Text>
                {Jason.school.toLocaleUpperCase()}
              </Typography.Text> */}
            </Col>
            {mode == "signup" ? (
              <Col
                span={8}
                style={{
                  backgroundColor: "#a0a0a0",
                  width: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  padding: 10,
                }}
              >
                <Typography.Title
                  level={4}
                  style={{ color: "#fff", textAlign: "center" }}
                >
                  Login
                </Typography.Title>
                <Form
                  labelCol={{
                    span: 24,
                  }}
                  wrapperCol={{
                    span: 24,
                  }}
                  labelAlign="right"
                  style={{
                    width: 350,
                    padding: 30,
                  }}
                  onFinish={handleLogin}
                >
                  <Form.Item
                    label={
                      <Typography style={{ color: "#fff" }}>
                        Email / Username
                      </Typography>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please input your email!",
                      },
                    ]}
                    name="email"
                  >
                    <Input
                      className="customInput"
                      size="large"
                      style={{
                        backgroundColor: "#a0a0a0",
                        border: "none",
                        borderBottom: "1px solid #fff",
                      }}
                      suffix={<UserOutlined style={{ color: "#fff" }} />}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Typography style={{ color: "#fff" }}>
                        Password
                      </Typography>
                    }
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password
                      className="customInput"
                      style={{
                        backgroundColor: "#a0a0a0",
                        border: "none",
                        borderBottom: "1px solid #fff",
                      }}
                    />
                  </Form.Item>
                  <Form.Item noStyle>
                    <Button
                      style={{
                        width: "100%",
                        fontWeight: "bold",
                      }}
                      htmlType="submit"
                      onClick={() =>
                        setIsError({ show: false, description: "" })
                      }
                    >
                      LOGIN
                    </Button>
                  </Form.Item>
                  <Typography.Text
                    className="signup"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: 5,
                      color: "#eee",
                    }}
                    onClick={() => {
                      selectedMode(mode == "login" ? "signup" : "login");
                    }}
                  >
                    {mode[0].toUpperCase() + mode.substring(1, mode.length)}
                  </Typography.Text>
                  {isError.show && (
                    <Alert
                      description={isError.description}
                      onClose={() =>
                        setIsError({ show: false, description: "" })
                      }
                      type="error"
                      closable
                    />
                  )}
                </Form>
              </Col>
            ) : (
              <Col
                span={8}
                style={{
                  backgroundColor: "#a0a0a0",
                  width: 100,
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                  flexDirection: "column",
                  padding: 10,
                }}
              >
                <Typography.Title
                  level={4}
                  style={{ color: "#fff", textAlign: "center", marginTop: 25 }}
                >
                  Signup
                </Typography.Title>
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
                  }}
                  onFinish={handleLogin2}
                >
                  <Form.Item
                    label={
                      <Typography style={{ color: "#fff" }}>
                        Email / Username
                      </Typography>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please input your email!",
                      },
                    ]}
                    name="email"
                  >
                    <Input
                      className="customInput"
                      size="large"
                      style={{
                        backgroundColor: "#a0a0a0",
                        border: "none",
                        borderBottom: "1px solid #fff",
                      }}
                      suffix={<UserOutlined style={{ color: "#fff" }} />}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item noStyle>
                    <Button
                      style={{
                        width: "100%",
                        fontWeight: "bold",
                      }}
                      htmlType="submit"
                      onClick={() => {
                        setIsError({ show: false, description: "" });
                      }}
                    >
                      SIGNUP
                    </Button>
                  </Form.Item>
                  <Typography.Text
                    className="signup"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: 5,
                      color: "#eee",
                    }}
                    onClick={() => {
                      selectedMode(mode == "login" ? "signup" : "login");
                    }}
                  >
                    {mode[0].toUpperCase() + mode.substring(1, mode.length)}
                  </Typography.Text>
                  {isError.show && (
                    <Alert
                      description={isError.description}
                      onClose={() =>
                        setIsError({ show: false, description: "" })
                      }
                      type="error"
                      closable
                    />
                  )}
                </Form>
              </Col>
            )}
          </Row>

          <Modal
            open={openModal}
            title={`Setup account for email '${email}'`}
            onCancel={() => setOpenModal(false)}
            footer={[
              <Button key="key 1" type="primary" onClick={form.submit}>
                Update
              </Button>,
            ]}
            maskClosable={false}
          >
            <Form
              form={form}
              onFinish={async (val) => {
                delete val.email2;

                const { confirm, password2 } = val;
                if (confirm != password2) {
                  message.error("password and confirm password didn't match.");
                  return;
                }
                val = { ...val, email, password: password2 };

                let { data } = await axios.post("/api/auth", {
                  payload: {
                    ...val,
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
              <Form.Item label="email" name="email2">
                <Input defaultValue={email} disabled />
              </Form.Item>
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
                name="password2"
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
        </BrowserView>
        <MobileView>
          <QRCamera />
        </MobileView>
      </div>
    </>
  );
};

export default Login;
