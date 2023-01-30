import React, { useState, useEffect } from "react";
import {
  PageHeader,
  Row,
  Col,
  Space,
  Card,
  Table,
  Typography,
  Radio,
} from "antd";
import Cards from "../Dashboard/components/cards";
import axios from "axios";
import { WarningOutlined, UserOutlined } from "@ant-design/icons";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import moment from "moment";

ChartJS.register(ArcElement, Tooltip, Legend);

const Violation = () => {
  const [total, setTotal] = useState("-");
  const [totalVisitor, setTotalVisitor] = useState(0);
  const [type, setType] = useState("pie");
  const [listViolators, setListViolators] = useState([]);
  const [loader, setLoader] = useState("");

  const column = [
    {
      title: "Full Name",
      width: 300,
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ["descend"],
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
      title: "Date",
      width: 150,
      render: (_, row) => moment(row?.createdAt).format("MMMM DD, YYYY"),
    },
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
            />
          </Col>
          <Col span={6}>
            <Radio.Group
              defaultValue="pie"
              buttonStyle="solid"
              onChange={(e) => setType(e.target.value)}
              style={{
                marginBottom: 10,
                display: "flex",
                justifyContent: "end",
              }}
              size="small"
            >
              <Radio.Button value="pie">Pie</Radio.Button>
              <Radio.Button value="card">Card</Radio.Button>
            </Radio.Group>
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
                  name="Total Violator"
                  value={total}
                />
                <Cards
                  color="rgba(0,0,255,0.5)"
                  icon={<UserOutlined />}
                  name="Total Non-Violators"
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
