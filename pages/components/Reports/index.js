import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import moment from "moment";
import {
  PageHeader,
  Card,
  Button,
  Drawer,
  Row,
  Col,
  Image,
  Space,
  Typography,
  Table,
} from "antd";

class PDF extends React.Component {
  render() {
    return { ...this.props.children };
  }
}

const Report = () => {
  const [openPrintDrawer, setOpenPrintDrawer] = useState(false);
  const [openPrintDrawer2, setOpenPrintDrawer2] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [recentVisit, setRecentVisit] = useState([]);
  const ref = useRef();
  const ref2 = useRef();

  const handlePrint = useReactToPrint({
    content: () => ref.current,
  });

  const handlePrint2 = useReactToPrint({
    content: () => ref2.current,
  });

  const printColumn1 = [
    {
      title: "Name",
      width: 150,
      render: (_, row) => (
        <Typography>
          {row.name}
          {row?.middlename
            ? " " + `${row?.middlename[0].toUpperCase()}.`
            : ""}{" "}
          {row.lastname}
        </Typography>
      ),
    },
    {
      title: "Age",
      width: 1,
      align: "center",
      render: (_, row) => <Typography>{row.age}</Typography>,
    },
    {
      title: "Address",
      align: "center",
      width: 250,
      render: (_, row) => <Typography>{row.address}</Typography>,
    },
    {
      title: "Gender",
      width: 150,
      align: "center",
      render: (_, row) => <Typography>{row?.gender}</Typography>,
    },
  ];

  const printColumn2 = [
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

  const CustomTable1 = () => (
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
            Masterlist of Visitor
          </Typography.Text>
        </Space>
      </Col>
      <Col span={7}>
        <Row justify="space-around">
          <Col>
            <Image
              preview={false}
              src="/pdrc-logo.png"
              width={150}
              alt="pdrc logo"
            />
          </Col>
        </Row>
      </Col>
      <Col span={18} offset={3}>
        <Table
          dataSource={visitors}
          columns={printColumn1}
          rowKey={(row) => row._id}
          pagination={false}
          bordered
        />
      </Col>
      <Col span={8} offset={3}>
        <Typography.Text
          style={{
            marginTop: 10,
            fontWeight: 900,
            color: "#757575",
          }}
        >
          TOTAL NUMBER OF VISITOR
        </Typography.Text>
      </Col>
      <Col span={13}>{visitors?.length}</Col>
      <Col span={8} offset={3}>
        <Typography.Text
          style={{
            marginTop: 10,
            fontWeight: 900,
            color: "#757575",
          }}
        >
          MALE
        </Typography.Text>
      </Col>
      <Col span={13}>
        {visitors?.filter((el) => el?.gender == "male").length}
      </Col>
      <Col span={8} offset={3}>
        <Typography.Text
          style={{
            marginTop: 10,
            fontWeight: 900,
            color: "#757575",
          }}
        >
          FEMALE
        </Typography.Text>
      </Col>
      <Col span={13}>
        {visitors?.filter((el) => el?.gender == "female").length}
      </Col>
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

  const CustomTable2 = () => (
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
            <Image
              preview={false}
              src="/pdrc-logo.png"
              width={150}
              alt="image 1"
            />
          </Col>
        </Row>
      </Col>
      <Col span={22} offset={1}>
        <Table
          columns={printColumn2}
          dataSource={recentVisit}
          pagination={false}
          bordered
        />
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

  useEffect(() => {
    (async () => {
      let res = await axios.get("/api/visit", {
        params: { mode: "fetch-recent" },
      });
      let { data } = await axios.get("/api/visitor", {
        params: { mode: "fetch-all" },
      });
      if (data.status == 200) setVisitors(data.visitor);
      if (res.data.status == 200) setRecentVisit(res.data.data);
    })();
  }, []);
  return (
    <PageHeader title="Report">
      <Drawer
        open={openPrintDrawer2}
        onClose={() => setOpenPrintDrawer2(false)}
        title="Print Preview"
        placement="bottom"
        height="100%"
        extra={[
          <Button onClick={handlePrint2} key="log1">
            PRINT
          </Button>,
        ]}
      >
        <PDF ref={ref2}>
          <CustomTable2 />
        </PDF>
      </Drawer>
      <Drawer
        open={openPrintDrawer}
        onClose={() => setOpenPrintDrawer(false)}
        placement="bottom"
        height="100%"
        title="Print Preview"
        width="200"
        extra={[
          <Button onClick={handlePrint} key="visit1">
            PRINT
          </Button>,
        ]}
      >
        <PDF ref={ref}>
          <CustomTable1 />
        </PDF>
      </Drawer>
      <Card>
        <Space direction="vertical">
          <Button
            key="visit2"
            onClick={() => setOpenPrintDrawer(true)}
            style={{ width: 200 }}
          >
            Print Visitor List
          </Button>
          <Button
            onClick={() => setOpenPrintDrawer2(true)}
            style={{ width: 200 }}
            key="log2"
          >
            Print Visit Logs
          </Button>
        </Space>
      </Card>
    </PageHeader>
  );
};

export default Report;
