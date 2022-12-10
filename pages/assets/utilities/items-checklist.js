import React, { useState, useEffect } from "react";
import {
  Modal,
  Space,
  Radio,
  Button,
  Row,
  Col,
  Card,
  Checkbox,
  Typography,
  message,
} from "antd";
import axios from "axios";
import { CheckCircleOutlined } from "@ant-design/icons";

const ItemChecklist = ({ open, close, items, setItems, setUnclaimTotal }) => {
  const [listItemType, setListItemType] = useState("unclaimed");
  const [filteredRenderedItems, setFilteredRenderedItems] = useState([]);
  const [truthList, setTruthList] = useState([]);
  const [selectAllToggle, setSelectAllToggle] = useState(true);

  useEffect(() => {
    setFilteredRenderedItems(() => items?.filter((e) => !e?.claimed));
  }, [items]);

  return (
    <Modal
      open={open}
      closable={false}
      footer={null}
      width={800}
      title={`Item List (${items?.length} total items)`}
      style={{
        top: 50,
      }}
      onCancel={close}
    >
      <Space
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Radio.Group
          value={listItemType}
          onChange={(e) => {
            setListItemType(e.target.value);
            setFilteredRenderedItems((_) => {
              switch (e.target.value) {
                case "claimed": {
                  return items.filter((__) => __.claimed);
                }
                case "unclaimed": {
                  return items.filter((__) => !__.claimed);
                }
              }
            });
          }}
        >
          <Radio value="claimed">Claimed</Radio>
          <Radio value="unclaimed">Unclaimed</Radio>
        </Radio.Group>
        <Space>
          {(listItemType == "all" || listItemType == "unclaimed") && (
            <Space>
              <Button
                onClick={() => {
                  setSelectAllToggle(!selectAllToggle);
                  if (
                    filteredRenderedItems?.length > 0 &&
                    filteredRenderedItems.filter((e) => e?.claimed).length ==
                      filteredRenderedItems?.length
                  ) {
                    setFilteredRenderedItems((e) =>
                      e.map((_) => {
                        return { ..._, claimed: false };
                      })
                    );
                  } else {
                    setFilteredRenderedItems((e) =>
                      e?.map((_) => {
                        return { ..._, claimed: true };
                      })
                    );
                  }
                  if (truthList?.length == filteredRenderedItems?.length)
                    setTruthList([]);
                }}
              >
                {(filteredRenderedItems?.length > 0 &&
                  filteredRenderedItems.filter((e) => e?.claimed).length ==
                    filteredRenderedItems?.length) ||
                truthList?.length == filteredRenderedItems?.length
                  ? "UNSELECT ALL"
                  : "SELECT ALL"}
              </Button>
              {((filteredRenderedItems?.length > 0 &&
                filteredRenderedItems.filter((e) => e?.claimed).length ==
                  filteredRenderedItems?.length) ||
                truthList?.length > 0) && (
                <Button
                  type="primary"
                  onClick={async () => {
                    let { data } = await axios.get("/api/items", {
                      params: {
                        mode: "claim-true",
                        ids: JSON.stringify(
                          truthList?.length > 0
                            ? truthList.map((e) => e?._id)
                            : filteredRenderedItems.map((e) => e?._id)
                        ),
                      },
                    });

                    if (data?.status == 200) {
                      setItems(data?.data);
                      setUnclaimTotal(
                        data?.data?.reduce((p, n) => {
                          if (!n.claimed) return p + 1;
                          return p;
                        }, 0)
                      );
                      message.success(data?.message);
                    }
                    setTruthList([]);
                  }}
                >
                  CLAIM
                </Button>
              )}
            </Space>
          )}
        </Space>
      </Space>
      <Row
        gutter={[16, 16]}
        style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
      >
        {filteredRenderedItems?.map((e, i) => (
          <Col
            span={8}
            key={i + e?.name}
            style={{ marginTop: 8, marginBottom: 8 }}
          >
            <Card
              title={e?.name}
              onClick={(_) => {
                if (!truthList.filter((_) => _?._id == e?._id)[0]?.claimed) {
                  setTruthList(() => {
                    return [...truthList, { ...e, claimed: true }];
                  });
                } else {
                  setTruthList(() => {
                    return truthList.filter((b) => b?._id != e?._id);
                  });
                }
              }}
              extra={[
                e?.claimed && selectAllToggle ? (
                  <CheckCircleOutlined
                    style={{ color: "green", fontSize: 20 }}
                  />
                ) : (
                  <Checkbox
                    checked={
                      !selectAllToggle
                        ? e?.claimed
                        : truthList.filter((_) => _?._id == e?._id)[0]?.claimed
                    }
                  />
                ),
              ]}
              style={{
                borderRadius: 10,
              }}
              hoverable
            >
              Description: <br />
              <Typography.Text type="secondary">
                {e?.description}
              </Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

export default ItemChecklist;
