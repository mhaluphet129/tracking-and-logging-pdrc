import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Space,
  Form,
  Input,
  Modal,
  Button,
  message,
  Tag,
  Table,
  Typography,
  Checkbox,
  Tooltip,
  Badge,
  Card,
  Radio,
} from "antd";
import {
  LoginOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  CheckOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import QRCode from "qrcode";
import parse from "html-react-parser";
import axios from "axios";

import { SettingsContext } from "../../context";
import { VisitForm } from "../../components/Visitor/components";
import CheckLister from "./item_checklist_verifier";

const Profiler = ({ openModal, setOpenModal, data, setTrigger2 }) => {
  const [qr, setQr] = useState("");
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
  const [unclaimData, setUnclaimData] = useState({ show: false, data: null });
  const [listItemType, setListItemType] = useState("unclaimed");
  const [itemChecklist, setItemChecklist] = useState([]);

  const { setVisitHour, visitHour } = useContext(SettingsContext);

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
      setTrigger2((trig) => trig + 1);
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
      setTrigger(trigger + 1);
      message.success("Timed OUT.");
    }
    setLoader("");
  };

  const reload = () => {
    setUnclaimData(() => {
      let _items = [];
      if (listItemType == "all") _items = items;
      if (listItemType == "claimed") _items = items.filter((e) => e.claimed);
      if (listItemType == "unclaimed") _items = items.filter((e) => !e.claimed);

      return { show: true, data: _items };
    });
  };

  const handleClaim = async () => {
    let ids = [];
    itemChecklist.forEach((e, i) => {
      if (e) ids.push(items[i]?._id);
    });

    setLoader("updating-items");
    let res = await axios.get("/api/items", {
      params: {
        mode: "claim-true",
        ids: JSON.stringify(ids),
      },
    });

    if (res.data.status == 200) {
      setItems(res?.data?.data);
      setUnclaimData(() => {
        let _items = [];
        if (listItemType == "all") _items = res?.data?.data;
        if (listItemType == "claimed")
          _items = res?.data?.data.filter((e) => e.claimed);
        if (listItemType == "unclaimed")
          _items = res?.data?.data.filter((e) => !e.claimed);

        return { show: true, data: _items };
      });
    }
    setItemChecklist(itemChecklist.map(() => false));
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
  }, [data?._id, trigger]);

  useEffect(async () => {
    if (data != null || data != "") {
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
  }, [data, trigger]);

  return (
    <>
      <VisitForm
        open={visitIn}
        close={() => setVisitIn(false)}
        data={data}
        setTrigger={setTrigger}
      />
      <CheckLister
        open={openItemModal.show}
        close={() => setOpenItemModal({ show: false, data: null })}
        data={openItemModal.data}
        update={checkOut}
      />
      <Modal
        open={openModal}
        closable={false}
        footer={null}
        width={1100}
        onCancel={() => setOpenModal({ show: false, data: null })}
      >
        <Row>
          <Col span={8}>
            <Space direction="vertical">
              <span style={{ fontSize: 10, margin: 0 }}>ID: {data?._id}</span>
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
              <Space direction="horizontal">
                {isTimeOut ? (
                  <Tooltip
                    title={
                      moment().isAfter(moment(visitHour))
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
                      disabled={moment().isAfter(moment(visitHour))}
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

                <Badge.Ribbon text={unclaimTotal}>
                  <Button
                    size="large"
                    onClick={() => {
                      setItems(data?.items);
                      setItemChecklist(Array(data?.items.length).fill(false));

                      let _items = [];
                      if (listItemType == "all") _items = data?.item;
                      if (listItemType == "claimed")
                        _items = data?.item?.filter((e) => e.claimed);
                      if (listItemType == "unclaimed")
                        _items = data?.item?.filter((e) => !e.claimed);

                      setUnclaimData({
                        show: true,
                        data: _items,
                      });
                    }}
                    style={{ width: 200 }}
                  >
                    Check Items
                  </Button>
                </Badge.Ribbon>

                {/* <Tooltip title="Open Print Viewer">
                  <Button size="large" style={{ width: 200 }}>
                    Print Visitor Data
                  </Button>
                </Tooltip> */}
              </Space>
              <strong>Recent Visit</strong>
              <Table
                columns={columns}
                dataSource={visitData}
                rowKey={(row) => row._id}
                style={{ width: 700 }}
                loading={loader == "fetch-visit"}
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
                                  e?.status[e?.status?.length - 1] == "DISPOSED"
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
        open={unclaimData.show}
        closable={false}
        footer={null}
        width={800}
        title="Item List"
        style={{
          top: 50,
        }}
        onCancel={() => {
          setUnclaimData({ show: false, data: null });
          setListItemType("unclaimed");
        }}
      >
        <Space
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Radio.Group
            value={listItemType}
            onChange={(e) => {
              setListItemType(e.target.value);
              setUnclaimData(() => {
                let _items = [];
                if (e.target.value == "all") _items = items;
                if (e.target.value == "claimed")
                  _items = items.filter((e) => e.claimed);
                if (e.target.value == "unclaimed")
                  _items = items.filter((e) => !e.claimed);

                return { show: true, data: _items };
              });
            }}
          >
            <Radio value="all">All</Radio>
            <Radio value="claimed">Claimed</Radio>
            <Radio value="unclaimed">Unclaimed</Radio>
          </Radio.Group>
          <Space>
            {listItemType != "claimed" && (
              <Button
                onClick={() => {
                  if (
                    itemChecklist.filter((e) => e).length ==
                    itemChecklist?.length
                  )
                    setItemChecklist(itemChecklist.map(() => false));
                  else setItemChecklist(itemChecklist.map(() => true));
                }}
              >
                {itemChecklist.filter((e) => e).length == itemChecklist?.length
                  ? `Unselect All (${itemChecklist.length})`
                  : "Select All"}
              </Button>
            )}
            {itemChecklist.filter((e) => e).length > 0 && (
              <Button
                type="primary"
                onClick={handleClaim}
                loading={loader == "updating-items"}
                disabled={loader == "updating-items"}
              >
                Claim{" "}
                {itemChecklist.filter((e) => e).length == itemChecklist?.length
                  ? "All"
                  : ""}
              </Button>
            )}
          </Space>
        </Space>
        <Row
          gutter={[16, 16]}
          style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
        >
          {unclaimData?.data?.map((e, i) => (
            <Col
              span={8}
              key={i + e?.name}
              style={{ marginTop: 8, marginBottom: 8 }}
            >
              <Card
                title={e?.name}
                onClick={() => {
                  if (listItemType != "claimed") {
                    let _items = itemChecklist;
                    _items[i] = !_items[i];
                    setItemChecklist(_items);
                    reload();
                  }
                }}
                extra={[
                  listItemType != "claimed" ? (
                    <Checkbox
                      checked={itemChecklist[i]}
                      onChange={(e) => {
                        let _items = itemChecklist;
                        _items[i] = e.target.checked;
                        setItemChecklist(_items);
                        reload();
                      }}
                    />
                  ) : (
                    <CheckCircleOutlined
                      style={{ color: "green", fontSize: 20 }}
                    />
                  ),
                ]}
                hoverable
              >
                Description: <br />
                <Typography.Text type="secondary">
                  {e?.description}
                </Typography.Text>
              </Card>
            </Col>
          ))}
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
