import React, { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Typography,
  Table,
  // PageHeader,
  AutoComplete,
  Space,
  Tag,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { IDGen } from "../../assets/utilities";
import EditItems from "./components/EditItems";
import axios from "axios";
import moment from "moment";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [tabList, setTabList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tabKey, setTabKey] = useState("total");
  const [loader, setLoader] = useState("");
  const [trigger, setTrigger] = useState(0);
  const [openEditModal, setOpenEditModal] = useState({
    show: false,
    data: null,
  });

  let timerRef = useRef();

  let formalTabName = {
    total: "All",
    totalClaimed: "Claimed",
    totalUnclaimed: "Unclaimed",
    totalDisposed: "Disposed",
  };

  let _tabs = ["total", "totalClaimed", "totalUnclaimed", "totalDisposed"];

  const searchName = async (keyword) => {
    setLoader("searching");
    if (keyword != "" && keyword != null) {
      let { data } = await axios.get("/api/items", {
        params: {
          mode: "search-items",
          searchKeyword: keyword,
        },
      });
      if (data.status == 200) {
        setTableData(data.searchData);
        setTabList(() =>
          _tabs.map((e) => {
            return {
              key: e,
              tab: (
                <Typography.Text>
                  {formalTabName[e]} <Badge count={data?.analytics[e]} />
                </Typography.Text>
              ),
            };
          })
        );
      }
    }
    setLoader("");
  };

  const runTimer = (key) => {
    // setLoading(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(function () {
      searchName(key);
    }, 500);
  };

  useEffect(() => {
    (async () => {
      setLoader("fetch");

      let { data } = await axios.get("/api/items", {
        params: {
          mode: "get-items-all",
        },
      });

      if (data.status == 200) {
        setItems(data.data?.items);
        setTableData(data.data?.items);
        setTabList(() =>
          _tabs.map((e) => {
            return {
              key: e,
              tab: (
                <Typography.Text>
                  {formalTabName[e]} <Badge count={data.data?.analytics[e]} />
                </Typography.Text>
              ),
            };
          })
        );
      }
      setLoader("");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <>
      {/* <PageHeader title="Inventory Page"> */}
      <EditItems
        open={openEditModal.show}
        close={() => setOpenEditModal({ show: false, data: null })}
        data={openEditModal.data}
        refresh={() => setTrigger(trigger + 1)}
      />
      <Row>
        <Col span={24}>
          <Card
            title={
              <AutoComplete
                style={{
                  width: 400,
                }}
                loading={loader == "searching"}
                placeholder="Search Name, Items or Description"
                onChange={(_) => {
                  runTimer(_);
                  if (_?.length <= 0) {
                    // setLoading(false);
                    setTrigger(trigger + 1);
                  }
                }}
                autoFocus
              />
            }
            style={{ width: "100%" }}
            tabList={tabList}
            activeTabKey={tabKey}
            onTabChange={(key) => {
              setTabKey(key);
              if (key == "total") {
                setTableData(items);
              } else if (key == "totalClaimed") {
                setTableData(() => items.filter((e) => e?.claimed));
              } else if (key == "totalUnclaimed") {
                setTableData(() => items.filter((e) => !e?.claimed));
              } else
                setTableData(() =>
                  items.filter((e) => e.status?.includes("DISPOSED"))
                );
            }}
          >
            <Table
              dataSource={tableData}
              footer={() => (
                <Typography.Text>
                  Total: {tableData?.length ?? 0}
                </Typography.Text>
              )}
              loading={loader == "fetch"}
              pagination={{ pageSize: 10 }}
              scroll={{ y: 400 }}
              columns={[
                {
                  title: "Tag No.",
                  render: (_, row) => "#" + IDGen(row?._id, 6),
                },
                {
                  title: "Name",
                  render: (_, row) => <strong>{row?.name}</strong>,
                },
                {
                  title: "Description",
                  width: 200,
                  render: (_, row) =>
                    row?.description != "" ? (
                      row?.description
                    ) : (
                      <Typography.Text type="secondary" italic>
                        No description
                      </Typography.Text>
                    ),
                },
                {
                  title: "Status",
                  width: 100,
                  render: (_, row) =>
                    row?.status?.length > 0 ? (
                      <Tag color="cyan">{row?.status[0]}</Tag>
                    ) : (
                      <Typography.Text type="secondary" italic>
                        No Data
                      </Typography.Text>
                    ),
                },
                {
                  title: "Deposit Date",
                  render: (_, row) =>
                    moment(row?.depositDate).format("MMMM DD, YYYY @ hh:mm a"),
                },
                {
                  title: "Owner",
                  render: (_, row) => (
                    <React.Fragment>
                      {row?.ownerId?.name}
                      {row?.ownerId?.middlename
                        ? " " + row?.ownerId.middlename
                        : ""}{" "}
                      {row?.ownerId?.lastname}
                    </React.Fragment>
                  ),
                },
                {
                  title: "Functions",
                  align: "center",
                  render: (_, row) => (
                    <Space>
                      <Typography.Link
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenEditModal({ show: true, data: row });
                        }}
                      >
                        <Tooltip title="edit">
                          <EditOutlined />
                        </Tooltip>
                      </Typography.Link>
                      <Typography.Link onClick={(e) => {}}>
                        <Popconfirm
                          title="Are you sure ?"
                          icon={null}
                          okText="Confirm"
                          onConfirm={async () => {
                            const res = await axios.get("/api/items", {
                              params: {
                                id: row?._id,
                                mode: "delete-item",
                              },
                            });

                            if (res.data.status == 200) {
                              message.success(res.data.message);
                              setTrigger(trigger + 1);
                            } else message.error(res.data.message);
                          }}
                        >
                          <Tooltip title="delete">
                            <DeleteOutlined style={{ color: "#f00" }} />
                          </Tooltip>
                        </Popconfirm>
                      </Typography.Link>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
      {/* </PageHeader> */}
    </>
  );
};

export default Inventory;
