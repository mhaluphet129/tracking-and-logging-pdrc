import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Table,
  Typography,
  Space,
  Tooltip,
  AutoComplete,
  Col,
  Row,
  Tag,
} from "antd";
import { UserAddOutlined } from "@ant-design/icons";

import { AddVisitor, UpdateVisitor, AddHistory } from "./components";
import { IDGen } from "../../assets/utilities";
import axios from "axios";

const VisitorPage = () => {
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateVisitor, setUpdateVisitor] = useState({
    open: false,
    data: null,
  });
  const [visitors, setVisitors] = useState([]);
  const [trigger, setTrigger] = useState(0);
  const [_searchName, setSearchName] = useState("");
  const timerRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const [load, setLoad] = useState("");

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
      render: (_, row) => (
        <Typography>
          {row.name}
          {row?.middlename ? " " + row?.middlename : ""} {row.lastname}
        </Typography>
      ),
    },
    {
      title: "Age",
      width: 50,
      render: (_, row) => <Typography>{row.age}</Typography>,
    },
    {
      title: "Address",
      align: "center",
      render: (_, row) => <Typography>{row.address}</Typography>,
    },
    {
      title: "Gender",
      width: 150,
      align: "center",
      render: (_, row) => <Typography>{row?.gender}</Typography>,
    },
  ];

  const column2 = [
    {
      title: "ID",
      render: (_, row) => <Typography.Link>6323adse</Typography.Link>,
    },
    {
      title: "Name",
      render: (_, row) => (
        <Typography>
          {row.name}
          {row?.middlename ? " " + row?.middlename : ""} {row.lastname}
        </Typography>
      ),
    },
    {
      title: "Time",
      render: (_, row) => (
        <Typography.Text>
          <Tag color="success">IN</Tag>March 13, 2019
        </Typography.Text>
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
      setLoad("");
    };
    fetchVisitor();
  }, [trigger]);

  return (
    <div>
      <Row>
        <Col span={13}>
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
              return {
                onClick: () => setUpdateVisitor({ open: true, data }),
              };
            }}
            rowKey={(row) => row._id}
            loading={load == "fetch"}
          />
        </Col>
        <Col offset={1} span={10}>
          <Space style={{ marginBottom: 5, padding: 6 }}>
            <Typography.Text strong>Recent Visit</Typography.Text>
          </Space>
          <Table
            columns={column2}
            dataSource={[
              { name: "Ley", middlename: "middle", lastname: "last" },
            ]}
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
        updateOpen={() =>
          setUpdateVisitor((e) => {
            return { open: true, data: { ...e.data } };
          })
        }
        data={updateVisitor.data}
        refresh={() => setTrigger(trigger + 1)}
      />
      <AddHistory open={openModal} close={() => setOpenModal(false)} />
    </div>
  );
};

export default VisitorPage;
