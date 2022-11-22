import React, { useState } from "react";
import {
  Modal,
  Spin,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
} from "antd";
import moment from "moment";
import axios from "axios";

const VisitForm = ({ open, setOpen, data, setTrigger }) => {
  const [depositItems, setDepositItems] = useState([]);
  const [durationType, setDurationType] = useState("hours");
  let depositOptions = ["Food", "Money", "Clothes"];
  let filteredOptions = depositOptions.filter((e) => !depositItems.includes(e));
  const [loader, setLoader] = useState("");

  const handleFinish = async (val) => {
    if (val.prisonerName == null || val.relationship == null) {
      message.warning("Please fill the required input.");
      return;
    }

    let obj = {
      visitorId: data._id,
      timeIn: moment(),
      timeOut: moment().add(val?.duration, durationType),
      prisonerName: val.prisonerName,
      relationship: val.relationship,
      depositItems: val.depositItems,
      date: moment(),
    };

    setLoader("registering");
    let res = await axios.post("/api/visit", {
      payload: {
        mode: "new-visit",
        data: obj,
      },
    });
    setLoader("");

    if (res.data.status == 200) {
      setOpen({ show: false, data: null });
      message.success(res.data.message);
      setTrigger(trigger + 1);
    }
  };
  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      closable={false}
      footer={null}
      title="Visitation Form"
      destroyOnClose
    >
      <Spin spinning={loader == "registering"}>
        <Form
          labelCol={{
            flex: "150px",
          }}
          labelAlign="left"
          labelWrap
          wrapperCol={{
            flex: 1,
          }}
          colon={false}
          onFinish={handleFinish}
        >
          <Form.Item name="prisonerName" label="Name of prisoner">
            <Input />
          </Form.Item>
          <Form.Item label="Relation to prisoner" name="relationship">
            <Input />
          </Form.Item>
          <Form.Item label="Visit Duration" name="duration">
            <InputNumber
              placeholder={`max: ${durationType == "minutes" ? 120 : 2}`}
              addonAfter={
                <Select
                  style={{ width: 100 }}
                  onChange={(e) => setDurationType(e)}
                  value={durationType}
                >
                  <Select.Option value="minutes">Minutes</Select.Option>
                  <Select.Option value="hours">Hour</Select.Option>
                </Select>
              }
              min={0}
              max={durationType == "minutes" ? 120 : 2}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            label="Deposit Items"
            name="depositItems"
            initialValue={depositItems}
          >
            <Select
              mode="multiple"
              onChange={setDepositItems}
              options={filteredOptions.map((item) => ({
                value: item,
                label: item,
              }))}
            />
          </Form.Item>
          <Form.Item noStyle>
            <Button
              type="primary"
              style={{ width: "100%" }}
              htmlType="submit"
              size="large"
            >
              SUBMIT
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default VisitForm;
