import React, { useState } from "react";
import {
  Modal,
  Spin,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Tag,
  message,
  Tooltip,
} from "antd";
import moment from "moment";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";

const VisitForm = ({
  open,
  close,
  data,
  setTrigger,
  setTrigger2,
  parentClose,
}) => {
  const [durationType, setDurationType] = useState("hours");
  const [loader, setLoader] = useState("");
  const [items, setItems] = useState([]);
  const [openAddItems, setOpenAddItems] = useState(false);
  const [itemsInfo, setItemsInfo] = useState({ name: "", description: "" });

  const handleFinish = async (val) => {
    if (
      val.prisonerName == null ||
      val.relationship == null ||
      val.duration == null
    ) {
      message.warning("Please fill the required input.");
      return;
    }

    if (itemsInfo.name != "") {
      message.warning("Please add the items to query before proceeding.");
      return;
    }

    let obj = {
      visitorId: data._id,
      timeIn: moment(),
      timeOut: moment().add(val?.duration, durationType),
      prisonerName: val.prisonerName,
      relationship: val.relationship,
      date: moment(),
      items,
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
      setTrigger((trigger) => trigger + 1);
      setTrigger2((trigger) => trigger + 1);
      parentClose();
      close();
      message.success(res.data.message);
    }
  };
  return (
    <>
      <Modal
        open={open}
        onCancel={() => {
          close();
          setItems([]);
          setOpenAddItems(false);
        }}
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
            <Form.Item label="Deposit Items List">
              {!openAddItems && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setOpenAddItems(true)}
                  style={{ marginTop: 10 }}
                >
                  Add new Items
                </Button>
              )}
              {items?.length > 0 && (
                <div style={{ marginLeft: 150 }}>
                  {items?.map((e, i) => (
                    <Tooltip
                      key={e + i}
                      title={e?.description ? e?.description : "No description"}
                    >
                      <Tag
                        onClose={(___) => {
                          ___.preventDefault();
                          setItems((_) => _.filter((__) => __.name != e.name));
                        }}
                        style={{ marginBottom: 5 }}
                        closable
                      >
                        {e.name}
                      </Tag>
                    </Tooltip>
                  ))}
                </div>
              )}

              {openAddItems && (
                <>
                  <Space
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    Name:{" "}
                    <Input
                      style={{
                        width: 320,
                      }}
                      placeholder="(Required)"
                      onChange={(e) =>
                        setItemsInfo((_) => {
                          return {
                            ..._,
                            name: e.target.value,
                          };
                        })
                      }
                      value={itemsInfo.name}
                    />
                  </Space>
                  <Space
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    Description:{" "}
                    <Input.TextArea
                      value={itemsInfo.description}
                      style={{
                        width: 320,
                        marginTop: 10,
                      }}
                      onChange={(e) =>
                        setItemsInfo((_) => {
                          return {
                            ..._,
                            description: e.target.value,
                          };
                        })
                      }
                    />
                  </Space>
                  <Button
                    icon={<PlusOutlined />}
                    style={{ marginTop: 10, float: "right" }}
                    onClick={() => {
                      if (itemsInfo.name == "") {
                        message.warning("Item name is blank.");
                        return;
                      }

                      if (
                        items.filter((e) => e.name == itemsInfo.name).length ==
                        0
                      ) {
                        setItems((e) => [
                          ...e,
                          { ...itemsInfo, ownerId: data?._id },
                        ]);
                        setItemsInfo({ name: "", description: "" });
                      }
                    }}
                  >
                    Add to query
                  </Button>
                </>
              )}
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
    </>
  );
};

export default VisitForm;
