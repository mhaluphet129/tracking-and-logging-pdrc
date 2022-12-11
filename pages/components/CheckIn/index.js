import React, { useState, useEffect } from "react";
import {
  PageHeader,
  Table,
  Typography,
  Space,
  Button,
  Card,
  message,
} from "antd";
import { Timer } from "../../assets/utilities";
import axios from "axios";
import moment from "moment";

const CheckIn = () => {
  const [visitorWithTimer, setVisitorWithTimer] = useState();
  const [load, setLoad] = useState("");
  const [trigger, setTrigger] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dismissClick, setDismmissClick] = useState({
    show: false,
    index: null,
  });

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
      title: "Checked-In Time",
      render: (_, row) => moment(row?.timeIn).fromNow(),
    },
    {
      title: "Visit Time left",
      align: "center",
      width: 200,
      render: (_, row, i) =>
        moment(row?.timeOut).diff(moment()) > 0 ? (
          <Timer
            startDate={row?.timeIn}
            endDate={row?.timeOut}
            end={() => setTrigger(trigger + 1)}
          />
        ) : dismissClick.show && dismissClick.index == i ? (
          <Space>
            <Button
              onClick={async () => {
                let res = await axios.get("/api/visit", {
                  params: { mode: "visit-out", id: row._id },
                });
                if (res.data.status == 200) {
                  setDismmissClick({ show: false, index: null });
                  setTrigger(trigger + 1);
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

  useEffect(() => {
    (async () => {
      setSelectedRowKeys([]);
      setLoad("fetch");
      let res = await axios.get("/api/visit", {
        params: { mode: "visit-with-timers" },
      });
      if (res.data.status == 200) setVisitorWithTimer(res.data.data);
      setLoad("");
    })();
  }, [trigger]);

  return (
    <PageHeader title="Visit Time">
      <Card>
        <Space style={{ marginBottom: 5 }}>
          <Button
            type="primary"
            onClick={() => {
              if (selectedRowKeys.length == 0)
                setSelectedRowKeys(visitorWithTimer.map((e) => e?._id));
              else setSelectedRowKeys([]);
            }}
          >
            {selectedRowKeys?.length > 0 ? "Unselect All" : "Select All"}
          </Button>
          <Button
            disabled={selectedRowKeys?.length == 0}
            onClick={async () => {
              setLoad("fetch");
              let { data } = await axios.get("/api/visit", {
                params: {
                  mode: "visit-out-many",
                  ids: JSON.stringify(selectedRowKeys),
                },
              });

              if (data.status == 200) {
                message.success(data?.message);
                setTrigger(trigger + 1);
              }
              setLoad("");
            }}
          >
            Check Out
          </Button>
        </Space>
        <Table
          dataSource={visitorWithTimer}
          columns={column2}
          rowKey={(row) => row._id}
          pagination={false}
          loading={load == "fetch"}
          scroll={{
            y: 500,
          }}
          rowClassName={(row) => {
            if (!row?.timeOutDone) {
              if (
                moment
                  .duration(moment(row?.timeOut).diff(moment(moment())))
                  .asSeconds() > 0
              )
                return "green-status";
              else return "red-status";
            }
          }}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onSelect: (i) => {
              if (selectedRowKeys?.includes(i?._id)) {
                setSelectedRowKeys((e) => e.filter((_) => _ != i?._id));
              } else setSelectedRowKeys((e) => [...e, i?._id]);
            },
          }}
          bordered
        />
      </Card>
    </PageHeader>
  );
};

export default CheckIn;
