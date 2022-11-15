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
import { Bar, Pie } from "react-chartjs-2";
import { Button, Card, Col, Row, Space, Typography } from "antd";
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
  let [max, setMax] = useState(10);
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

  useEffect(() => {
    (async () => {
      let { data } = await axios.get("/api/dashboard");
      const newState = [...dashbardNumericalData];
      if (data.status == 200) {
        for (let i = 0; i < data.data.length; i++) {
          if (data.data[i].count > max) setMax(Math.max(data.data[i].count));
          newState[data.data[i]._id - 1] = data.data[i].count;
          setDashbardNumericalData(newState);
        }
      }
    })();
  }, []);

  return (
    <Card>
      <Row>
        <Col span={4}>
          <Space direction="vertical">
            <Card
              title="Total Visitor"
              style={{ textAlign: "center", width: "100%" }}
            >
              1,078
            </Card>
            <Card
              title="Total Visitor this Month"
              style={{ textAlign: "center" }}
            >
              1,078
            </Card>
            <Card title="Total Visits" style={{ textAlign: "center" }}>
              1,078
            </Card>
          </Space>
        </Col>
        <Col span={19} offset={1}>
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
  );
};
