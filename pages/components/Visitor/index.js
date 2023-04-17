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
  Card,
  Image,
  DatePicker,
} from "antd";
import {
  UserAddOutlined,
  LoginOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { AddVisitor, UpdateVisitor, VisitForm } from "./components";
import { InvisibleTimer, Profiler, autoCap } from "../../assets/utilities";
import axios from "axios";
import moment from "moment";
import { PageHeader } from "@ant-design/pro-layout";

const VisitorPage = () => {
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [trigger, setTrigger] = useState(0);
  const [_searchName, setSearchName] = useState("");
  const timerRef = useRef(null);
  const [load, setLoad] = useState("");
  const [openProfile, setOpenProfile] = useState({ show: false, data: null });
  const [updateVisitor, setUpdateVisitor] = useState({
    open: false,
    data: null,
  });
  const [openVisitForm, setOpenVisitForm] = useState({
    show: false,
    data: null,
  });
  let [regionObj, setRegionObj] = useState([]);
  const [dateFilter, setDateFilter] = useState([]);

  const [api, contextHolder] = notification.useNotification();

  const column = [
    // {
    //   title: "ID",
    //   align: "center",
    //   width: 70,
    //   render: (_, row) => (
    //     <Typography.Link>{IDGen(row?._id, 6)}</Typography.Link>
    //   ),
    // },
    {
      title: "Name",
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
      render: (_, row) => (
        <Typography>
          {autoCap(row?.name)}{" "}
          {row?.middlename != null ? autoCap(row?.middlename) : ""}{" "}
          {autoCap(row?.lastname)}
        </Typography>
      ),
    },
    {
      title: "Age",
      width: 1,
      align: "center",
      sorter: (a, b) => {
        let _a = moment().diff(
          moment(a?.dateOfBirth).format("YYYY-MM-DD"),
          "years",
          false
        );
        let _b = moment().diff(
          moment(b?.dateOfBirth).format("YYYY-MM-DD"),
          "years",
          false
        );

        return _a - _b;
      },
      sortDirections: ["ascend", "descend"],
      render: (_, row) => (
        <Typography>
          {moment().diff(
            moment(row?.dateOfBirth).format("YYYY-MM-DD"),
            "years",
            false
          )}
        </Typography>
      ),
    },
    {
      title: "Address",
      width: 200,
      render: (_, row) => (
        <Typography>
          {row.barangay != "" || row.barangay != null
            ? row.barangay + ", "
            : ""}
          {row.cityId.name}, {row.provinceId.name} <br />
          {row.regionId.name}
        </Typography>
      ),
    },
    {
      title: "Gender",
      width: 100,
      align: "center",
      render: (_, row) => <Typography>{row?.gender}</Typography>,
    },
    {
      title: "Date Registered",
      width: 150,
      align: "center",
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      render: (_, row) => (
        <Typography>
          {moment(row?.createdAt).format("MMM DD, YYYY hh:mm:ss a")}
        </Typography>
      ),
    },
    {
      title: "Quick Actions",
      align: "center",
      width: 50,
      render: (_, row) => (
        <>
          <Row style={{ display: "flex", justifyContent: "center" }}>
            <Col style={{ marginRight: 5 }}>
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
            <Col style={{ marginLeft: 5 }}>
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
          <Row style={{ display: "flex", justifyContent: "center" }}>
            <Col style={{ marginRight: 5 }}>
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
            <Col style={{ marginLeft: 5 }}>
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

  const printColumn = [
    {
      title: "Name",
      width: 150,
      render: (_, row) => (
        <Typography>
          {row.name}
          {row?.middlename
            ? " " + `${row?.middlename[0].toUpperCase()}.`
            : ""}{" "}
          {row.lastname}
        </Typography>
      ),
    },
    {
      title: "Age",
      width: 1,
      align: "center",
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
  ];

  const CustomTable = () => (
    <Row>
      <Col span={7}>
        <Row justify="space-around">
          <Col>
            <Image
              preview={false}
              src="/pdrc-logo2.png"
              alt="logo"
              width={150}
            />
          </Col>
        </Row>
      </Col>
      <Col span={10} style={{ marginBottom: 50 }}>
        <Space
          style={{
            width: "100%",
            alignItems: "center",
            fontWeight: 900,
          }}
          direction="vertical"
        >
          <Typography.Text style={{ color: "#757575" }}>
            Republic of the Philippines
          </Typography.Text>
          <Typography.Text style={{ color: "#757575" }}>
            Malaybalay
          </Typography.Text>
          <Typography.Text style={{ marginBottom: 10, color: "#757575" }}>
            PROVINCE OF BUKIDNON
          </Typography.Text>
          <Typography.Text
            style={{ marginBottom: 15, color: "#757575", fontSize: 12 }}
          >
            Provincial Detention and Rehabilitation Center
          </Typography.Text>
          <Typography.Text
            style={{
              marginBottom: 20,
              fontWeight: 900,
              color: "#000",
              fontSize: "1.5em",
            }}
          >
            Masterlist of Visitor
          </Typography.Text>
        </Space>
      </Col>
      <Col span={7}>
        <Row justify="space-around">
          <Col>
            <Image
              preview={false}
              src="/pdrc-logo.png"
              width={150}
              alt="pdrc logo"
            />
          </Col>
        </Row>
      </Col>
      <Col span={18} offset={3}>
        <Table
          dataSource={visitors}
          footer={() => (
            <Typography.Text>Total: {visitors?.length ?? 0}</Typography.Text>
          )}
          columns={printColumn}
          rowKey={(row) => row._id}
          pagination={false}
        />
      </Col>
      <Col span={8} offset={3}>
        <Typography.Text
          style={{
            marginTop: 10,
            fontWeight: 900,
            color: "#757575",
          }}
        >
          TOTAL NUMBER OF VISITOR
        </Typography.Text>
      </Col>
      <Col span={13}>{visitors?.length}</Col>
      <Col span={8} offset={3}>
        <Typography.Text
          style={{
            marginTop: 10,
            fontWeight: 900,
            color: "#757575",
          }}
        >
          MALE
        </Typography.Text>
      </Col>
      <Col span={13}>
        {visitors?.filter((el) => el?.gender == "male").length}
      </Col>
      <Col span={8} offset={3}>
        <Typography.Text
          style={{
            marginTop: 10,
            fontWeight: 900,
            color: "#757575",
          }}
        >
          FEMALE
        </Typography.Text>
      </Col>
      <Col span={13}>
        {visitors?.filter((el) => el?.gender == "female").length}
      </Col>
      <Col span={12} offset={3} style={{ marginTop: 100 }}>
        <Typography.Text>Allan Balaba</Typography.Text>
        <br />
        <Typography.Text style={{ borderTop: "1px solid #000" }}>
          PDRC Warden
        </Typography.Text>
      </Col>
      {/* <Col span={9} style={{ marginTop: 100 }}>
        <Typography.Text>Coleen C. Ambos</Typography.Text>
        <br />
        <Typography.Text style={{ borderTop: "1px solid #000" }}>
          Municipal Agriculturist
        </Typography.Text>
      </Col> */}
    </Row>
  );

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
        params: {
          mode: "fetch-all",
          search: _searchName,
          startDate: dateFilter[0]?.toDate(),
          endDate: dateFilter[1]?.toDate(),
        },
      });
      if (data.status == 200) setVisitors(data.visitor);
      setLoad("");
    };
    fetchVisitor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  useEffect(() => {
    (async () => {
      let { data } = await axios.get("/api/etc", {
        params: {
          mode: "get-region",
        },
      });

      if (data.status == 200) setRegionObj(data.data);
      else message.error(data.message);
    })();
  }, []);

  return (
    <PageHeader title="Visitors Profiles">
      {contextHolder}
      <InvisibleTimer />
      <Card>
        <Space
          style={{
            marginBottom: 5,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Button
              onClick={() => setShowAddVisitor(true)}
              icon={<UserAddOutlined />}
              style={{ marginRight: 5 }}
            >
              New Visitor
            </Button>
            <AutoComplete
              style={{
                width: 200,
              }}
              loading={loading}
              placeholder="Search by Name"
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
            />
          </div>
          <DatePicker.RangePicker
            onCalendarChange={(e) => {
              try {
                if (e[0] != null && e[1] != null) {
                  setDateFilter(e);
                  setTrigger(trigger + 1);
                }
              } catch {
                setDateFilter([]);
                setTrigger(trigger + 1);
              }
            }}
          />
        </Space>
        <Table
          dataSource={visitors}
          footer={() => (
            <Typography.Text>Total: {visitors?.length ?? 0}</Typography.Text>
          )}
          columns={column}
          onRow={(data) => {
            return { onClick: () => setOpenProfile({ show: true, data }) };
          }}
          rowKey={(row) => row._id}
          loading={load == "fetch"}
          // rowClassName={(row) => console.log(row)}
        />
      </Card>

      <AddVisitor
        regionObj={regionObj}
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
        regionObj={regionObj}
      />
      <Profiler
        openModal={openProfile.show}
        setOpenModal={setOpenProfile}
        data={openProfile.data}
        refresh={setTrigger}
      />
      <VisitForm
        open={openVisitForm.show}
        close={() => setOpenVisitForm({ show: false, data: null })}
        data={openVisitForm.data}
        setTrigger={setTrigger}
      />
    </PageHeader>
  );
};

export default VisitorPage;
