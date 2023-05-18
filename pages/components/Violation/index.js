import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Space,
  Card,
  Table,
  Typography,
  Segmented,
  List,
  Tag,
  Badge,
} from "antd";
import Cards from "../Dashboard/components/cards";
import axios from "axios";
import {
  WarningOutlined,
  UserOutlined,
  PieChartOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import moment from "moment";
import { InvisibleTimer, autoCap } from "../../../assets/utilities";
import { PageHeader } from "@ant-design/pro-layout";

ChartJS.register(ArcElement, Tooltip, Legend);

const Violation = () => {
  const [total, setTotal] = useState("-");
  const [totalVisitor, setTotalVisitor] = useState(0);
  const [type, setType] = useState("pie");
  const [listViolators, setListViolators] = useState([]);
  const [loader, setLoader] = useState("");

  const evaluateTag = (type) => {
    switch (type) {
      case "minor": {
        return { color: "#eed202", text: "MINOR" };
      }
      case "moderate": {
        return { color: "#FF5F15", text: "MODERATE" };
      }
      case "high": {
        return { color: "#FF0000", text: "HIGH" };
      }
    }
  };

  const column = [
    {
      title: "Full Name",
      width: 300,
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ["descend"],
      render: (_, row) => (
        <Typography>
          {autoCap(row?.visitorId.name)}
          {row?.visitorId.middlename
            ? " " + autoCap(row?.visitorId.middlename)
            : ""}{" "}
          {autoCap(row.visitorId.lastname)}
        </Typography>
      ),
    },
    {
      title: "Date",
      width: 150,
      render: (_, row) => moment(row?.createdAt).format("MMMM DD, YYYY"),
    },
    Table.EXPAND_COLUMN,
  ];

  useEffect(() => {
    (async () => {
      setLoader("fetch");
      const { data } = await axios.get("/api/violation", {
        params: {
          mode: "fetch-violation-total",
        },
      });
      if (data?.status == 200) {
        setTotal(data.data?.count);
        setTotalVisitor(data.data?.totalVisitor);
        setListViolators(data.data?.list);
      }
      setLoader("");
    })();
  }, []);
  return (
    <PageHeader title="Violation">
      <InvisibleTimer />
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Typography.Title level={5}>List of Violators</Typography.Title>
            <Table
              columns={column}
              footer={() => (
                <Typography.Text>
                  Total: {listViolators?.length ?? 0}
                </Typography.Text>
              )}
              dataSource={listViolators}
              loading={loader == "fetch"}
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (row) => (
                  <List
                    dataSource={row?.remarks.filter((e) => e.hasViolation)}
                    renderItem={(e, index) => (
                      <Badge.Ribbon {...evaluateTag(e?.type)}>
                        <List.Item style={{ padding: 0 }}>
                          <Typography.Text style={{ fontWeight: 700 }}>
                            {e?.title}
                          </Typography.Text>
                          <br />
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: ".75em" }}
                          >
                            {moment(e?.createdAt).format(
                              "MMM DD, YYYY - hh:mm a"
                            )}
                          </Typography.Text>
                          <br />
                          {e?.description}
                        </List.Item>
                      </Badge.Ribbon>
                    )}
                  />
                ),
              }}
            />
          </Col>
          <Col span={6}>
            <Segmented
              options={[
                { label: "Pie", value: "pie", icon: <PieChartOutlined /> },
                { label: "Card", value: "card", icon: <BarsOutlined /> },
              ]}
              onChange={(e) => setType(e)}
            />

            {type == "pie" ? (
              <Pie
                style={{ marginTop: 10 }}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: `A Total of ${totalVisitor} visitors`,
                    },
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
                data={{
                  labels: ["Total Violators", "Total Non-Violators"],
                  datasets: [
                    {
                      data: [total, totalVisitor - total],
                      backgroundColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                      ],
                      borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
              />
            ) : (
              <Space direction="vertical">
                <Cards
                  color="rgba(255,0,0,0.5)"
                  icon={<WarningOutlined />}
                  name="Violators"
                  value={total}
                />
                <Cards
                  color="rgba(0,0,255,0.5)"
                  icon={<UserOutlined />}
                  name="Non-Violators"
                  value={totalVisitor - total}
                />
              </Space>
            )}
          </Col>
        </Row>
      </Card>
    </PageHeader>
  );
};

export default Violation;
