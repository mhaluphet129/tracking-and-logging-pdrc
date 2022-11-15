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
  Modal,
  message,
  Spin,
} from "antd";
import moment from "moment";
import axios from "axios";
import { Profiler } from "../../../assets/utilities";

const UpdateSenior = ({ open, close, data, refresh }) => {
  const [edited, setEdited] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [inputData, setInputData] = useState({
    name: "",
    middlename: "",
    lastname: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    address: "",
    contactNumber: "",
  });
  const [load, setLoad] = useState("");

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

  // dynamically update input data when data is updated
  useEffect(() => {
    setInputData(data);
  }, [data]);

  return (
    <>
      <Drawer
        open={open}
        onClose={close}
        width={500}
        title=" "
        extra={[
          <Space>
            <Button type="link" onClick={() => setOpenProfile(true)}>
              Open Profile
            </Button>

            <Button type="primary" disabled={!edited} onClick={handleSave}>
              SAVE
            </Button>
            <Button
              type="danger"
              onClick={() => {
                Modal.confirm({
                  title: "are you sure ?",
                  okText: "Confirm",
                  onOk: () => alert("sanaol"),
                });
              }}
            >
              DELETE
            </Button>
          </Space>,
        ]}
        closable={false}
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
            <Form.Item label="First Name">
              <Input
                value={inputData?.name || ""}
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
            <Form.Item label="Date of Birth">
              <DatePicker
                defaultValue={moment(inputData?.dateOfBirth)}
                format="MMM DD YYYY"
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, dateOfBirth: e };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Age">
              <InputNumber
                value={inputData?.age || ""}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, age: e };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Address">
              <Input
                value={inputData?.address || ""}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, address: e.target.value };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Contact Number">
              <Input
                value={inputData?.contactNumber || ""}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, contactNumber: e.target.value };
                  });
                }}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Drawer>
      <Profiler
        openModal={openProfile}
        setOpenModal={setOpenProfile}
        data={data}
      />
    </>
  );
};

export default UpdateSenior;
