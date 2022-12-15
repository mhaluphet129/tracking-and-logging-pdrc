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

const UpdateSenior = ({ open, close, data, refresh }) => {
  const [edited, setEdited] = useState(false);
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
            <Form.Item label="Address">
              <Input
                value={inputData?.address || ""}
                style={{ width: "60%" }}
                onChange={(e) => {
                  setInputData((_) => {
                    return { ..._, address: e.target.value };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label="Contact Number">
              <InputNumber
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
