import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Typography,
  Space,
  AutoComplete,
  DatePicker,
  Modal,
  Tag,
  PageHeader,
  Card,
  Button,
  Row,
  Col,
  Drawer,
  Image,
} from "antd";
import axios from "axios";
import moment from "moment";
import { useReactToPrint } from "react-to-print";

class PDF extends React.Component {
  render() {
    return { ...this.props.children };
  }
}

const VisitorLog = () => {
  const [recentVisit, setRecentVisit] = useState([]);
  const [trigger, setTrigger] = useState(0);
  const [loader, setLoader] = useState(false);
  const timerRef = useRef(null);
  const ref = useState();
  const [viewLog, setViewLog] = useState({ show: false, data: null });
  const [openPrintDrawer, setOpenPrintDrawer] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => ref.current,
  });

  const column2 = [
    {
      title: "Visitor Name",
      width: 300,
      render: (_, row) => (
        <Typography>
          {row?.user?.name}
          {row?.user?.middlename
            ? ` ${row?.user.middlename[0].toUpperCase()}.`
            : ""}{" "}
          {row?.user?.lastname}
        </Typography>
      ),
    },
    {
      title: "Visitee Name",
      width: 200,
      render: (_, row) => row?.prisonerName,
    },
    {
      title: "Date",
      width: 200,
      render: (_, row) => moment(row?.date).format("MMM DD, YYYY"),
    },
    {
      title: "Check In",
      width: 200,
      render: (_, row) => moment(row?.timeIn).format("hh:mm a"),
    },
    {
      title: "Expected Check Out",
      width: 200,
      align: "center",
      render: (_, row) => moment(row?.timeOut).format("hh:mm a"),
    },
    {
      title: "Checked out",
      width: 200,
      render: (_, row) =>
        row?.timeOutTimeAfterDone ? (
          moment(row?.timeOutTimeAfterDone).format("hh:mm a")
        ) : (
          <Typography.Text type="secondary" italic>
            Not yet
          </Typography.Text>
        ),
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
            Visit Logs
          </Typography.Text>
        </Space>
      </Col>
      <Col span={7}>
        <Row justify="space-around">
          <Col>
            <Image preview={false} src="/pdrc-logo.png" width={150} />
          </Col>
        </Row>
      </Col>
      <Col span={22} offset={1}>
        <Table columns={column2} dataSource={recentVisit} pagination={false} />
      </Col>
      <Col span={8} offset={3}>
        <Typography.Text
          style={{
            marginTop: 10,
            fontWeight: 900,
            color: "#757575",
          }}
        >
          TOTAL NUMBER OF VISIT
        </Typography.Text>
      </Col>
      <Col span={13}>{recentVisit?.length}</Col>

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
      let { data } = await axios.get("/api/visit", {
        params: {
          mode: "search-visit",
          searchKeyword: keyword,
        },
      });
      if (data.status == 200) {
        setRecentVisit(data.searchData);
        setLoader(false);
      }
    }
  };

  const runTimer = (key) => {
    setLoader(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(function () {
      searchName(key);
    }, 500);
  };

  const handleCalendarChange = async (e) => {
    let startDate = moment("01/01/1990").format("MM/DD/YYYY");
    let endDate = moment().format("MM/DD/YYYY");

    if (e?.length > 0) {
      if (e[0] != null) startDate = moment(e[0]).format("MM/DD/YYYY");
      if (e[1] != null)
        endDate = moment(e[1]).add(1, "days").format("MM/DD/YYYY");
    }

    let { data } = await axios.get("/api/visit", {
      params: { mode: "filter-date", startDate, endDate },
    });
    if (data.status == 200) setRecentVisit(data.data);
  };

  const checkItemStatus = (item) => {
    if (item.status?.length > 0) {
      item.status.forEach((e) => {
        if (e == "DISPOSED") return "DISPOSED";
      });
    } else return item.claimed ? "CLAIMED" : "UNCLAIMED";
  };

  useEffect(() => {
    (async () => {
      let res = await axios.get("/api/visit", {
        params: { mode: "fetch-recent" },
      });
      if (res.data.status == 200) setRecentVisit(res.data.data);
    })();
  }, [trigger]);

  return (
    <>
      <Drawer
        open={openPrintDrawer}
        onClose={() => setOpenPrintDrawer(false)}
        title="Print Preview"
        placement="bottom"
        height="100%"
        extra={[
          <Button onClick={handlePrint} key="log1">
            PRINT
          </Button>,
        ]}
      >
        <PDF ref={ref}>
          <CustomTable />
        </PDF>
      </Drawer>
      <PageHeader
        title="Visit Logs"
        extra={[
          <Button onClick={() => setOpenPrintDrawer(true)} key="log2">
            Print Visit Logs
          </Button>,
        ]}
      >
        <Modal
          footer={null}
          closable={false}
          open={viewLog.show}
          onCancel={() => setViewLog({ show: false, data: null })}
          style={{ top: 30 }}
        >
          <Space direction="vertical">
            <Space>
              Visitor name:{" "}
              <strong>
                {viewLog.data?.user.name}
                {viewLog.data?.user.middlename
                  ? " " + viewLog.data?.user.middlename
                  : ""}{" "}
                {viewLog.data?.user.lastname}
              </strong>
            </Space>
            <Space>
              Visitee name: <strong>{viewLog.data?.prisonerName}</strong>
            </Space>
            <Space>
              Date visited:{" "}
              <strong>
                {moment(viewLog.data?.timeIn).format("MMMM DD, YYYY")}
              </strong>
            </Space>
            <Space>
              Time Checked In:{" "}
              <strong> {moment(viewLog.data?.timeIn).format("hh:mm a")}</strong>
            </Space>
            <Space>
              Expected Checkout:{" "}
              <>
                <strong>
                  {moment(viewLog.data?.timeOut).format("hh:mm a")}
                </strong>
                {moment
                  .duration(
                    moment(viewLog.data?.timeOutTimeAfterDone).diff(
                      moment(viewLog.data?.timeOut)
                    )
                  )
                  .asSeconds() > 0 ? (
                  ""
                ) : viewLog.data?.timeOutTimeAfterDone != null ||
                  viewLog.data?.timeOutTimeAfterDone != undefined ? (
                  <Tag>
                    check-out early @{" "}
                    {moment(viewLog.data?.timeOutTimeAfterDone).format(
                      "hh:mm a"
                    )}
                  </Tag>
                ) : (
                  ""
                )}
              </>
            </Space>
            Items:
            <Table
              locale={{ emptyText: "No desposited items" }}
              pagination={false}
              style={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 200px)",
                height: 500,
              }}
              columns={[
                {
                  title: "Name",
                  width: 200,
                  render: (_, row) => row?.name,
                },
                {
                  title: "Description",
                  width: 200,
                  render: (_, row) => row?.description,
                },
                {
                  title: "Status",
                  render: (row) => (
                    <Tag
                      color={
                        checkItemStatus(row) == "DISPOSED"
                          ? "blue"
                          : checkItemStatus(row) == "CLAIMED"
                          ? "success"
                          : "default"
                      }
                    >
                      {checkItemStatus(row)}
                    </Tag>
                  ),
                },
              ]}
              tableLayout="auto"
              dataSource={viewLog.data?.depositItems}
            />
          </Space>
        </Modal>
        <Card>
          <Space>
            <AutoComplete
              style={{
                width: 200,
              }}
              loading={loader}
              placeholder="Search by Name/ID"
              filterOption={(inputValue, option) =>
                option.value
                  ?.toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              }
              onChange={(_) => {
                runTimer(_);
                if (_?.length <= 0) {
                  setLoader(false);
                  setTrigger(trigger + 1);
                }
              }}
              autoFocus
              allowClear
            />
            Date:
            <DatePicker.RangePicker
              format="MMM DD, YYYY"
              defaultValue={[moment("01/01/1990"), moment()]}
              onCalendarChange={handleCalendarChange}
            />
          </Space>
          <Table
            columns={column2}
            dataSource={recentVisit}
            onRow={(row) => {
              return { onClick: () => setViewLog({ show: true, data: row }) };
            }}
            style={{ marginTop: 10 }}
            scroll={{ y: 450 }}
          />
        </Card>
      </PageHeader>
    </>
  );
};

export default VisitorLog;
