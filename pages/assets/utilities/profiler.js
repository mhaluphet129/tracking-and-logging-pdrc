import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Space,
  Form,
  Input,
  Select,
  Modal,
  Button,
  Spin,
  message,
  Tag,
  Table,
  Typography,
  Checkbox,
  Tooltip,
  Badge,
  Popconfirm,
  InputNumber,
} from "antd";
import moment from "moment";
import {
  LoginOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import QRCode from "qrcode";
import parse from "html-react-parser";
import axios from "axios";

const Profiler = ({ openModal, setOpenModal, data }) => {
  const [qr, setQr] = useState("");
  const [loader, setLoader] = useState("");
  const [visitData, setVisitData] = useState([]);
  const [depositItems, setDepositItems] = useState([]);
  const [visitIn, setVisitIn] = useState(false);
  const [openRemarks, setOpenRemarks] = useState({ show: false, data: null });
  const [hasViolation, setHasViolation] = useState(false);
  const [openAddRemarks, setOpenAddRemarks] = useState(false);
  const [refViolation, setRefViolation] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [durationType, setDurationType] = useState("hours");
  const [isTimeOut, setIsTimeOut] = useState(true);

  let depositOptions = ["Food", "Money", "Clothes"];
  let filteredOptions = depositOptions.filter((e) => !depositItems.includes(e));

  const handleFinish = async (val) => {
    if (val.prisonerName == null || val.relationship == null) {
      message.warning("Please fill the required input.");
      return;
    }

    let obj = {
      visitorId: data._id,
      timeIn: moment(),
      timeOut: moment().add(val?.duration, durationType),
      prisonerName: val.prisonerName,
      relationship: val.relationship,
      depositItems: val.depositItems,
      date: moment(),
    };

    setLoader("registering");
    let res = await axios.post("/api/visit", {
      payload: {
        mode: "new-visit",
        data: obj,
      },
    });
    setLoader("");

    if (res.data.status == 200) {
      setVisitIn(false);
      message.success(res.data.message);
      setTrigger(trigger + 1);
    }
  };

  const handleFinishRemarks = async (val) => {
    val = { ...val, hasViolation };
    let res = await axios.post("/api/visit", {
      payload: {
        ...val,
        id: visitData[0]?._id,
        mode: "new-remarks",
      },
    });

    if (res.data.status == 200) {
      setOpenRemarks({ show: false, data: null });
      setOpenAddRemarks(false);
      message.success(res.data.message);
      setTrigger(trigger + 1);
    }
  };

  const columns = [
    {
      title: "Status",
      align: "center",
      render: (_, row) => (
        <Space direction="vertical">
          {!row?.timeOutDone ? (
            <Tag color="success">TIME IN</Tag>
          ) : (
            <Tag color="warning">TIME OUT</Tag>
          )}
          {row?.remarks.filter((e) => e.hasViolation)?.length > 0 ? (
            <Tag color="error">Violation</Tag>
          ) : null}
        </Space>
      ),
    },
    {
      title: "DATE",
      width: 150,
      render: (_, row) => moment(row?.createdAt).format("MMM DD, YYYY"),
    },
    {
      title: "TIME IN/OUT",
      render: (_, row) =>
        `${moment(row?.timeIn).format("hh:mm A")} - ${moment(
          row?.timeOut
        ).format("hh:mm A")}`,
    },
    {
      align: "center",
      title: "Function",
      render: (_, row) => (
        <Button
          onClick={() => setOpenRemarks({ show: true, data: row?.remarks })}
        >
          REMARKS
        </Button>
      ),
    },
  ];

  const column2 = [
    {
      title: "TITLE",
      render: (_, row) => <Typography>{row?.title}</Typography>,
    },
    {
      title: "DESCRIPTION",
      render: (_, row) => <Typography>{row?.description}</Typography>,
    },
    {
      title: "DATE ADDED",
      render: (_, row) => (
        <Typography>
          {moment(row?.createdAt).format("MMM DD, YYYY hh:mm a")}
        </Typography>
      ),
    },
  ];

  useEffect(async () => {
    let res = await axios.get("/api/visitor", {
      params: { mode: "check-isTimeIn", id: data?._id },
    });

    if (res.data.status == 200) setIsTimeOut(res.data.data.timeOut);
  }, [data?._id]);

  useEffect(async () => {
    QRCode.toString(data?._id?.toString(), function (err, url) {
      setQr(parse(url || ""));
    });

    setLoader("fetch-visit");
    let res = await axios.get("/api/visit", {
      params: {
        mode: "get-visit-data",
        id: data?._id,
      },
    });

    if (res.data.status == 200) {
      setVisitData(res.data.data);
      if (res.data.data != null) {
        res.data.data.forEach((e) => {
          e.remarks.forEach((e2) => {
            if (e2.hasViolation) setRefViolation(true);
          });
        });
      }
    }
    setLoader("");
  }, [data, trigger]);

  return (
    <>
      <Modal
        open={openModal}
        closable={false}
        footer={null}
        width={1100}
        onCancel={() => setOpenModal(false)}
      >
        <Row>
          <Col span={8}>
            <Space direction="vertical">
              <span>ID: {data?._id}</span>
              <Badge.Ribbon
                text={refViolation ? "Has Violation" : "No Violation"}
                color={refViolation ? "red" : "blue"}
              >
                <div style={{ width: 200 }}>{qr}</div>
              </Badge.Ribbon>
              <strong>Fullname</strong>
              <span style={{ marginLeft: 10 }}>
                {data?.name} {data?.middlename ?? ""} {data?.lastname}
              </span>
              <strong>Age and Gender</strong>
              <span style={{ marginLeft: 10 }}>
                {data?.age} , {data?.gender}
              </span>
              <strong>Date of Birth</strong>
              <span style={{ marginLeft: 10 }}>
                {moment(data?.dateOfBirth).format("MMMM DD, YYYY")}
              </span>
              <strong>Address</strong>
              <span style={{ marginLeft: 10 }}>{data?.address}</span>
              <strong>Contact Number</strong>
              <span style={{ marginLeft: 10 }}>{data?.contactNumber}</span>
            </Space>
          </Col>
          <Col span={16}>
            <Space direction="vertical">
              <>
                {!isTimeOut ? (
                  <Button
                    type="primary"
                    size="large"
                    style={{ width: 200 }}
                    icon={<LoginOutlined />}
                    onClick={() => setVisitIn(true)}
                    ghost
                  >
                    VISIT IN
                  </Button>
                ) : (
                  <Space>
                    <Popconfirm
                      title="Just confirming."
                      onConfirm={async () => {
                        setLoader("registering");
                        let res = await axios.get("/api/visit", {
                          params: { mode: "visit-out", id: visitData[0]._id },
                        });
                        if (res.data.status == 200) {
                          setTrigger(trigger + 1);
                          message.success("Timed OUT.");
                        }
                        setLoader("");
                      }}
                    >
                      <Button
                        type="primary"
                        style={{ width: 200 }}
                        size="large"
                        icon={<LogoutOutlined />}
                        ghost
                        danger
                      >
                        Check Out
                      </Button>
                    </Popconfirm>
                    <Button
                      size="large"
                      icon={<LogoutOutlined />}
                      style={{ width: 200 }}
                    >
                      Quick Check-Out
                    </Button>
                  </Space>
                )}
              </>
              <strong>Recent Visit</strong>
              <Table
                columns={columns}
                dataSource={visitData}
                rowKey={(row) => row._id}
                loading={loader == "fetch-visit"}
                expandable={{
                  expandedRowRender: (row) => (
                    <p>
                      Visit Prisoner: {row?.prisonerName} <br />
                      Relationship to Prisoner: {row?.relationship} <br />
                      Deposited Items:{" "}
                      {row?.depositItems.length > 0 ? (
                        row?.depositItems.map((e, i) => <Tag key={i}>{e}</Tag>)
                      ) : (
                        <Typography.Text type="secondary" italic>
                          NONE
                        </Typography.Text>
                      )}
                    </p>
                  ),
                }}
                pagination={{
                  pageSize: 6,
                }}
                rowClassName={(row) =>
                  row?.remarks.filter((e) => e.hasViolation)?.length > 0
                    ? "red"
                    : "green"
                }
              />
            </Space>
          </Col>
        </Row>
      </Modal>
      <Modal
        open={visitIn}
        onCancel={() => setVisitIn(false)}
        closable={false}
        footer={null}
        title="Visitation Form"
        destroyOnClose
      >
        <Spin spinning={loader == "registering"}>
          <Form
            labelCol={{
              flex: "150px",
            }}
            labelAlign="left"
            labelWrap
            wrapperCol={{
              flex: 1,
            }}
            colon={false}
            onFinish={handleFinish}
          >
            <Form.Item name="prisonerName" label="Name of prisoner">
              <Input />
            </Form.Item>
            <Form.Item label="Relation to prisoner" name="relationship">
              <Input />
            </Form.Item>
            <Form.Item label="Visit Duration" name="duration">
              <InputNumber
                placeholder={`max: ${durationType == "minutes" ? 120 : 2}`}
                addonAfter={
                  <Select
                    style={{ width: 100 }}
                    onChange={(e) => setDurationType(e)}
                    value={durationType}
                  >
                    <Select.Option value="minutes">Minutes</Select.Option>
                    <Select.Option value="hours">Hour</Select.Option>
                  </Select>
                }
                min={0}
                max={durationType == "minutes" ? 120 : 2}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              label="Deposit Items"
              name="depositItems"
              initialValue={depositItems}
            >
              <Select
                mode="multiple"
                onChange={setDepositItems}
                options={filteredOptions.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
            </Form.Item>
            <Form.Item noStyle>
              <Button
                type="primary"
                style={{ width: "100%" }}
                htmlType="submit"
                size="large"
              >
                SUBMIT
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      <Modal
        open={openRemarks.show}
        onCancel={() => setOpenRemarks({ show: false, data: null })}
        title={
          <Space
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography>
              Remarks (
              <Typography.Text italic type="secondary" style={{ fontSize: 13 }}>
                {" "}
                <span style={{ color: "red", fontStyle: "normal" }}>
                  Red*
                </span>{" "}
                means violation
              </Typography.Text>{" "}
              )
            </Typography>
            <Button onClick={() => setOpenAddRemarks(true)}>Add Remarks</Button>
          </Space>
        }
        closable={false}
        footer={null}
        width={600}
      >
        <Table
          columns={column2}
          dataSource={openRemarks.data}
          rowClassName={(record) => (record.hasViolation ? "red" : null)}
        />
      </Modal>
      <Modal
        open={openAddRemarks}
        onCancel={() => setOpenAddRemarks(false)}
        title="Add Remarks"
        closable={false}
        footer={null}
        destroyOnClose
      >
        <Form
          labelCol={{
            flex: "90px",
          }}
          labelAlign="left"
          labelWrap
          wrapperCol={{
            flex: 1,
          }}
          colon={false}
          onFinish={handleFinishRemarks}
        >
          <Form.Item label="Title" name="title" style={{ marginBottom: 0 }}>
            <Input />
          </Form.Item>
          <Form.Item noStyle name="hasViolation">
            <Checkbox
              style={{ marginLeft: 90, marginBottom: 10, marginTop: 5 }}
              onChange={(e) => setHasViolation(e.target.checked)}
            />{" "}
            Has Violation
            <Tooltip
              title="This violation will be visible on visitor profile."
              color="#108ee9"
            >
              {" "}
              <QuestionCircleOutlined />
            </Tooltip>
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item noStyle>
            <Button
              type="primary"
              style={{ width: "100%" }}
              htmlType="submit"
              size="large"
            >
              SUBMIT
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Profiler;
