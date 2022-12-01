import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Typography,
  Table,
  notification,
  PageHeader,
} from "antd";
import { Bar } from "react-chartjs-2";
import { Timer, Profiler } from "../../assets/utilities";
import {
  WarningOutlined,
  UserOutlined,
  ImportOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import Cards from "./components/cards";
import jayson from "../../assets/json/index.json";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default () => {
  let [dashbardNumericalData, setDashbardNumericalData] = useState(
    Array(12).fill(0)
  );
  const [visitorWithTimer, setVisitorWithTimer] = useState();
  let [max, setMax] = useState(10);
  const [api, contextHolder] = notification.useNotification();
  const [openProfile, setOpenProfile] = useState({ show: false, data: null });
  const [cardData, setCardData] = useState({
    totalVisitor: 0,
    totalVisit: 0,
    totalVisitMonth: 0,
  });

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Visitor Analytical Display/Dashboard - 2022",
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        min: 0,
        max,
      },
    },
  };

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
      render: (_, row) => (
        <Timer
          endDate={row?.timeOut}
          end={() => {
            api["warning"]({
              key: row?._id,
              icon: <WarningOutlined style={{ color: "red" }} />,
              description: (
                <span>
                  {row?.visitorId.name}
                  {row?.visitorId.middlename
                    ? " " + row?.visitorId.middlename
                    : ""}{" "}
                  {row.visitorId.lastname} exceed visit duration.
                  <br />
                  <Typography.Link
                    onClick={async () => {
                      let { data } = await axios.get("/api/visitor", {
                        params: {
                          mode: "get-visitor",
                          id: row?.visitorId?._id,
                        },
                      });

                      if (data.status == 200) {
                        setOpenProfile({ show: true, data: data.data });
                        notification.close(row?._id);
                      }
                    }}
                  >
                    Click here
                  </Typography.Link>
                </span>
              ),
              duration: 0,
            });
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      let { data } = await axios.get("/api/dashboard");
      const newState = [...dashbardNumericalData];

      if (data.status == 200) {
        for (let i = 0; i < data.data?.graphValue.length; i++) {
          if (data.data?.graphValue[i].count > max)
            setMax(Math.max(data.data?.graphValue[i].count));
          newState[data.data?.graphValue[i]._id - 1] =
            data.data?.graphValue[i].count;
          setDashbardNumericalData(newState);
        }
        setCardData({
          totalVisitor: data.data?.totalVisitor,
          totalVisit: data.data?.totalVisit,
          totalVisitMonth: data.data?.totalVisitMonth,
        });
      }
    })();
  }, []);

  //suck it

  useEffect(async () => {
    let res = await axios.get("/api/visit", {
      params: { mode: "visit-with-timers" },
    });
    if (res.data.status == 200) setVisitorWithTimer(res.data.data);
  }, []);

  return (
    <PageHeader title="Dashboard" extra={[<Button>PRINT</Button>]}>
      <Profiler
        openModal={openProfile.show}
        setOpenModal={() => setOpenProfile({ show: false, data: null })}
        data={openProfile.data}
      />
      <Card>
        {contextHolder}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Cards
                color="cyan"
                icon={<UserOutlined />}
                name="Total Visitor"
                value={cardData.totalVisitor}
              />
              <Cards
                color="orange"
                icon={<ImportOutlined />}
                name="Total Visits"
                value={cardData.totalVisit}
              />
              <Cards
                color="green"
                icon={<CalendarOutlined />}
                name="Visit This Month"
                value={cardData.totalVisitMonth}
              />
            </Space>
          </Col>
          <Col span={17} offset={1} style={{ marginTop: 15 }}>
            <Space align="end">
              <Button disabled>DAILY</Button>
              <Button disabled>MONTHLY</Button>
            </Space>
            <Bar
              options={options}
              data={{
                labels: jayson.months,
                datasets: [
                  {
                    label: "Total visit",
                    backgroundColor: "rgb(255, 99, 132)",
                    borderColor: "rgb(255, 99, 132)",
                    data: dashbardNumericalData,
                  },
                ],
              }}
            />
          </Col>
        </Row>
      </Card>
      <div style={{ display: "none" }}>
        <Table
          dataSource={visitorWithTimer}
          columns={column2}
          rowKey={(row) => row._id}
          pagination={{
            pageSize: 8,
          }}
        />
      </div>
    </PageHeader>
  );
};
