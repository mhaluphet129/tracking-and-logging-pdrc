import React, { useState } from "react";
import {
  Input,
  Modal,
  Form,
  Radio,
  Space,
  DatePicker,
  Button,
  Typography,
  Card,
  message,
} from "antd";
import axios from "axios";
import moment from "moment";
import { ArrowRightOutlined, CheckCircleOutlined } from "@ant-design/icons";

const AddVisitor = ({ open, close, refresh }) => {
  let [form] = Form.useForm();
  let [verifyContinue, setVerifyContinue] = useState(false);
  let [showResults, setShowResults] = useState({ show: false, data: null });
  let [loader, setLoader] = useState("");
  let [doneVerify, setDoneVerify] = useState(false);
  let [name, setName] = useState({
    name: "",
    middlename: "",
    lastname: "",
  });

  const handleFinish = async (val) => {
    let age = moment().diff(
      moment(val?.dateOfBirth).format("YYYY-MM-DD"),
      "years",
      false
    );
    let { data } = await axios.post("/api/visitor", {
      payload: {
        mode: "add-visitor",
        visitor: { ...val, age },
      },
    });

    if (data.status == 200) {
      close();
      refresh();
      message.success(data.message);
    } else message.error(data.message);
  };

  const handleVerify = async () => {
    if (name.name == "" || name.lastname == "") {
      message.error("You need to input name and lastname");
      return;
    }
    setLoader("verifying");
    let { data } = await axios.get("/api/etc", {
      params: {
        ...name,
        mode: "verify-name",
      },
    });

    if (data.status == 200) {
      setShowResults({ show: true, data: data.data });
      setDoneVerify(true);
    }
    setLoader("");
  };

  return (
    <>
      <Modal
        title={"PDRC VISITOR INFORMATION REGISTRATION FORM"}
        open={open}
        onCancel={close}
        closable={false}
        width={450}
        footer={
          verifyContinue && (
            <Button type="primary" onClick={form.submit}>
              Register
            </Button>
          )
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
            <Input
              onChange={(e) =>
                setName((_) => {
                  return { ..._, name: e.target.value };
                })
              }
            />
          </Form.Item>
          <Form.Item label="Middle Name (Optional)" name="middlename">
            <Input
              onChange={(e) =>
                setName((_) => {
                  return { ..._, middlename: e.target.value };
                })
              }
            />
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
            <Input
              onChange={(e) =>
                setName((_) => {
                  return { ..._, lastname: e.target.value };
                })
              }
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <Typography.Text
                type="secondary"
                style={{ marginRight: 5, fontSize: 11 }}
                italic
              >
                {!doneVerify && "Register the visitor after verification"}
              </Typography.Text>
              <Button
                style={{ width: 150, color: "#4BB543", borderColor: "#4BB543" }}
                onClick={handleVerify}
                loading={loader == "verifying"}
                disabled={doneVerify}
              >
                Verify Name {doneVerify && <CheckCircleOutlined />}
              </Button>
            </Space>
          </Form.Item>
          {verifyContinue && (
            <Form.Item label="Gender" name="gender" initialValue="male">
              <Radio.Group defaultValue="male">
                <Space>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          )}

          {verifyContinue && (
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
          )}

          {verifyContinue && (
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
          )}

          {verifyContinue && (
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
              <Input prefix="+63" maxLength={11} />
            </Form.Item>
          )}
        </Form>
      </Modal>
      <Modal
        open={showResults.show}
        onCancel={() => {
          setShowResults({ show: false, data: null });
          setDoneVerify(false);
        }}
        closable={false}
        footer={[
          <Button
            onClick={() => {
              setShowResults({ show: false, data: null });
              setDoneVerify(false);
            }}
          >
            Cancel
          </Button>,
          <Button
            type="primary"
            onClick={() => {
              setVerifyContinue(true);
              setShowResults({ show: false, data: null });
            }}
          >
            REGISTRATION CONTINUE <ArrowRightOutlined />
          </Button>,
        ]}
        width={800}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div style={{ alignSelf: "center" }}>
            <Typography.Title level={4}>Full Name</Typography.Title>
            <Card
              title={
                <>
                  {name.name}{" "}
                  {name.middlename != null || name.middlename != ""
                    ? name.middlename
                    : ""}{" "}
                  {name.lastname}{" "}
                  <Typography.Text type="secondary">
                    (
                    {showResults.data?.total != 0
                      ? (
                          (showResults.data?.countName /
                            showResults.data?.total) *
                          100
                        ).toFixed(2)
                      : 0}
                    %)
                  </Typography.Text>
                </>
              }
              style={{ height: 150, width: 300 }}
            >
              <strong>{showResults.data?.countName ?? 0}</strong> out of{" "}
              {showResults.data?.total} having exact name
            </Card>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Space direction="vertical">
              <Typography.Title level={4}>Name</Typography.Title>
              <Card
                title={
                  <>
                    {name.name}{" "}
                    <Typography.Text type="secondary">
                      (
                      {showResults.data?.total != 0
                        ? (
                            (showResults.data?.countName /
                              showResults.data?.total) *
                            100
                          ).toFixed(2)
                        : 0}
                      %)
                    </Typography.Text>
                  </>
                }
                style={{ height: 150 }}
              >
                <strong>{showResults.data?.countName ?? 0}</strong> out of{" "}
                {showResults.data?.total} having exact name
              </Card>
            </Space>
            <Space direction="vertical">
              <Typography.Title level={4}>Middlename</Typography.Title>
              <Card
                title={
                  name.middlename != "" ? (
                    <>
                      {name.middlename}{" "}
                      <Typography.Text type="secondary">
                        (
                        {showResults.data?.total != 0
                          ? (
                              (showResults.data?.countMiddleName /
                                showResults.data?.total) *
                              100
                            ).toFixed(2)
                          : 0}
                        %)
                      </Typography.Text>
                    </>
                  ) : (
                    <Typography.Text type="secondary" italic>
                      Not Set
                    </Typography.Text>
                  )
                }
                style={{ height: 150, width: 300 }}
              >
                {name.middlename != "" ? (
                  `${showResults.data?.countMiddleName ?? 0} out of ${
                    showResults.data?.total
                  }
          having exact name`
                ) : (
                  <Typography.Text type="secondary" italic>
                    Not Applicable
                  </Typography.Text>
                )}
              </Card>
            </Space>
            <Space direction="vertical">
              <Typography.Title level={4}>Lastname</Typography.Title>
              <Card
                title={
                  <>
                    {name.lastname}{" "}
                    <Typography.Text type="secondary">
                      (
                      {showResults.data?.total != 0
                        ? (
                            (showResults.data?.countLastname /
                              showResults.data?.total) *
                            100
                          ).toFixed(2)
                        : 0}
                      %)
                    </Typography.Text>
                  </>
                }
                style={{ height: 150 }}
              >
                <strong>{showResults.data?.countLastname ?? 0}</strong> out of{" "}
                {showResults.data?.total} having exact name
              </Card>
            </Space>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddVisitor;
