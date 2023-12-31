import React, { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  Space,
  Form,
  Input,
  Radio,
  InputNumber,
  DatePicker,
  Select,
  message,
  Spin,
  Image,
} from "antd";
import moment from "moment";
import axios from "axios";
import { PickerDropPane } from "filestack-react";
import { Floatlabel } from "../../../../assets/utilities";

const UpdateSenior = ({ open, close, data, refresh, regionObj = [] }) => {
  const [edited, setEdited] = useState(false);
  const [inputData, setInputData] = useState({
    name: "",
    middlename: "",
    lastname: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    contactNumber: "",
    region: "",
    province: "",
    citymunicipalities: "",
    barangay: "",
    photo: null,
  });
  const [load, setLoad] = useState("");

  let [regions, setRegion] = useState({});
  let [province, setProvince] = useState({});
  let [citymunicipalities, setCitymunicipalities] = useState([]);

  const handleSave = async () => {
    setLoad("saving");
    let res = await axios.post("/api/visitor", {
      payload: {
        mode: "update-visitor",
        data: inputData,
        id: data._id,
      },
    });

    if (res.data.status == 200) {
      close();
      refresh();
      message.success(res.data.message);
    } else message.error(res.data.message);
    setLoad("");
  };

  const downloadImage = async (url) => {
    await fetch(url, {
      method: "GET",
      headers: {},
    })
      .then((response) => {
        response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "image.png");
          link.click();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // dynamically update input data when data is updated
  useEffect(() => {
    setInputData(data);
  }, [data]);

  useEffect(() => {
    let filteredRegions = regionObj?.filter(
      (e) => e._id == data?.regionId._id
    )[0];
    setRegion(filteredRegions);
    setProvince(
      filteredRegions?.provinces.filter((e) => e._id == data?.provinceId._id)[0]
    );

    setCitymunicipalities(
      filteredRegions?.provinces
        ?.filter((e) => e._id == data?.provinceId._id)[0]
        ?.citymunicipalities.filter((e) => e._id == data?.cityId._id)[0]
    );
  }, [data]);

  return (
    <>
      <Drawer
        open={open}
        onClose={close}
        width={500}
        title="Edit Visitor Profile"
        extra={[
          <Button
            key="key 1"
            type="primary"
            disabled={!edited}
            onClick={handleSave}
          >
            SAVE
          </Button>,
        ]}
        closable={false}
        destroyOnClose
      >
        <Spin spinning={load == "saving"}>
          <Form
            onChange={() => setEdited(true)}
            labelCol={{
              flex: "110px",
            }}
            labelAlign="left"
            labelWrap
            wrapperCol={{
              flex: 1,
            }}
            colon={false}
          >
            <Form.Item label="Profile">
              <div
                style={{
                  width: 255,
                  cursor: "pointer",
                  display:
                    inputData?.photo == null || inputData?.photo == ""
                      ? "block"
                      : "none",
                }}
                id="picker-container"
              >
                <PickerDropPane
                  apikey={"AKXY0x47MRoyw21abVGzJz"}
                  onUploadDone={(res) => {
                    setInputData((_) => {
                      return { ..._, photo: res?.filesUploaded[0]?.url };
                    });
                    setEdited(true);
                  }}
                  pickerOptions={{ container: "picker-container" }}
                />
              </div>

              {inputData?.photo != null && inputData?.photo != "" ? (
                <div>
                  <Image src={inputData?.photo} alt="random_photo" /> <br />
                  <Space>
                    <Button
                      style={{ padding: 0, border: "none" }}
                      danger
                      onClick={() => {
                        setEdited(true);
                        setInputData({ ...inputData, photo: null });
                      }}
                    >
                      remove
                    </Button>
                    <Button
                      type="text"
                      style={{ padding: 0, border: "none", color: "#0000ff" }}
                      onClick={() => downloadImage(inputData?.photo)}
                    >
                      download
                    </Button>
                  </Space>
                </div>
              ) : null}
            </Form.Item>
            <Form.Item label="First Name">
              <Input
                value={inputData?.name || ""}
                style={{ width: "60%" }}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, name: e.target.value };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Middle Name (Optional)">
              <Input
                value={inputData?.middlename || ""}
                style={{ width: "60%" }}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, middlename: e.target.value };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Last Name">
              <Input
                value={inputData?.lastname || ""}
                style={{ width: "60%" }}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, lastname: e.target.value };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Gender">
              <Radio.Group
                value={inputData?.gender || ""}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, gender: e.target.value };
                  });
                }}
              >
                <Space>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Date of Birth"
              initialValue={moment(inputData?.dateOfBirth)}
            >
              <DatePicker
                defaultValue={moment(inputData?.dateOfBirth)}
                format="MMMM DD, YYYY"
                style={{ width: 180 }}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, dateOfBirth: e };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Address" name="address">
              <Floatlabel label="Region" value={regions?.name != ""}>
                <Select
                  className="customInput"
                  showSearch
                  defaultValue={regions?.name}
                  value={regions?.name}
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
                  options={
                    regions?._id != null
                      ? [
                          ...regionObj
                            .filter((e) => e._id == regions._id)[0]
                            ?.provinces?.map((e) => {
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
                            ?.citymunicipalities?.map((e) => {
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
              <Floatlabel
                label="Barangay"
                value={
                  (data?.barangay != "" && data?.barangay != null) ||
                  (inputData?.barangay != "" && inputData?.barangay != null)
                }
              >
                <Input
                  style={{ height: 45, paddingTop: 15 }}
                  onChange={(e) =>
                    setInputData((_) => {
                      return { ..._, barangay: e.target.value };
                    })
                  }
                  value={data?.barangay}
                />
              </Floatlabel>
            </Form.Item>
            <Form.Item label="Contact Number">
              <InputNumber
                prefix="+63"
                maxLength={11}
                style={{ width: "60%" }}
                value={inputData?.contactNumber || ""}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, contactNumber: e };
                  });
                }}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Drawer>
    </>
  );
};

export default UpdateSenior;
