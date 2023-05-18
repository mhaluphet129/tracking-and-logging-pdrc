import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import moment from "moment";
import {
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
  Modal,
  Form,
  Select,
  Input,
  message,
  InputNumber,
  AutoComplete,
  Tooltip,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { autoCap, Floatlabel } from "../../assets/utilities";
import {
  ArrowRightOutlined,
  CloseOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

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
      row7: data[i]?.relationship || "Prefer not to say",
    });
  return _data;
};

const Report = () => {
  const [openPrintDrawer, setOpenPrintDrawer] = useState(false);
  const [openPrintDrawer2, setOpenPrintDrawer2] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [recentVisit, setRecentVisit] = useState([]);
  const [filterOpened, setFilterOpened] = useState(false);
  const [activeFilter, setActiveFilter] = useState([]);
  const [openFilterId, setOpenFilterId] = useState(0);

  const timerRef = useRef(null);

  const ref = useRef();
  const ref2 = useRef();
  const ref3 = useRef();
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

  const handlePrint3 = useReactToPrint({
    content: () => ref3.current,
  });

  let [regions, setRegion] = useState({});
  let [province, setProvince] = useState({});
  let [citymunicipalities, setCitymunicipalities] = useState([]);
  let [barangay, setBarangay] = useState("");
  let [regionObj, setRegionObj] = useState([]);
  let [filters, setFilter] = useState({
    dateRegistered: { from: null, to: null },
    gender: "",
    age: { min: 0, max: 100 },
    address: { cityId: null, provinceId: null, regionId: null, barangay: "" },
  });
  let [filters2, setFilter2] = useState({
    specificVisitorId: "",
    specificVisiteeName: "",
    checkinDateRange: { from: null, to: null },
  });
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(100);

  const [addressOpened, setAddressOpened] = useState([false, false, false]);
  const [column1Title, setColumn1Title] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState({});

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);

  const [applied, setApplied] = useState(false);

  const [openPrintDrawer3, setOpenPrintDrawer3] = useState(false);
  const [violators, setViolators] = useState();

  const generatePrint = async () => {
    if (!addressOpened[0])
      filters = {
        ...filters,
        address: {
          ...filters.address,
          provinceId: null,
          cityId: null,
          barangay: "",
        },
      };
    else if (!addressOpened[[1]]) {
      filters = {
        ...filters,
        address: {
          ...filters.address,
          cityId: null,
          barangay: "",
        },
      };
      setColumn1Title(`${province.name}, ${regions.name.split("–")[0]}`);
    } else if (!addressOpened[2]) {
      filters = {
        ...filters,
        address: {
          ...filters.address,
          barangay: "",
        },
      };
      setColumn1Title(
        `${citymunicipalities.name} - ${province.name}, ${
          regions.name.split("–")[0]
        }`
      );
    }

    await fetchVisitor("fetch-all", filters);
  };

  const generatePrint2 = async () => {
    if (activeFilter.includes("specificVisitor") && !selected) {
      setFilter2({ ...filters2, specificVisitorId: "" });
    }
    if (activeFilter.includes("specificVisitee") && !applied) {
      message.warning(
        "Please check applied before proceed. (Specific Visitee)"
      );
      return;
    }
    if (activeFilter.includes("dateChekinRange")) {
      if (
        filters2.checkinDateRange.from == null ||
        filters2.checkinDateRange.to == null
      ) {
        message.warning(
          `Please provide ${
            filters2.checkinDateRange.from == null ? "begin" : "end"
          } date for the filter otherwise remove this filter.`
        );
        return;
      }
    }
    await fetchVisitor("fetch-logs", filters2);
  };

  const fetchVisitor = async (mode, _filters) => {
    let { data } = await axios.get("/api/visitor", {
      params: { mode, filters: JSON.stringify(_filters) },
    });
    if (data.status == 200) {
      if (mode == "fetch-all") {
        setVisitors(data.visitor);
        setOpenPrintDrawer(true);
      } else {
        setRecentVisit(data.visits);
        updateReportData("2", data.visits);
        setOpenPrintDrawer2(true);
      }
    }
  };

  const fetchViolations = async () => {
    let { data } = await axios.get("/api/violation", {
      params: {
        mode: "get-violators-for-print",
      },
    });

    if (data.status == 200) {
      setViolators(data.data);
      setOpenPrintDrawer3(true);
    } else message.error(data.message);
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

  const searchName = async (keyword) => {
    if (keyword != "" && keyword != null) {
      let { data } = await axios.get("/api/visitor", {
        params: {
          mode: "search-visitor",
          searchKeyword: keyword,
        },
      });
      if (data.status == 200) {
        if (data.searchData?.length > 0)
          setFilter2({
            ...filters2,
            specificVisitorId: data.searchData[0]?._id,
          });
        setSelectedVisitor(data.searchData[0]);
        setLoading(false);
      }
    }
  };

  const updateReportData = (mode, extraData) => {
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
              value: extraData?.length || recentVisit?.length || 0,
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
            header3: "Date Checked In",
            header5: "Expected Check Out",
            header6: "Date Checked out",
          },
          data: TableDataParser2(extraData || recentVisit),
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
      render: (_, row) => (
        <Typography>
          {moment().year() - moment(row?.dateOfBirth).year()}
        </Typography>
      ),
    },
    {
      title: "Address",
      width: 350,
      render: (_, row) => (
        <Typography style={{ paddingLeft: 10 }}>
          {row?.barangay != "" ? row?.barangay + ", " : ""}
          {row.cityId.name}, {row?.provinceId.name} <br />
          {row?.regionId.name}
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
      align: "center",
      title: "Relationship",
      render: (_, row) => (
        <Typography style={{ paddingLeft: 10 }}>{row?.row7}</Typography>
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
            {moment(row?.row3).format("MMM DD, YYYY")} <br />
            {moment(row?.row4).format("hh:mm a")}
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
            {moment(row?.row3).format("MMM DD, YYYY")} <br />
            {moment(row?.row6).format("hh:mm a")}
          </Typography.Text>
        ) : (
          <Typography.Text type="secondary" italic>
            {row?.row6}
          </Typography.Text>
        ),
    },
  ];

  const printColumn3 = [
    {
      align: "center",
      title: "Violator Name",
      render: (_, row) => row?.violatorName,
    },
    {
      align: "center",
      title: "Violation Type",
      render: (_, row) => row?.type?.toUpperCase(),
    },
    {
      align: "center",
      title: "Date",
      render: (_, row) =>
        moment(row?.createdAt).format("MMMM DD, YYYY - hh:mm a"),
    },
    {
      title: "Violation Description",
      render: (_, row) => row?.description,
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
            style={{ marginBottom: 15, color: "#757575", fontSize: 12 }}
          >
            Natid-asan, Brgy Casisang, Malaybalay, Bukidnon
          </Typography.Text>

          <Typography.Text
            style={{
              marginBottom: 20,
              fontWeight: 900,
              color: "#000",
              fontSize: "1.5em",
            }}
          >
            List of Visitors
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
        <p>{column1Title}</p>
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
            style={{ marginBottom: 15, color: "#757575", fontSize: 12 }}
          >
            Natid-asan, Brgy Casisang, Malaybalay, Bukidnon
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
      <Col span={8} offset={1}>
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

      <Col span={12} offset={1} style={{ marginTop: 100 }}>
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

  const CustomTable3 = () => (
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
            style={{ marginBottom: 15, color: "#757575", fontSize: 12 }}
          >
            Natid-asan, Brgy Casisang, Malaybalay, Bukidnon
          </Typography.Text>
          <Typography.Text
            style={{
              marginBottom: 20,
              fontWeight: 900,
              color: "#000",
              fontSize: "1.5em",
            }}
          >
            List of Violators
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
      <Col span={20} offset={2}>
        <p>{column1Title}</p>
        <Table
          dataSource={violators}
          columns={printColumn3}
          rowKey={(row) => row._id}
          pagination={false}
          className="myTable"
          rowClassName="custom-table"
          bordered
        />
      </Col>

      <Col span={12} offset={2} style={{ marginTop: 100 }}>
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
    let filteredRegions = regionObj?.filter(
      (e) => e._id == "614c2580dd90f126474a5e25"
    )[0];
    setRegion(filteredRegions);
    setProvince(
      filteredRegions?.provinces.filter(
        (e) => e._id == "614c2580dd90f126474a5e26"
      )[0]
    );

    setCitymunicipalities(
      filteredRegions?.provinces
        ?.filter((e) => e._id == "614c2580dd90f126474a5e26")[0]
        ?.citymunicipalities.filter(
          (e) => e._id == "614c2581dd90f126474a5e29"
        )[0]
    );
  }, [regionObj]);

  useEffect(() => {
    (async () => {
      let { data } = await axios.get("/api/etc", {
        params: {
          mode: "get-region",
        },
      });

      if (data.status == 200) setRegionObj(data.data);
      else message.error(data.message);
    })();
  }, []);
  return (
    <>
      <Modal
        title="Report Filter"
        open={filterOpened}
        footer={null}
        maskClosable={false}
        onCancel={() => {
          setFilterOpened(false);
          setActiveFilter([]);
          setFilter2({
            specificVisitorId: "",
            specificVisiteeName: "",
            checkinDateRange: { from: null, to: null },
          });
        }}
      >
        {openFilterId == 1 && (
          <Form
            labelCol={{
              span: 24,
            }}
            wrapperCol={{
              span: 24,
            }}
            labelAlign="right"
            // onFinish={handleLogin}
          >
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              value={activeFilter}
              placeholder="Select a filter......"
              options={[
                { value: "dateRegistered", label: "Date Registered" },
                { value: "gender", label: "Gender" },
                { value: "ageRange", label: "Age Range" },
                { value: "address", label: "Address" },
              ]}
              onChange={(e) => {
                setActiveFilter(e);
                if (!e.includes("dateRegistered"))
                  setFilter({
                    ...filters,
                    dateRegistered: { from: null, to: null },
                  });
                if (!e.includes("gender"))
                  setFilter({ ...filters, gender: "" });
                if (!e.includes("ageRange"))
                  setFilter({ ...filters, age: { min: 0, max: 100 } });
                if (!e.includes("address"))
                  setFilter({
                    ...filters,
                    address: {
                      cityId: null,
                      provinceId: null,
                      regionId: null,
                      barangay: "",
                    },
                  });
                else
                  setFilter({
                    ...filters,
                    address: {
                      regionId: regions._id,
                      provinceId: province?._id,
                      cityId: citymunicipalities?._id,
                      barangay: "",
                    },
                  });
              }}
              allowClear
            />
            {activeFilter.includes("dateRegistered") && (
              <Card
                title="Date Registered"
                style={{ marginTop: 10 }}
                extra={
                  <CloseOutlined
                    style={{ fontSize: 20, color: "#f00" }}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter.filter((e) => e != "dateRegistered")
                      )
                    }
                  />
                }
              >
                <Form.Item>
                  <DatePicker.RangePicker
                    onCalendarChange={(e) => {
                      setFilter({
                        ...filters,
                        dateRegistered: {
                          from: e[0],
                          to: e[1],
                        },
                      });
                    }}
                  />
                </Form.Item>
              </Card>
            )}
            {activeFilter.includes("gender") && (
              <Card
                title="gender"
                style={{ marginTop: 10 }}
                extra={
                  <CloseOutlined
                    style={{ fontSize: 20, color: "#f00" }}
                    onClick={() =>
                      setActiveFilter(activeFilter.filter((e) => e != "gender"))
                    }
                  />
                }
              >
                <Form.Item>
                  <Select
                    onChange={(e) => setFilter({ ...filters, gender: e })}
                  >
                    <Select.Option value="male">Male</Select.Option>
                    <Select.Option value="female">Female</Select.Option>
                  </Select>
                </Form.Item>
              </Card>
            )}
            {activeFilter.includes("ageRange") && (
              <Card
                title="Age range"
                style={{ marginTop: 10 }}
                extra={
                  <CloseOutlined
                    style={{ fontSize: 20, color: "#f00" }}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter.filter((e) => e != "ageRange")
                      )
                    }
                  />
                }
              >
                <Form.Item>
                  <InputNumber
                    min={18}
                    max={100}
                    value={minAge}
                    prefix={
                      <Typography.Text type="secondary">min</Typography.Text>
                    }
                    onKeyUp={(e) => {
                      setMinAge(e.target.value);
                      if (e.target.value < 18) setMinAge(18);
                      if (e.target.value > 100) setMinAge(100);
                      setFilter({
                        ...filters,
                        age: {
                          min:
                            e.target.value < 18
                              ? 18
                              : e.target.value > 100
                              ? 100
                              : e.target.value,
                          max: filters.age.max,
                        },
                      });
                    }}
                  />{" "}
                  -{" "}
                  <InputNumber
                    min={18}
                    max={100}
                    value={maxAge}
                    prefix={
                      <Typography.Text type="secondary">max</Typography.Text>
                    }
                    onKeyUp={(e) => {
                      setMaxAge(e.target.value);
                      if (e.target.value < 18) setMinAge(18);
                      if (e.target.value > 100) setMaxAge(100);
                      setFilter({
                        ...filters,
                        age: {
                          min: filters.age.min,
                          max:
                            e.target.value < 18
                              ? 18
                              : e.target.value > 100
                              ? 100
                              : e.target.value,
                        },
                      });
                    }}
                  />
                </Form.Item>
              </Card>
            )}
            {activeFilter.includes("address") && (
              <Card
                style={{ marginTop: 10 }}
                title="Address"
                extra={
                  <CloseOutlined
                    style={{ fontSize: 20, color: "#f00" }}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter.filter((e) => e != "address")
                      )
                    }
                  />
                }
              >
                <Form.Item name="address" noStyle>
                  <Floatlabel label="Region" value={regions?.name != ""}>
                    <Select
                      className="customInput"
                      defaultValue={regions?.name}
                      style={{ width: 370 }}
                      onChange={(_) => {
                        setRegion(regionObj?.filter((e) => e._id == _)[0]);
                        setProvince({});
                        setCitymunicipalities();
                      }}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={[
                        ...regionObj.map((e) => {
                          return {
                            label: e.name,
                            value: e._id,
                          };
                        }),
                      ]}
                      showSearch
                    />
                  </Floatlabel>
                  {!addressOpened[0] && (
                    <Button
                      onClick={() => {
                        let _ = [...addressOpened];
                        _[0] = true;
                        setAddressOpened(_);
                      }}
                    >
                      Add Province
                    </Button>
                  )}
                  {addressOpened[0] && (
                    <Floatlabel label="Province" value={province?.name != null}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Select
                          className="customInput"
                          style={{ width: 370 }}
                          defaultValue={province?.name}
                          value={province?.name}
                          onChange={(_) => {
                            setProvince(
                              regions.provinces.filter((e) => e._id == _)[0]
                            );
                            setCitymunicipalities({});
                          }}
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={[
                            ...regionObj
                              .filter((e) => e._id == regions._id)[0]
                              .provinces.map((e) => {
                                return {
                                  label: e.name,
                                  value: e._id,
                                };
                              }),
                          ]}
                          showSearch
                        />
                        {!addressOpened[1] && (
                          <MinusCircleOutlined
                            style={{
                              fontSize: 25,
                              color: "#f00",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              let _ = [...addressOpened];
                              _[0] = false;
                              setAddressOpened(_);
                            }}
                          />
                        )}
                      </div>
                    </Floatlabel>
                  )}
                  {addressOpened[0] && !addressOpened[1] && (
                    <Button
                      onClick={() => {
                        let _ = [...addressOpened];
                        _[1] = true;
                        setAddressOpened(_);
                      }}
                    >
                      Add City/Municipalities
                    </Button>
                  )}
                  {addressOpened[1] && (
                    <Floatlabel
                      label="City/Municipalities"
                      value={citymunicipalities?.name != null}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Select
                          className="customInput"
                          onChange={(_) => {
                            setCitymunicipalities(
                              province.citymunicipalities.filter(
                                (e) => e._id == _
                              )[0]
                            );
                          }}
                          defaultValue={citymunicipalities?.name}
                          value={citymunicipalities?.name}
                          style={{ width: 370 }}
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={
                            province?._id != null
                              ? [
                                  ...regionObj
                                    .filter((e) => e._id == regions._id)[0]
                                    ?.provinces.filter(
                                      (e) => e._id == province._id
                                    )[0]
                                    ?.citymunicipalities.map((e) => {
                                      return {
                                        label: e.name,
                                        value: e._id,
                                      };
                                    }),
                                ]
                              : []
                          }
                          showSearch
                        />
                        {!addressOpened[2] && (
                          <MinusCircleOutlined
                            style={{
                              fontSize: 25,
                              color: "#f00",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              let _ = [...addressOpened];
                              _[1] = false;
                              setAddressOpened(_);
                            }}
                          />
                        )}
                      </div>
                    </Floatlabel>
                  )}
                  {addressOpened[0] &&
                    addressOpened[1] &&
                    !addressOpened[2] && (
                      <Button
                        onClick={() => {
                          let _ = [...addressOpened];
                          _[2] = true;
                          setAddressOpened(_);
                        }}
                      >
                        Add Barangay
                      </Button>
                    )}
                  {addressOpened[2] && (
                    <Floatlabel label="Barangay" value={barangay != ""}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Input
                          style={{ height: 45, paddingTop: 15, width: 370 }}
                          onChange={(e) => {
                            setBarangay(e.target.value);
                            setFilter({
                              ...filters,
                              address: {
                                ...filters.address,
                                barangay: e.target.value,
                              },
                            });
                          }}
                        />
                        <MinusCircleOutlined
                          style={{
                            fontSize: 25,
                            color: "#f00",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            let _ = [...addressOpened];
                            _[2] = false;
                            setAddressOpened(_);
                          }}
                        />
                      </div>
                    </Floatlabel>
                  )}
                </Form.Item>
              </Card>
            )}
            <Form.Item noStyle>
              <Button
                type="primary"
                size="large"
                style={{ width: "100%", marginTop: 20 }}
                onClick={generatePrint}
              >
                Proceed <ArrowRightOutlined />
              </Button>
            </Form.Item>
          </Form>
        )}
        {openFilterId == 2 && (
          <Form
            labelCol={{
              span: 24,
            }}
            wrapperCol={{
              span: 24,
            }}
            labelAlign="right"
            // onFinish={handleLogin}
          >
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              value={activeFilter}
              placeholder="Select a filter......"
              options={[
                { value: "specificVisitor", label: "Specific Visitor" },
                { value: "specificVisitee", label: "Specific Visitee" },
                { value: "dateChekinRange", label: "Check-In Date Range" },
              ]}
              onChange={(e) => {
                setActiveFilter(e);
              }}
              allowClear
            />
            {activeFilter.includes("specificVisitor") && (
              <Card
                title={
                  <>
                    Specific Visitor{" "}
                    <Tooltip title="Please select after searching otherwise specific selection would not work.">
                      <InfoCircleOutlined style={{ cursor: "pointer" }} />
                    </Tooltip>
                  </>
                }
                style={{ marginTop: 10 }}
                extra={
                  <CloseOutlined
                    style={{ fontSize: 20, color: "#f00" }}
                    onClick={() => {
                      setActiveFilter(
                        activeFilter.filter((e) => e != "specificVisitor")
                      );
                      setFilter2({ ...filters2, specificVisitorId: "" });
                      setSelected(false);
                    }}
                  />
                }
              >
                <Form.Item>
                  <AutoComplete
                    style={{
                      width: 200,
                    }}
                    disabled={selected}
                    loading={loading}
                    onSelect={() => {
                      setSelected(true);
                    }}
                    options={[
                      selectedVisitor &&
                      Object.keys(selectedVisitor)?.length != 0
                        ? {
                            value:
                              selectedVisitor?.name +
                              " " +
                              (selectedVisitor?.middlename != undefined
                                ? selectedVisitor?.middlename + " "
                                : "") +
                              selectedVisitor?.lastname,
                          }
                        : {},
                    ]}
                    placeholder="Search by Name"
                    filterOption={(inputValue, option) =>
                      option.value
                        ?.toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                    onChange={(_) => {
                      runTimer(_);
                      if (_?.length <= 0) {
                        setSelectedVisitor({});
                        setFilter2({ ...filters2, specificVisitorId: "" });
                        setLoading(false);
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="text"
                    onClick={() => setSelected(false)}
                    disabled={!selected}
                  >
                    change
                  </Button>
                </Form.Item>
              </Card>
            )}
            {activeFilter.includes("specificVisitee") && (
              <Card
                title="Specific Visitee"
                style={{ marginTop: 10 }}
                extra={
                  <CloseOutlined
                    style={{ fontSize: 20, color: "#f00" }}
                    onClick={() => {
                      setActiveFilter(
                        activeFilter.filter((e) => e != "specificVisitee")
                      );
                      setFilter2({ ...filters2, specificVisiteeName: "" });
                    }}
                  />
                }
              >
                {/* here */}
                <Form.Item>
                  <Input
                    disabled={applied}
                    onChange={(e) =>
                      setFilter2({
                        ...filters2,
                        specificVisiteeName: e.target.value,
                      })
                    }
                    suffix={
                      <Button onClick={() => setApplied(!applied)}>
                        {applied ? (
                          <Tooltip title="Change">
                            <ReloadOutlined />
                          </Tooltip>
                        ) : (
                          "APPLY"
                        )}
                      </Button>
                    }
                  />
                </Form.Item>
              </Card>
            )}
            {activeFilter.includes("dateChekinRange") && (
              <Card
                title="Check-In Date Range"
                style={{ marginTop: 10 }}
                extra={
                  <CloseOutlined
                    style={{ fontSize: 20, color: "#f00" }}
                    onClick={() => {
                      setActiveFilter(
                        activeFilter.filter((e) => e != "dateChekinRange")
                      );
                      setFilter2({
                        ...filters2,
                        checkinDateRange: { from: null, to: null },
                      });
                    }}
                  />
                }
              >
                <Form.Item>
                  <DatePicker.RangePicker
                    onCalendarChange={(e) => {
                      setFilter2({
                        ...filters2,
                        checkinDateRange: {
                          from: e[0],
                          to: e[1],
                        },
                      });
                    }}
                  />
                </Form.Item>
              </Card>
            )}
            <Form.Item noStyle>
              <Button
                type="primary"
                size="large"
                style={{ width: "100%", marginTop: 20 }}
                onClick={generatePrint2}
              >
                Proceed <ArrowRightOutlined />
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
      <PageHeader title="Report">
        <Drawer
          open={openPrintDrawer2}
          onClose={() => {
            setOpenPrintDrawer2(false);
            setEditMode(false);
          }}
          title="Print Preview"
          placement="bottom"
          height="100%"
          style={{
            width: 816,
            marginLeft: "50%",
            transform: "translateX(-50%)",
          }}
          extra={[
            <Space key="1">
              {/* <Checkbox
                style={{ width: 100 }}
                checked={editMode}
                onChange={(e) => {
                  setEditMode(e.target.checked);
                }}
              >
                Edit Mode
              </Checkbox> */}
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
          onClose={() => {
            setOpenPrintDrawer(false);
            setColumn1Title("");
          }}
          placement="bottom"
          height="100%"
          title="Print Preview"
          style={{
            width: 816,
            marginLeft: "50%",
            transform: "translateX(-50%)",
          }}
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
        <Drawer
          open={openPrintDrawer3}
          onClose={() => {
            setOpenPrintDrawer3(false);
          }}
          placement="bottom"
          height="100%"
          title="Print Preview"
          style={{
            width: 816,
            marginLeft: "50%",
            transform: "translateX(-50%)",
          }}
          extra={[
            <Button onClick={handlePrint3} key="visit1">
              PRINT
            </Button>,
          ]}
        >
          <PDF ref={ref3}>
            <CustomTable3 />
          </PDF>
        </Drawer>
        <Card>
          <Space direction="vertical">
            <Button
              key="visit2"
              onClick={() => {
                setOpenFilterId(1);
                setFilterOpened(true);
              }}
              style={{ width: 200 }}
            >
              Print Visitor List
            </Button>
            <Button
              onClick={() => {
                setOpenFilterId(2);
                setFilterOpened(true);
              }}
              style={{ width: 200 }}
              key="log2"
            >
              Print Visit Logs
            </Button>
            <Button
              onClick={() => fetchViolations()}
              style={{ width: 200 }}
              key="log2"
            >
              Print Violations
            </Button>
          </Space>
        </Card>
      </PageHeader>
    </>
  );
};

export default Report;
