import React, { useState, useEffect } from "react";
import {
  Input,
  Modal,
  Form,
  Radio,
  Space,
  DatePicker,
  Button,
  Typography,
  Card,
  message,
  Image,
  Select,
} from "antd";
import axios from "axios";
import moment from "moment";
import { Floatlabel } from "../../../assets/utilities";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { PickerDropPane } from "filestack-react";

const AddVisitor = ({ open, close, refresh, regionObj }) => {
  let [form] = Form.useForm();
  let [verifyContinue, setVerifyContinue] = useState(false);
  let [showResults, setShowResults] = useState({ show: false, data: null });
  let [loader, setLoader] = useState("");
  let [doneVerify, setDoneVerify] = useState(false);
  let [image, setImage] = useState();
  let [dateBirth, setDateBirth] = useState("");

  let [regions, setRegion] = useState({});
  let [province, setProvince] = useState({});
  let [citymunicipalities, setCitymunicipalities] = useState([]);

  let [name, setName] = useState({
    name: "",
    middlename: "",
    lastname: "",
  });

  let [barangay, setBarangay] = useState("");
  let [age, setAge] = useState(0);
  let [ageChange, setAgeChange] = useState(false);
  let [error, setError] = useState(false);

  const handleFinish = async (val) => {
    if (province._id == null || citymunicipalities._id == null) {
      message.warn("Please provide a complete address");
      return;
    }

    if (error) {
      message.error("Only 18 years old and above is eligible for visit.");
      return;
    }

    val = {
      ...val,
      region: regions._id,
      province: province._id,
      barangay,
      citymunicipalities: citymunicipalities._id,
      dateOfBirth: dateBirth,
    };

    let { data } = await axios.post("/api/visitor", {
      payload: {
        mode: "add-visitor",
        visitor: { ...val, photo: image },
      },
    });

    if (data.status == 200) {
      close();
      refresh();
      message.success(data.message);
    } else message.error(data.message);
  };

  const handleVerify = async () => {
    if (name.name == "" || name.lastname == "") {
      message.error("You need to input name and lastname");
      return;
    }
    setLoader("verifying");
    let { data } = await axios.get("/api/etc", {
      params: {
        ...name,
        mode: "verify-name",
      },
    });

    if (data.status == 200) {
      setShowResults({ show: true, data: data.data });
      setDoneVerify(true);
    }
    setLoader("");
  };

  useEffect(() => {
    //default region 10 id "614c2580dd90f126474a5e25"
    //default bukidnon id  "614c2580dd90f126474a5e26
    //default malaybalay id "614c2581dd90f126474a5e29"

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

  return (
    <>
      <Modal
        title={
          <Typography.Title level={5}>
            PDRC VISITOR INFORMATION REGISTRATION FORM
          </Typography.Title>
        }
        open={open}
        onCancel={close}
        maskClosable={false}
        width={450}
        footer={
          verifyContinue && (
            <Button type="primary" onClick={form.submit}>
              Register
            </Button>
          )
        }
      >
        <Form
          form={form}
          labelCol={{
            flex: "110px",
          }}
          labelAlign="left"
          labelWrap
          wrapperCol={{
            flex: 1,
          }}
          colon={false}
          onFinish={handleFinish}
        >
          <Form.Item
            label="First Name"
            name="name"
            rules={[
              {
                required: true,
                message: "This is required.",
              },
            ]}
          >
            <Input
              disabled={doneVerify}
              onChange={(e) =>
                setName((_) => {
                  return { ..._, name: e.target.value };
                })
              }
            />
          </Form.Item>
          <Form.Item label="Middle Name (Optional)" name="middlename">
            <Input
              disabled={doneVerify}
              onChange={(e) =>
                setName((_) => {
                  return { ..._, middlename: e.target.value };
                })
              }
            />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastname"
            rules={[
              {
                required: true,
                message: "This is required.",
              },
            ]}
          >
            <Input
              disabled={doneVerify}
              onChange={(e) =>
                setName((_) => {
                  return { ..._, lastname: e.target.value };
                })
              }
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <Typography.Text
                type="secondary"
                style={{ marginRight: 5, fontSize: 11 }}
                italic
              >
                {!doneVerify && "Register the visitor after verification"}
              </Typography.Text>
              <Button
                style={{ width: 150, color: "#4BB543", borderColor: "#4BB543" }}
                onClick={handleVerify}
                loading={loader == "verifying"}
                disabled={doneVerify}
              >
                Verify Name {doneVerify && <CheckCircleOutlined />}
              </Button>
            </Space>
          </Form.Item>
          {verifyContinue && (
            <Form.Item label="Gender" name="gender" initialValue="male">
              <Radio.Group defaultValue="male">
                <Space>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          )}

          {verifyContinue && (
            <Form.Item label="Date of Birth" name="dateOfBirth">
              <DatePicker
                style={{ border: error ? "1px solid #f00" : null }}
                value={dateBirth}
                format="MMM DD, YYYY"
                onChange={(e) => {
                  setAgeChange(true);
                  let _age = moment().subtract(e?.year(), "years").year();
                  setAge(_age);
                  setDateBirth(e);
                  if (_age < 18) {
                    message.warning("Visitor should be atleast 18 years old.");
                    setError(true);
                  } else {
                    setError(false);
                  }
                }}
              />
              {ageChange && (
                <Input
                  value={`${age} years old`}
                  suffix={
                    age >= 18 ? (
                      <CheckCircleOutlined style={{ color: "#42ba96" }} />
                    ) : (
                      <ExclamationCircleOutlined style={{ color: "#ff0000" }} />
                    )
                  }
                  bor
                  style={{
                    width: 120,
                    marginLeft: 5,
                    border: `1px solid ${age >= 18 ? "#42ba96" : "#ff0000"}`,
                  }}
                  readOnly
                />
              )}
            </Form.Item>
          )}

          {verifyContinue && (
            <Form.Item label="Address" name="address">
              <Floatlabel label="Region" value={regions.name != ""}>
                <Select
                  className="customInput"
                  showSearch
                  defaultValue={regions.name}
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
                />
              </Floatlabel>
              <Floatlabel label="Province" value={province?.name != null}>
                <Select
                  className="customInput"
                  showSearch
                  defaultValue={province?.name}
                  value={province?.name}
                  onChange={(_) => {
                    setProvince(regions.provinces.filter((e) => e._id == _)[0]);
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
                />
              </Floatlabel>
              <Floatlabel
                label="City/Municipalities"
                value={citymunicipalities?.name != null}
              >
                <Select
                  className="customInput"
                  showSearch
                  onChange={(_) => {
                    setCitymunicipalities(
                      province.citymunicipalities.filter((e) => e._id == _)[0]
                    );
                  }}
                  defaultValue={citymunicipalities?.name}
                  value={citymunicipalities?.name}
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
                            ?.provinces.filter((e) => e._id == province._id)[0]
                            ?.citymunicipalities.map((e) => {
                              return {
                                label: e.name,
                                value: e._id,
                              };
                            }),
                        ]
                      : []
                  }
                />
              </Floatlabel>
              <Floatlabel label="Barangay" value={barangay != ""}>
                <Input
                  style={{ height: 45, paddingTop: 15 }}
                  onChange={(e) => setBarangay(e.target.value)}
                />
              </Floatlabel>
            </Form.Item>
          )}

          {verifyContinue && (
            <Form.Item
              label="Contact Number"
              name="contactNumber"
              rules={[
                {
                  required: true,
                  message: "This is required.",
                },
              ]}
            >
              <Input prefix="+63" maxLength={11} />
            </Form.Item>
          )}
          {verifyContinue && (
            <Form.Item label="Profile" style={{ marginTop: 20 }}>
              <div style={{ width: 255, cursor: "pointer" }}>
                {image == null || image == "" ? (
                  <PickerDropPane
                    apikey={"AKXY0x47MRoyw21abVGzJz"}
                    onUploadDone={(res) => setImage(res?.filesUploaded[0]?.url)}
                  />
                ) : null}
              </div>

              {image != null && image != "" ? (
                <div>
                  <Image src={image} />
                  <Button
                    style={{ padding: 0, border: "none" }}
                    danger
                    onClick={() => {
                      setImage(null);
                    }}
                  >
                    remove
                  </Button>
                </div>
              ) : null}
            </Form.Item>
          )}
        </Form>
      </Modal>
      <Modal
        open={showResults.show}
        onCancel={() => {
          setShowResults({ show: false, data: null });
          setDoneVerify(false);
        }}
        maskClosable={false}
        footer={[
          <Button
            key="key 1"
            onClick={() => {
              setShowResults({ show: false, data: null });
              setDoneVerify(false);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="key 2"
            type="primary"
            onClick={() => {
              setVerifyContinue(true);
              setShowResults({ show: false, data: null });
            }}
          >
            REGISTRATION CONTINUE <ArrowRightOutlined />
          </Button>,
        ]}
        width={800}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div style={{ alignSelf: "center" }}>
            <Typography.Title level={4}>Full Name</Typography.Title>
            <Card
              title={
                <>
                  {name.name}{" "}
                  {name.middlename != null || name.middlename != ""
                    ? name.middlename
                    : ""}{" "}
                  {name.lastname}{" "}
                  <Typography.Text type="secondary">
                    (
                    {showResults.data?.total != 0
                      ? (
                          (showResults.data?.countName /
                            showResults.data?.total) *
                          100
                        ).toFixed(2)
                      : 0}
                    %)
                  </Typography.Text>
                </>
              }
              style={{ height: 150, width: 300 }}
            >
              <strong>{showResults.data?.countName ?? 0}</strong> out of{" "}
              {showResults.data?.total} having exact name
            </Card>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Space direction="vertical">
              <Typography.Title level={4}>Name</Typography.Title>
              <Card
                title={
                  <>
                    {name.name}{" "}
                    <Typography.Text type="secondary">
                      (
                      {showResults.data?.total != 0
                        ? (
                            (showResults.data?.countName /
                              showResults.data?.total) *
                            100
                          ).toFixed(2)
                        : 0}
                      %)
                    </Typography.Text>
                  </>
                }
                style={{ height: 150 }}
              >
                <strong>{showResults.data?.countName ?? 0}</strong> out of{" "}
                {showResults.data?.total} having exact name
              </Card>
            </Space>
            <Space direction="vertical">
              <Typography.Title level={4}>Middlename</Typography.Title>
              <Card
                title={
                  name.middlename != "" ? (
                    <>
                      {name.middlename}{" "}
                      <Typography.Text type="secondary">
                        (
                        {showResults.data?.total != 0
                          ? (
                              (showResults.data?.countMiddleName /
                                showResults.data?.total) *
                              100
                            ).toFixed(2)
                          : 0}
                        %)
                      </Typography.Text>
                    </>
                  ) : (
                    <Typography.Text type="secondary" italic>
                      Not Set
                    </Typography.Text>
                  )
                }
                style={{ height: 150, width: 300 }}
              >
                {name.middlename != "" ? (
                  `${showResults.data?.countMiddleName ?? 0} out of ${
                    showResults.data?.total
                  }
          having exact name`
                ) : (
                  <Typography.Text type="secondary" italic>
                    Not Applicable
                  </Typography.Text>
                )}
              </Card>
            </Space>
            <Space direction="vertical">
              <Typography.Title level={4}>Lastname</Typography.Title>
              <Card
                title={
                  <>
                    {name.lastname}{" "}
                    <Typography.Text type="secondary">
                      (
                      {showResults.data?.total != 0
                        ? (
                            (showResults.data?.countLastname /
                              showResults.data?.total) *
                            100
                          ).toFixed(2)
                        : 0}
                      %)
                    </Typography.Text>
                  </>
                }
                style={{ height: 150 }}
              >
                <strong>{showResults.data?.countLastname ?? 0}</strong> out of{" "}
                {showResults.data?.total} having exact name
              </Card>
            </Space>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddVisitor;
