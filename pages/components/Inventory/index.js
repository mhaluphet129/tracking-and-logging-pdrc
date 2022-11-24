import React, { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Typography,
  Table,
  PageHeader,
  AutoComplete,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [tabList, setTabList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tabKey, setTabKey] = useState("total");
  const [loader, setLoader] = useState("");
  const [trigger, setTrigger] = useState(0);

  let timerRef = useRef();

  let formalTabName = {
    total: "All",
    totalClaimed: "Claimed",
    totalUnclaimed: "Unclaimed",
    totalDisposed: "Disposed",
  };

  let _tabs = ["total", "totalClaimed", "totalUnclaimed", "totalDisposed"];

  const searchName = async (keyword) => {
    if (keyword != "" && keyword != null) {
      let { data } = await axios.get("/api/items", {
        params: {
          mode: "search-items",
          searchKeyword: keyword,
        },
      });
      if (data.status == 200) {
        setTableData(data.searchData);
        // setLoading(false);
      }
    }
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
  }, [trigger]);

  return (
    <PageHeader title="Inventory Page">
      <Row>
        <Col span={24}>
          <Card
            title={
              <AutoComplete
                style={{
                  width: 400,
                }}
                // loading={loading}
                placeholder="Search Name, Items or Description"
                onChange={(_) => {
                  runTimer(_);
                  if (_?.length <= 0) {
                    // setLoading(false);
                    setTrigger(trigger + 1);
                  }
                }}
                autoFocus
                allowClear
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
              loading={loader == "fetch"}
              pagination={{ pageSize: 8 }}
              columns={[
                {
                  title: "Name",
                  render: (_, row) => <strong>{row?.name}</strong>,
                },
                {
                  title: "Description",
                  width: 300,
                  render: (_, row) => row?.description,
                },
                {
                  title: "Deposit Date",
                  render: (_, row) =>
                    moment(row?.createdAt).format("MMMM DD, YYYY @ hh:mm a"),
                },
                {
                  title: "Owner",
                  render: (_, row) => (
                    <React.Fragment>
                      {" "}
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
                    <Typography.Link onClick={(e) => {}}>
                      <SettingOutlined />
                    </Typography.Link>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </PageHeader>
  );
};

export default Inventory;
