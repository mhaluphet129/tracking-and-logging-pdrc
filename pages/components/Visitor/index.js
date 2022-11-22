import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Table,
  Typography,
  Space,
  AutoComplete,
  Col,
  Row,
  Tooltip,
  notification,
  Popconfirm,
  message,
} from "antd";
import {
  UserAddOutlined,
  LoginOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { AddVisitor, UpdateVisitor, VisitForm } from "./components";
import { IDGen, Timer, Profiler } from "../../assets/utilities";
import axios from "axios";
import moment from "moment";

const VisitorPage = () => {
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [trigger, setTrigger] = useState(0);
  const [_searchName, setSearchName] = useState("");
  const timerRef = useRef(null);
  const [load, setLoad] = useState("");
  const [visitorWithTimer, setVisitorWithTimer] = useState();
  const [openProfile, setOpenProfile] = useState({ show: false, data: null });
  const [dismissClick, setDismmissClick] = useState({
    show: false,
    index: null,
  });
  const [updateVisitor, setUpdateVisitor] = useState({
    open: false,
    data: null,
  });
  const [openVisitForm, setOpenVisitForm] = useState({
    show: false,
    data: null,
  });

  const [api, contextHolder] = notification.useNotification();

  const column = [
    {
      title: "ID",
      align: "center",
      render: (_, row) => (
        <Typography.Link>{IDGen(row?._id, 6)}</Typography.Link>
      ),
    },
    {
      title: "Name",
      width: 150,
      render: (_, row) => (
        <Typography>
          {row.name}
          {row?.middlename ? " " + row?.middlename : ""} {row.lastname}
        </Typography>
      ),
    },
    {
      title: "Age",
      width: 1,
      render: (_, row) => <Typography>{row.age}</Typography>,
    },
    {
      title: "Address",
      align: "center",
      width: 250,
      render: (_, row) => <Typography>{row.address}</Typography>,
    },
    {
      title: "Gender",
      width: 150,
      align: "center",
      render: (_, row) => <Typography>{row?.gender}</Typography>,
    },
    {
      title: "Actions",
      align: "center",
      render: (_, row) => (
        <>
          <Row style={{ display: "flex", justifyContent: "space-around" }}>
            <Col>
              <Tooltip title="Check In">
                <Typography.Link
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenVisitForm({ show: true, data: row });
                  }}
                >
                  <LoginOutlined />
                </Typography.Link>
              </Tooltip>
            </Col>
            <Col>
              <Tooltip title="Edit">
                <Typography.Link
                  onClick={(e) => {
                    e.stopPropagation();
                    setUpdateVisitor({ open: true, data: row });
                  }}
                >
                  <EditOutlined />
                </Typography.Link>
              </Tooltip>
            </Col>
          </Row>
          <Row style={{ display: "flex", justifyContent: "space-around" }}>
            <Col>
              <Tooltip title="View">
                <Typography.Link
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenProfile({ show: true, data: row });
                  }}
                >
                  <EyeOutlined />
                </Typography.Link>
              </Tooltip>
            </Col>
            <Col>
              <Tooltip title="Delete">
                <Popconfirm
                  title="Are you sure ?"
                  okText="Confirm"
                  onConfirm={async (e) => {
                    e.stopPropagation();
                    let { data } = await axios.get("/api/visitor", {
                      params: {
                        mode: "remove",
                        id: row?._id,
                      },
                    });

                    if (data.status == 200) {
                      setTrigger(trigger + 1);
                      message.success(data.message);
                    } else message.error(data.message);
                  }}
                >
                  <Typography.Link
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <DeleteOutlined />
                  </Typography.Link>
                </Popconfirm>
              </Tooltip>
            </Col>
          </Row>
        </>
      ),
    },
  ];

  const column2 = [
    {
      title: "Visitor Name",
      render: (_, row) => (
        <Typography>
          {row?.visitorId.name}
          {row?.visitorId.middlename
            ? " " + row?.visitorId.middlename
            : ""}{" "}
          {row.visitorId.lastname}
        </Typography>
      ),
    },
    {
      title: "Time left",
      align: "center",
      width: 200,
      render: (_, row, i) =>
        moment(row?.timeOut).diff(moment()) > 0 ? (
          <Timer
            endDate={row?.timeOut}
            reload={() => setTrigger(trigger + 1)}
            end={() => {
              setTrigger(trigger + 1);
              api["warning"]({
                message: "Time Visit",
                description: "Some visitor exceed visit duration.",
                duration: 0,
              });
            }}
          />
        ) : dismissClick.show && dismissClick.index == i ? (
          <Space>
            <Button
              onClick={async () => {
                let res = await axios.get("/api/visit", {
                  params: { mode: "visit-out", id: row._id },
                });
                if (res.data.status == 200) {
                  setTrigger(trigger + 1);
                  setDismmissClick({ show: false, index: null });
                }
              }}
              type="primary"
            >
              Confirm
            </Button>
            <Button
              onClick={() => setDismmissClick({ show: false, index: null })}
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Button
            onClick={() => setDismmissClick({ show: true, index: i })}
            danger
          >
            DISMISS
          </Button>
        ),
    },
  ];

  const searchName = async (keyword) => {
    if (keyword != "" && keyword != null) {
      let { data } = await axios.get("/api/visitor", {
        params: {
          mode: "search-visitor",
          searchKeyword: keyword,
        },
      });
      if (data.status == 200) {
        setVisitors(data.searchData);
        setLoading(false);
      }
    }
  };

  const runTimer = (key) => {
    setLoading(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(function () {
      searchName(key);
    }, 500);
  };

  useEffect(() => {
    const fetchVisitor = async () => {
      setLoad("fetch");
      let { data } = await axios.get("/api/visitor", {
        params: { mode: "fetch-all", search: _searchName },
      });
      if (data.status == 200) setVisitors(data.visitor);
      let res = await axios.get("/api/visit", {
        params: { mode: "visit-with-timers" },
      });
      if (res.data.status == 200) setVisitorWithTimer(res.data.data);
      setLoad("");
    };
    fetchVisitor();
  }, [trigger]);

  return (
    <div>
      {contextHolder}
      <Row>
        <Col span={14}>
          <Space style={{ marginBottom: 5 }}>
            <Button
              onClick={() => setShowAddVisitor(true)}
              icon={<UserAddOutlined />}
            >
              New Visitor
            </Button>
            <AutoComplete
              style={{
                width: 200,
              }}
              loading={loading}
              placeholder="Search by Name/ID"
              filterOption={(inputValue, option) =>
                option.value
                  ?.toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              }
              onChange={(_) => {
                runTimer(_);
                if (_?.length <= 0) {
                  setSearchName("");
                  setLoading(false);
                  setTrigger(trigger + 1);
                }
              }}
              autoFocus
              allowClear
            />
          </Space>
          <Table
            dataSource={visitors}
            columns={column}
            onRow={(data) => {
              return { onClick: () => setOpenProfile({ show: true, data }) };
            }}
            rowKey={(row) => row._id}
            loading={load == "fetch"}
          />
        </Col>
        <Col span={9} offset={1}>
          <Space style={{ marginBottom: 5, padding: 6 }}>
            <Typography.Text strong>Visit limit Timers</Typography.Text>
          </Space>
          <Table
            dataSource={visitorWithTimer}
            columns={column2}
            rowKey={(row) => row._id}
            pagination={{
              pageSize: 8,
            }}
            loading={load == "fetch"}
          />
        </Col>
      </Row>
      <AddVisitor
        open={showAddVisitor}
        close={() => setShowAddVisitor(false)}
        refresh={() => setTrigger(trigger + 1)}
      />
      <UpdateVisitor
        open={updateVisitor.open}
        close={() =>
          setUpdateVisitor((e) => {
            return { open: false, data: { ...e.data } };
          })
        }
        data={updateVisitor.data}
        refresh={() => setTrigger(trigger + 1)}
      />
      <Profiler
        openModal={openProfile.show}
        setOpenModal={setOpenProfile}
        data={openProfile.data}
      />
      <VisitForm
        open={openVisitForm.show}
        setOpen={setOpenVisitForm}
        data={openVisitForm.data}
        setTrigger={() => {}}
      />
    </div>
  );
};

export default VisitorPage;
