import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Space,
  Form,
  Input,
  DatePicker,
  Select,
  Modal,
  Button,
} from "antd";
import moment from "moment";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import QRCode from "qrcode";
import parse from "html-react-parser";

const Profiler = ({ openModal, setOpenModal, data }) => {
  const [visitIn, setVisitIn] = useState(false);
  const [qr, setQr] = useState("");

  useEffect(() => {
    QRCode.toString(data?._id?.toString(), function (err, url) {
      setQr(parse(url || ""));
    });
  }, [data]);
  return (
    <>
      <Modal
        open={openModal}
        closable={false}
        footer={null}
        width={700}
        onCancel={() => setOpenModal(false)}
      >
        <Row>
          <Col span={12}>
            <Space direction="vertical">
              <span>{data?._id}</span>
              <div style={{ width: 200 }}>{qr}</div>
              <strong>Fullname</strong>
              <span style={{ marginLeft: 10 }}>
                {data?.name} {data?.middlename ?? ""} {data?.lastname}
              </span>
              <strong>Age and Gender</strong>
              <span style={{ marginLeft: 10 }}>
                {data?.age} , {data?.gender}
              </span>
              <strong>Date of Birth</strong>
              <span style={{ marginLeft: 10 }}>
                {moment(data?.dateOfBirth).format("MMMM DD, YYYY")}
              </span>
              <strong>Address</strong>
              <span style={{ marginLeft: 10 }}>{data?.address}</span>
              <strong>Contact Number</strong>
              <span style={{ marginLeft: 10 }}>{data?.contactNumber}</span>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical">
              <Space>
                <Button
                  type="primary"
                  size="large"
                  style={{ width: 150 }}
                  icon={<LoginOutlined />}
                  onClick={() => setVisitIn(true)}
                  ghost
                >
                  VISIT IN
                </Button>
                <Button
                  type="primary"
                  style={{ width: 150 }}
                  size="large"
                  icon={<LogoutOutlined />}
                  ghost
                  danger
                >
                  VISIT OUT
                </Button>
              </Space>
              <Button style={{ width: "100%" }}>VIEW RECORDS</Button>
            </Space>
          </Col>
        </Row>
      </Modal>
      <Modal
        open={visitIn}
        onCancel={() => setVisitIn(false)}
        closable={false}
        footer={null}
        title="Visitation Form"
      >
        <Form
          labelCol={{
            flex: "80px",
          }}
          labelAlign="left"
          labelWrap
          wrapperCol={{
            flex: 1,
          }}
          colon={false}
        >
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input />
          </Form.Item>
          <Form.Item label="Contact Number" name="contactNumber">
            <Input />
          </Form.Item>
          <Form.Item label="Relation to Person" name="relationship">
            <Input />
          </Form.Item>
          <Form.Item label="Date" name="date">
            <DatePicker defaultValue={moment()} format="MMM DD YYYY" />
          </Form.Item>
          <Form.Item label="Time IN/OUT">
            <DatePicker.RangePicker
              placeholder={["Time IN", "Time OUT"]}
              defaultValue={[moment(), null]}
              format="hh:mm A"
              picker="time"
            />
          </Form.Item>
          <Form.Item>
            <Select mode="multiple" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Profiler;
