import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Card, Col, Row, Segmented, Space } from "antd";
import { Line, Pie } from "react-chartjs-2";
import {
  UserOutlined,
  ImportOutlined,
  BlockOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import Cards from "./components/cards";
import jayson from "../../assets/json/index.json";
import axios from "axios";
import { InvisibleTimer } from "../../assets/utilities";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
);

const Dashboard = () => {
  let [dashbardNumericalData, setDashbardNumericalData] = useState(
    Array(12).fill(0)
  );

  let [max, setMax] = useState(10);

  const [cardData, setCardData] = useState({
    totalVisitor: 0,
    totalVisit: 0,
    totalVisitMonth: 0,
  });
  const [pieData, setPieData] = useState({
    total: "-",
    unclaimed: 0,
    claimed: 0,
  });

  const options = {
    responsive: true,

    scale: {
      ticks: {
        precision: 0,
      },
    },
    plugins: {
      title: {
        display: true,
        text:
          "Visitor Analytical Display/Dashboard - " + new Date().getFullYear(),
      },
      legend: {
        position: "bottom",
      },
    },
    scales: {
      y: {
        min: 0,
        max,
      },
    },
  };

  const [filter, setFilter] = useState("Monthly");
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    (async () => {
      let { data } = await axios.get("/api/dashboard", {
        params: {
          filter,
        },
      });
      const newState = [...dashbardNumericalData];

      if (data.status == 200) {
        if (filter == "Monthly") {
          for (let i = 0; i < data.data?.graphValue.length; i++) {
            if (data.data?.graphValue[i].count > max)
              setMax(Math.ceil(data.data?.graphValue[i].count / 10) * 10);
            newState[data.data?.graphValue[i]._id - 1] =
              data.data?.graphValue[i].count;
            setDashbardNumericalData(newState);
          }
          setCardData({
            totalVisitor: data.data?.totalVisitor,
            totalVisit: data.data?.totalVisit,
            totalVisitMonth: data.data?.totalVisitMonth,
          });
          setPieData({
            total: data?.data?.items?.length,
            claimed: data?.data?.items?.filter((e) => e?.claimed)?.length,
            unclaimed: data?.data?.items?.filter((e) => !e?.claimed)?.length,
          });
        } else if (filter == "Daily") {
          for (let i = 0; i < data.data?.graphValue.length; i++) {
            if (data.data?.graphValue[i].count > max)
              setMax(Math.ceil(data.data?.graphValue[i].count / 10) * 10);
            setDashbardNumericalData(() => {
              let _ = Array(24).fill(0);

              data.data?.graphValue?.forEach((__, i) => {
                _[__._id] = __.count;
              });
              return _;
            });
          }
          setCardData({
            totalVisitor: data.data?.totalVisitor,
            totalVisit: data.data?.totalVisit,
            totalVisitMonth: data.data?.totalVisitMonth,
          });
          setPieData({
            total: data?.data?.items?.length,
            claimed: data?.data?.items?.filter((e) => e?.claimed)?.length,
            unclaimed: data?.data?.items?.filter((e) => !e?.claimed)?.length,
          });
        } else if (filter == "Yearly") {
          for (let i = 0; i < data.data?.graphValue.length; i++) {
            if (data.data?.graphValue[i].count > max)
              setMax(Math.ceil(data.data?.graphValue[i].count / 10) * 10);
            setDashbardNumericalData(() => {
              let _ = Array(10).fill(0);

              data.data?.graphValue?.forEach((__, i) => {
                _[__._id - 2023] = __.count;
              });
              return _;
            });
          }
          setCardData({
            totalVisitor: data.data?.totalVisitor,
            totalVisit: data.data?.totalVisit,
            totalVisitMonth: data.data?.totalVisitMonth,
          });
          setPieData({
            total: data?.data?.items?.length,
            claimed: data?.data?.items?.filter((e) => e?.claimed)?.length,
            unclaimed: data?.data?.items?.filter((e) => !e?.claimed)?.length,
          });
        }
      }
    })();
  }, [trigger]);

  return (
    <>
      <InvisibleTimer />
      <Card>
        <Row>
          <Col span={24}>
            <Segmented
              defaultValue={filter}
              value={filter}
              options={["Daily", "Monthly", "Yearly"]}
              style={{ marginBottom: 5, marginLeft: -10 }}
              onChange={(e) => {
                setFilter(e);
                setMax(0);
                setTrigger(trigger + 1);
              }}
            />
            <Row gutter={[16, 16]}>
              <Space
                style={{
                  maxWidth: 1200,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
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
                  name={`Visit ${
                    filter == "Monthly"
                      ? " This Month"
                      : filter == "Daily"
                      ? "Today"
                      : "This Year"
                  }`}
                  value={cardData.totalVisitMonth}
                />
                <Cards
                  name="Total Deposited Items"
                  color="blue"
                  icon={<BlockOutlined />}
                  value={pieData.total}
                />
                <div>
                  <div style={{ width: 200 }}>
                    <Pie
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "bottom",
                          },
                        },
                      }}
                      data={{
                        labels: ["Total Claimed", "Total Unclaimed"],
                        datasets: [
                          {
                            data: [pieData.claimed, pieData.unclaimed],
                            backgroundColor: [
                              "rgba(54, 162, 235, 1)",
                              "rgba(54, 162, 235, 0.2)",
                            ],
                            borderColor: [
                              "rgba(54, 162, 235, 1)",
                              "rgba(54, 162, 235, 1)",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </Space>

              <Col span={20}>
                <Line
                  options={options}
                  data={{
                    labels:
                      filter == "Monthly"
                        ? jayson.months
                        : filter == "Daily"
                        ? Array.from({ length: 24 }, (_, i) => {
                            if (i < 11) return i + 1 + "AM";
                            else if (i == 11) return i + 1 + "PM";
                            else if (i == 23) return "12AM";
                            else return i - 11 + "PM";
                          })
                        : Array.from({ length: 10 }, (_, i) => 2023 + i),
                    datasets: [
                      {
                        label: "Total visit",
                        borderColor: "rgb(53, 162, 235)",
                        backgroundColor: "rgba(53, 162, 235, 0.5)",
                        data: dashbardNumericalData,
                      },
                    ],
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default Dashboard;
