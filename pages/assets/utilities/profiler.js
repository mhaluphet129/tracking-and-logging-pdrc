import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Space,
  Form,
  Input,
  Modal,
  Button,
  Tag,
  Table,
  Typography,
  Checkbox,
  Tooltip,
  Badge,
  Image,
  Collapse,
  message,
  theme,
} from "antd";
import {
  LoginOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  CheckOutlined,
  DeleteOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import moment from "moment";
import axios from "axios";

import { SettingsContext } from "../../context";
import { VisitForm } from "../../components/Visitor/components";
import CheckLister from "./item_checklist_verifier";
import ItemChecklist from "./items-checklist";
import QRViewer from "./qr_view";
import autoCap from "./autocapital";

const Profiler = ({ openModal, setOpenModal, data, refresh }) => {
  const [loader, setLoader] = useState("");
  const [visitData, setVisitData] = useState([]);
  const [visitIn, setVisitIn] = useState(false);
  const [openRemarks, setOpenRemarks] = useState({ show: false, data: null });
  const [hasViolation, setHasViolation] = useState(false);
  const [openAddRemarks, setOpenAddRemarks] = useState(false);
  const [refViolation, setRefViolation] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [isTimeOut, setIsTimeOut] = useState(true);
  const [openItemModal, setOpenItemModal] = useState({
    show: false,
    data: null,
  });
  const [unclaimTotal, setUnclaimTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [show, setShow] = useState(false);
  const [openRemarksIndex, setOpenRemarksIndex] = useState(-1);
  const [openQr, setOpenQr] = useState(false);

  const [showFullInfo, setShowFullInfo] = useState(false);
  const [visitHour, setVisitHour] = useState(null);

  const { titleRef } = useContext(SettingsContext);

  const { token } = theme.useToken();

  const handleFinishRemarks = async (val) => {
    console.log(openRemarksIndex);
    val = { ...val, hasViolation };
    let res = await axios.post("/api/visit", {
      payload: {
        ...val,
        id: visitData[openRemarksIndex]?._id,
        mode: "new-remarks",
      },
    });

    if (res.data.status == 200) {
      setOpenRemarks({ show: false, data: null });
      setOpenAddRemarks(false);
      message.success(res.data.message);
      setTrigger(trigger + 1);
      if (typeof refresh == "function") refresh((trig) => trig + 1);
    }
  };

  const checkOut = async () => {
    setLoader("registering");
    let res = await axios.get("/api/visit", {
      params: {
        mode: "visit-out",
        id: visitData[0]._id,
      },
    });
    if (res.data.status == 200) {
      if (titleRef.current != undefined) clearInterval(titleRef.current);
      setTrigger(trigger + 1);
      if (typeof refresh == "function") refresh((trig) => trig + 1);
      setOpenModal(false);
      message.success("Timed OUT.");
    }
    setLoader("");
  };

  const handleClaim = async () => {
    let ids = [];

    setLoader("updating-items");
    let res = await axios.get("/api/items", {
      params: {
        mode: "claim-true",
        ids: JSON.stringify(ids),
      },
    });

    if (res.data.status == 200) {
      setItems(res?.data?.data);
    }
    setLoader("");
  };

  const columns = [
    {
      title: "Status",
      align: "center",
      render: (_, row) => (
        <Space direction="vertical">
          {!row?.timeOutDone ? (
            <Tag color="success">CHECK IN</Tag>
          ) : (
            <Tag color="warning">CHECK OUT</Tag>
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
      render: (_, row, i) => (
        <Button
          onClick={() => {
            setOpenRemarks({ show: true, data: row?.remarks });
            setOpenRemarksIndex(i);
          }}
        >
          ADD REMARKS
        </Button>
      ),
    },
    Table.EXPAND_COLUMN,
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

  useEffect(() => {
    (async () => {
      let res = await axios.get("/api/visitor", {
        params: { mode: "check-isTimeIn", id: data?._id },
      });

      if (res.data.status == 200) setIsTimeOut(res.data.data.timeOut);
    })();
  }, [data?._id, trigger]);

  useEffect(() => {
    (async () => {
      if (data != null || data != "") {
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
            res.data.data?.forEach((e) => {
              e.remarks.forEach((e2) => {
                if (e2.hasViolation) setRefViolation(true);
              });
            });
          }
        }

        setUnclaimTotal(
          data?.items?.reduce((p, n) => {
            if (!n.claimed) return p + 1;
            return p;
          }, 0)
        );

        setLoader("");
      }
    })();
  }, [data, trigger]);

  useEffect(() => {
    (async () => {
      let d = await axios.get("/api/etc", {
        params: {
          mode: "get-visit-hour",
        },
      });

      if (d.data.status == 200) {
        setVisitHour(d.data.data.visitLimit);
      } else message.error(d.data.data.message);
    })();
  }, []);

  return (
    <>
      <VisitForm
        open={visitIn}
        close={() => setVisitIn(false)}
        data={data}
        setTrigger={setTrigger}
        setTrigger2={refresh}
        parentClose={() => setOpenModal(false)}
      />
      <CheckLister
        open={openItemModal.show}
        close={() => setOpenItemModal({ show: false, data: null })}
        data={openItemModal.data}
        update={checkOut}
      />
      <ItemChecklist
        open={show}
        close={() => setShow(false)}
        items={items}
        setItems={setItems}
        setUnclaimTotal={setUnclaimTotal}
      />
      <QRViewer
        open={openQr}
        close={() => setOpenQr(false)}
        id={data?._id}
        data={data}
      />
      {/* <Modal
        open={openQr}
        footer={null}
        onCancel={() => setOpenQr(false)}
        maskClosable={false}
      > */}
      {/* <span style={{ fontSize: 10, margin: 0 }}>ID: {data?._id}</span> */}
      {/* <Badge.Ribbon
          text={refViolation ? "Has Violation" : "No Violation"}
          color={refViolation ? "red" : "blue"}
        > */}
      {/* <div>{qr}</div> */}
      {/* </Badge.Ribbon> */}
      {/* </Modal> */}
      <Modal
        open={openModal}
        footer={null}
        width={1100}
        onCancel={() => setOpenModal(false)}
        maskClosable={false}
      >
        <Row>
          <Col span={6}>
            <Space direction="vertical">
              <div
                style={{
                  width: 200,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#eee",
                  borderRadius: "5%",
                }}
              >
                {data?.photo != null ? (
                  <>
                    {refViolation && (
                      <Badge.Ribbon text="Has Violation" color="red">
                        <Image src={data?.photo} />
                      </Badge.Ribbon>
                    )}
                    {!refViolation && <Image src={data?.photo} />}
                  </>
                ) : (
                  <Typography.Title type="secondary" level={3} italic>
                    No Image
                  </Typography.Title>
                )}
              </div>
              {!showFullInfo && (
                <strong
                  style={{
                    textAlign: "center",
                    display: "block",
                    width: 200,
                  }}
                >
                  {autoCap(data?.name)}{" "}
                  {data?.middlename != null ? autoCap(data?.middlename) : ""}{" "}
                  {autoCap(data?.lastname)}
                </strong>
              )}
              <Button onClick={() => setOpenQr(true)} style={{ width: 200 }}>
                Generate QR
              </Button>

              <Collapse
                bordered={false}
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined rotate={isActive ? 90 : 0} />
                )}
                style={{
                  background: token.colorBgContainer,
                }}
                onChange={() => setShowFullInfo(!showFullInfo)}
              >
                <Collapse.Panel
                  header={
                    showFullInfo ? "Collapse Full Info " : "Show Full Info"
                  }
                  style={{
                    marginBottom: 24,
                    background: token.colorFillAlter,
                    borderRadius: token.borderRadiusLG,
                    border: "none",
                  }}
                >
                  <strong style={{ textDecoration: "underline" }}>
                    Fullname
                  </strong>{" "}
                  <br />
                  <span style={{ marginLeft: 10 }}>
                    {autoCap(data?.name)}{" "}
                    {data?.middlename != null ? autoCap(data?.middlename) : ""}{" "}
                    {autoCap(data?.lastname)}
                  </span>
                  <br />
                  <strong style={{ textDecoration: "underline" }}>
                    Gender
                  </strong>
                  <br />
                  <span style={{ marginLeft: 10 }}>{data?.gender}</span> <br />
                  <strong style={{ textDecoration: "underline" }}>
                    Date of Birth
                  </strong>{" "}
                  <br />
                  <span style={{ marginLeft: 10 }}>
                    {moment(data?.dateOfBirth).format("MMMM DD, YYYY")}
                  </span>
                  <br />
                  <strong style={{ textDecoration: "underline" }}>Age</strong>
                  <br />
                  <span style={{ marginLeft: 10 }}>
                    {moment().year() - moment(data?.dateOfBirth).year()} years
                    old
                  </span>
                  <br />
                  <strong style={{ textDecoration: "underline" }}>
                    Address
                  </strong>
                  <br />
                  <span style={{ marginLeft: 10 }}>{data?.barangay}</span>
                  <br />
                  <span style={{ marginLeft: 10 }}>
                    {data?.cityId?.name}, {data?.provinceId?.name} <br />
                    <span style={{ marginLeft: 10 }}>
                      {data?.regionId?.name}
                    </span>
                  </span>
                  <br />
                  <strong style={{ textDecoration: "underline" }}>
                    Contact Number
                  </strong>
                  <br />
                  <span style={{ marginLeft: 10 }}>{data?.contactNumber}</span>
                  <br />
                  <strong style={{ textDecoration: "underline" }}>
                    Registered Date
                  </strong>
                  <br />
                  <span style={{ marginLeft: 10 }}>
                    {moment(data?.createdAt).format("MMMM DD, YYYY")}
                  </span>
                </Collapse.Panel>
              </Collapse>
            </Space>
          </Col>
          <Col span={18}>
            <Space direction="vertical">
              <Space direction="horizontal">
                {isTimeOut ? (
                  <Tooltip
                    title={
                      moment().isAfter(
                        moment({
                          hour: moment(visitHour).format("HH"),
                          minute: moment(visitHour).format("M"),
                        })
                      )
                        ? "Visiting hour is close"
                        : null
                    }
                  >
                    <Button
                      type="primary"
                      size="large"
                      style={{ width: 200 }}
                      icon={<LoginOutlined />}
                      onClick={() => setVisitIn(true)}
                      disabled={moment().isAfter(
                        moment({
                          hour: moment(visitHour).format("HH"),
                          minute: moment(visitHour).format("M"),
                        })
                      )}
                      ghost
                    >
                      VISIT IN
                    </Button>
                  </Tooltip>
                ) : (
                  <Space>
                    <Button
                      type="primary"
                      style={{ width: 200 }}
                      size="large"
                      icon={<LogoutOutlined />}
                      onClick={async () => {
                        let res = await axios.get("/api/visit", {
                          params: {
                            mode: "visitor-has-items",
                            id: data?._id,
                          },
                        });

                        if (res.status == 200) {
                          if (res.data?.data?.length > 0) {
                            setOpenItemModal({
                              show: true,
                              data: res?.data?.data,
                            });
                          } else checkOut();
                        }
                      }}
                      ghost
                      danger
                    >
                      Check Out
                    </Button>

                    <Button
                      size="large"
                      icon={<LogoutOutlined />}
                      style={{ width: 200 }}
                      onClick={checkOut}
                    >
                      Quick Check-Out
                    </Button>
                  </Space>
                )}

                <Button
                  size="large"
                  onClick={() => {
                    if (items?.length == 0) setItems(data?.items);
                    setShow(true);
                  }}
                  style={{ width: 250 }}
                >
                  {`Check Items (${
                    unclaimTotal == undefined ? 0 : unclaimTotal
                  } unclaimed)`}
                </Button>

                {/* <Tooltip title="Open Print Viewer">
                  <Button size="large" style={{ width: 200 }}>
                    Print Visitor Data
                  </Button>
                </Tooltip> */}
              </Space>
              <Collapse size="large">
                <Collapse.Panel header="Click to see Recent Visit/Logs" key="1">
                  <Table
                    columns={columns}
                    dataSource={visitData}
                    rowKey={(row) => row._id}
                    style={{ width: 700 }}
                    loading={loader == "fetch-visit"}
                    footer={() => (
                      <Typography.Text>
                        Total: {visitData?.length ?? 0}
                      </Typography.Text>
                    )}
                    expandable={{
                      expandedRowRender: (row) => (
                        <p>
                          Visit Prisoner: {row?.prisonerName} <br />
                          Relationship to Prisoner: {row?.relationship} <br />
                          Deposited Items{" "}
                          <Tooltip title='"✓" means the item is claimed by owner'>
                            <QuestionCircleOutlined />
                          </Tooltip>
                          :{" "}
                          {row?.depositItems.length > 0 ? (
                            row?.depositItems.map((e, i) => (
                              <Tooltip
                                key={e?.name + i}
                                title={
                                  e?.claimed
                                    ? "CLAIMED"
                                    : e?.status &&
                                      e?.status[e?.status?.length - 1] ==
                                        "DISPOSED"
                                    ? "DISPOSED"
                                    : "UNCLAIMED"
                                }
                              >
                                <Tag
                                  color={
                                    e?.claimed
                                      ? "success"
                                      : e?.status &&
                                        e?.status[e?.status?.length - 1] ==
                                          "DISPOSED"
                                      ? "error"
                                      : null
                                  }
                                >
                                  {e?.claimed ? (
                                    <CheckOutlined />
                                  ) : e?.status &&
                                    e?.status[e?.status?.length - 1] ==
                                      "DISPOSED" ? (
                                    <DeleteOutlined />
                                  ) : (
                                    ""
                                  )}{" "}
                                  {e?.name}
                                </Tag>
                              </Tooltip>
                            ))
                          ) : (
                            <Typography.Text type="secondary" italic>
                              NONE
                            </Typography.Text>
                          )}
                        </p>
                      ),
                    }}
                    pagination={false}
                    scroll={{ y: 400 }}
                    rowClassName={(row) =>
                      row?.remarks.filter((e) => e.hasViolation)?.length > 0
                        ? "red"
                        : "green"
                    }
                  />
                </Collapse.Panel>
              </Collapse>
            </Space>
          </Col>
        </Row>
      </Modal>
      <Modal
        open={openRemarks.show}
        onCancel={() => setOpenRemarks({ show: false, data: null })}
        title={
          <Space
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 20,
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
        maskClosable={false}
        footer={null}
        width={600}
      >
        <Table
          columns={column2}
          dataSource={openRemarks.data}
          rowClassName={(record) => (record.hasViolation ? "red" : null)}
          footer={() => (
            <Typography.Text>
              Total: {openRemarks.data?.length ?? 0}
            </Typography.Text>
          )}
        />
      </Modal>
      <Modal
        open={openAddRemarks}
        onCancel={() => setOpenAddRemarks(false)}
        title="Add Remarks"
        maskClosable={false}
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
