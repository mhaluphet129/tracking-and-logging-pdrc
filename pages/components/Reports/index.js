import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import moment from "moment";
import {
  // PageHeader,
  Card,
  Button,
  Drawer,
  Row,
  Col,
  Image,
  Space,
  Typography,
  Table,
  Checkbox,
  DatePicker,
  message,
} from "antd";
import { autoCap } from "../../assets/utilities";

class PDF extends React.Component {
  render() {
    return { ...this.props.children };
  }
}

const TableDataParser2 = (data) => {
  let _data = [];
  for (let i = 0; i < data?.length; i++)
    _data.push({
      row1: `${autoCap(data[i].user?.name)}${
        data[i]?.user?.middlename
          ? ` ${data[i]?.user.middlename[0].toUpperCase()}.`
          : ""
      } ${autoCap(data[i]?.user?.lastname)}`,
      row2: autoCap(data[i]?.prisonerName),
      row3: data[i]?.date,
      row4: data[i]?.timeIn,
      row5: data[i]?.timeOut,
      row6: data[i]?.timeOutTimeAfterDone
        ? data[i]?.timeOutTimeAfterDone
        : "Not yet",
    });
  return _data;
};

const Report = () => {
  const [openPrintDrawer, setOpenPrintDrawer] = useState(false);
  const [openPrintDrawer2, setOpenPrintDrawer2] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [recentVisit, setRecentVisit] = useState([]);
  const ref = useRef();
  const ref2 = useRef();
  const [reportData, setReportData] = useState({
    titleData: {},
    footerData: {},
    tableData: [],
    imageData: {},
  });
  const handlePrint = useReactToPrint({
    content: () => ref.current,
  });

  const handlePrint2 = useReactToPrint({
    content: () => ref2.current,
  });

  const updateReportData = (mode) => {
    if (mode == "2") {
      setReportData({
        titleData: {
          title1: "Republic of the Philippines",
          title2: "Malaybalay",
          title3: "PROVINCE OF BUKIDNON",
          title4: "Provincial Detention and Rehabilitation Center",
          title5: "Visit Logs",
        },
        footerData: {
          labels: [
            {
              label: "TOTAL NUMBER OF VISIT",
              value: recentVisit.length,
            },
          ],
          signature: {
            left: {
              name: "Allan Balaba",
              position: "PDRC Warden",
            },
          },
        },
        tableData: {
          tableHeader: {
            header1: "Visitor Name",
            header2: "Visitee Name",
            header3: "Date",
            header4: "Check In",
            header5: "Expected Check Out",
            header6: "Checked out",
          },
          data: TableDataParser2(recentVisit),
        },
      });
    }
  };

  const printColumn1 = [
    {
      title: "Name",
      width: 150,
      render: (_, row) => (
        <Typography style={{ paddingLeft: 10 }}>
          {autoCap(row.name)}
          {row?.middlename
            ? " " + `${row?.middlename[0].toUpperCase()}.`
            : ""}{" "}
          {autoCap(row.lastname)}
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
      width: 350,
      render: (_, row) => (
        <Typography style={{ paddingLeft: 10 }}>
          {row.citymunicipalities.name}, {row?.province.name} <br />
          {row?.region.name}
        </Typography>
      ),
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
      title: (
        <Typography.Text
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              setReportData((_) => {
                return {
                  ..._,
                  tableData: {
                    ..._.tableData,
                    tableHeader: { ..._.tableData?.tableHeader, header1: e },
                  },
                };
              });
            },
          }}
        >
          {reportData.tableData?.tableHeader?.header1}
        </Typography.Text>
      ),
      width: 300,
      render: (_, row, index) => (
        <Typography.Text
          style={{ paddingLeft: 10 }}
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              let arr = reportData.tableData?.data;
              arr[index].row1 = e;
              setReportData((_) => {
                return {
                  ..._,
                  tableData: {
                    ..._.tableData,
                    data: arr,
                  },
                };
              });
            },
          }}
        >
          {row?.row1}
        </Typography.Text>
      ),
    },
    {
      align: "center",
      title: (
        <Typography.Text
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              setReportData((_) => {
                return {
                  ..._,
                  tableData: {
                    ..._.tableData,
                    tableHeader: { ..._.tableData?.tableHeader, header2: e },
                  },
                };
              });
            },
          }}
        >
          {reportData.tableData?.tableHeader?.header2}
        </Typography.Text>
      ),
      width: 200,
      render: (_, row, index) => (
        <Typography.Text
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              let arr = reportData.tableData?.data;
              arr[index].row2 = e;
              setReportData((_) => {
                return {
                  ..._,
                  tableData: {
                    ..._.tableData,
                    data: arr,
                  },
                };
              });
            },
          }}
        >
          {row?.row2}
        </Typography.Text>
      ),
    },
    {
      title: (
        <Typography.Text
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              setReportData((_) => {
                return {
                  ..._,
                  tableData: {
                    ..._.tableData,
                    tableHeader: { ..._.tableData?.tableHeader, header3: e },
                  },
                };
              });
            },
          }}
        >
          {reportData.tableData?.tableHeader?.header3}
        </Typography.Text>
      ),
      width: 200,
      render: (_, row, index) =>
        editMode ? (
          <Typography.Link>
            <DatePicker
              defaultValue={moment(row?.row3)}
              format="MMM DD, YYYY"
              onChange={(e) => {
                let arr = reportData.tableData?.data;
                arr[index].row3 = moment(e).format("MMM DD, YYYY");
                setReportData((_) => {
                  return {
                    ..._,
                    tableData: {
                      ..._.tableData,
                      data: arr,
                    },
                  };
                });
              }}
            />
          </Typography.Link>
        ) : (
          <Typography.Text style={{ paddingLeft: 10 }}>
            {moment(row?.row3).format("MMM DD, YYYY")}
          </Typography.Text>
        ),
    },
    {
      title: (
        <Typography.Text
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              setReportData((_) => {
                return {
                  ..._,
                  tableData: {
                    ..._.tableData,
                    tableHeader: { ..._.tableData?.tableHeader, header4: e },
                  },
                };
              });
            },
          }}
        >
          {reportData.tableData?.tableHeader?.header4}
        </Typography.Text>
      ),
      width: 200,
      render: (_, row, index) =>
        editMode ? (
          <Typography.Link>
            <DatePicker.TimePicker
              defaultValue={moment(row?.row4)}
              format="hh:mm a"
              onChange={(e) => {
                let arr = reportData.tableData?.data;
                arr[index].row4 = moment(e);
                setReportData((_) => {
                  return {
                    ..._,
                    tableData: {
                      ..._.tableData,
                      data: arr,
                    },
                  };
                });
              }}
            />
          </Typography.Link>
        ) : (
          <Typography.Text style={{ paddingLeft: 10 }}>
            {moment(row?.row4).format("hh:mm a")}
          </Typography.Text>
        ),
    },
    {
      title: (
        <Typography.Text
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              setReportData((_) => {
                return {
                  ..._,
                  tableData: {
                    ..._.tableData,
                    tableHeader: { ..._.tableData?.tableHeader, header5: e },
                  },
                };
              });
            },
          }}
        >
          {reportData.tableData?.tableHeader?.header5}
        </Typography.Text>
      ),
      width: 200,
      align: "center",
      render: (_, row, index) =>
        editMode ? (
          <Typography.Link>
            <DatePicker.TimePicker
              defaultValue={moment(row?.row5)}
              format="hh:mm a"
              onChange={(e) => {
                let arr = reportData.tableData?.data;
                arr[index].row5 = moment(e);
                setReportData((_) => {
                  return {
                    ..._,
                    tableData: {
                      ..._.tableData,
                      data: arr,
                    },
                  };
                });
              }}
            />
          </Typography.Link>
        ) : (
          <Typography.Text>
            {moment(row?.row5).format("hh:mm a")}
          </Typography.Text>
        ),
    },
    {
      align: "center",
      title: (
        <Typography.Text
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              setReportData((_) => {
                return {
                  ..._,
                  tableData: {
                    ..._.tableData,
                    tableHeader: { ..._.tableData?.tableHeader, header6: e },
                  },
                };
              });
            },
          }}
        >
          {reportData.tableData?.tableHeader?.header6}
        </Typography.Text>
      ),
      width: 200,
      render: (_, row, index) =>
        editMode ? (
          <Typography.Text type="secondary" italic>
            {row?.row6 != "Not yet" ? (
              <DatePicker.TimePicker
                defaultValue={moment(row?.row6)}
                format="hh:mm a"
                onChange={(e) => {
                  let arr = reportData.tableData?.data;
                  arr[index].row6 = moment(e);
                  setReportData((_) => {
                    return {
                      ..._,
                      tableData: {
                        ..._.tableData,
                        data: arr,
                      },
                    };
                  });
                }}
              />
            ) : (
              "Not applicable"
            )}
          </Typography.Text>
        ) : moment(row?.row6).format("hh:mm a") != "Invalid date" ? (
          <Typography.Text>
            {moment(row?.row6).format("hh:mm a")}
          </Typography.Text>
        ) : (
          <Typography.Text>{row?.row6}</Typography.Text>
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
              src="/pdrc-logo.png"
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
              src="/pdrc-logo2.png"
              alt="logo"
              width={150}
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
          className="myTable"
          rowClassName="custom-table"
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
              src="/pdrc-logo.png"
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
          <Typography.Text
            style={{ color: "#757575" }}
            editable={{
              triggerType: editMode ? ["icon", "text"] : [],
              icon: editMode ? false : <></>,
              onChange: (e) => {
                setReportData((_) => {
                  return { ..._, titleData: { ..._.titleData, title1: e } };
                });
              },
            }}
          >
            {reportData.titleData?.title1}
          </Typography.Text>
          <Typography.Text
            style={{ color: "#757575" }}
            editable={{
              triggerType: editMode ? ["icon", "text"] : [],
              icon: editMode ? false : <></>,
              onChange: (e) => {
                setReportData((_) => {
                  return { ..._, titleData: { ..._.titleData, title2: e } };
                });
              },
            }}
          >
            {reportData.titleData?.title2}
          </Typography.Text>
          <Typography.Text
            style={{ marginBottom: 10, color: "#757575" }}
            editable={{
              triggerType: editMode ? ["icon", "text"] : [],
              icon: editMode ? false : <></>,
              onChange: (e) => {
                setReportData((_) => {
                  return { ..._, titleData: { ..._.titleData, title3: e } };
                });
              },
            }}
          >
            {reportData.titleData?.title3}
          </Typography.Text>
          <Typography.Text
            style={{ marginBottom: 15, color: "#757575", fontSize: 12 }}
            editable={{
              triggerType: editMode ? ["icon", "text"] : [],
              icon: editMode ? false : <></>,
              onChange: (e) => {
                setReportData((_) => {
                  return { ..._, titleData: { ..._.titleData, title4: e } };
                });
              },
            }}
          >
            {reportData.titleData?.title4}
          </Typography.Text>
          <Typography.Text
            style={{
              marginBottom: 20,
              fontWeight: 900,
              color: "#000",
              fontSize: "1.5em",
            }}
            editable={{
              triggerType: editMode ? ["icon", "text"] : [],
              icon: editMode ? false : <></>,
              onChange: (e) => {
                setReportData((_) => {
                  return { ..._, titleData: { ..._.titleData, title5: e } };
                });
              },
            }}
          >
            {reportData.titleData?.title5}
          </Typography.Text>
        </Space>
      </Col>
      <Col span={7}>
        <Row justify="space-around">
          <Col>
            <Image
              preview={false}
              src="/pdrc-logo2.png"
              width={150}
              alt="image 1"
            />
          </Col>
        </Row>
      </Col>
      <Col span={22} offset={1}>
        <Table
          columns={printColumn2}
          dataSource={reportData.tableData?.data}
          pagination={false}
          className="myTable"
          rowClassName="custom-table"
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
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              let arr = reportData.footerData?.labels;
              arr[0].label = e;
              setReportData((_) => {
                return {
                  ..._,
                  footerData: {
                    ..._.footerData,
                    labels: arr,
                  },
                };
              });
            },
          }}
        >
          {reportData.footerData?.labels[0].label}
        </Typography.Text>
      </Col>
      <Col span={13}>
        <Typography.Text>
          {reportData.footerData?.labels[0].value}
        </Typography.Text>
      </Col>

      <Col span={12} offset={3} style={{ marginTop: 100 }}>
        <Typography.Text
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              setReportData((_) => {
                return {
                  ..._,
                  footerData: {
                    ..._.footerData,
                    signature: {
                      ..._.footerData.signature,
                      left: {
                        position:
                          reportData.footerData?.signature.left.position,
                        name: e,
                      },
                    },
                  },
                };
              });
            },
          }}
        >
          {reportData.footerData?.signature.left.name}
        </Typography.Text>
        <br />
        <Typography.Text
          style={{ borderTop: "1px solid #000" }}
          editable={{
            triggerType: editMode ? ["icon", "text"] : [],
            icon: editMode ? false : <></>,
            onChange: (e) => {
              setReportData((_) => {
                return {
                  ..._,
                  footerData: {
                    ..._.footerData,
                    signature: {
                      ..._.footerData.signature,
                      left: {
                        name: reportData.footerData?.signature.left.name,
                        position: e,
                      },
                    },
                  },
                };
              });
            },
          }}
        >
          {reportData.footerData?.signature.left.position}
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
    <>
      {/* <PageHeader title="Report"> */}
      <Drawer
        open={openPrintDrawer2}
        onClose={() => {
          setOpenPrintDrawer2(false);
          setEditMode(false);
        }}
        title="Print Preview"
        placement="bottom"
        height="100%"
        extra={[
          <Space key="1">
            <Checkbox
              style={{ width: 100 }}
              checked={editMode}
              onChange={(e) => {
                setEditMode(e.target.checked);
              }}
            >
              Edit Mode
            </Checkbox>
            <Button
              onClick={() => {
                if (editMode) {
                  message.warning(
                    "Please turn off the edit mode before printing."
                  );
                  return;
                }
                handlePrint2();
              }}
              key="log1"
            >
              PRINT
            </Button>
          </Space>,
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
            onClick={() => {
              setOpenPrintDrawer2(true);
              updateReportData("2");
            }}
            style={{ width: 200 }}
            key="log2"
          >
            Print Visit Logs
          </Button>
        </Space>
      </Card>
      {/* </PageHeader> */}
    </>
  );
};

export default Report;
