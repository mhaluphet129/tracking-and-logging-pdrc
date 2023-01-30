import React, { useState, useEffect } from "react";
import {
  Button,
  message,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Modal,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

import { AddAdmin, UpdateAdmin } from "./components";

const AdminPage = () => {
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [updateAdmin, setUpdateAdmin] = useState({ open: false, data: null });
  const [trigger, setTrigger] = useState(0);
  const [loader, setLoader] = useState();

  const column = [
    {
      title: "Name",
      render: (_, row) => (
        <Typography>
          {row?.name && row?.lastname ? (
            row.name + " " + row.lastname
          ) : (
            <Typography.Text disabled italic>
              Not set
            </Typography.Text>
          )}
        </Typography>
      ),
    },
    {
      title: "Role",
      render: (_, row) => (
        <Tag color={row?.role == "superadmin" ? "#00b96b" : "blue"}>
          {row.role}
        </Tag>
      ),
    },
    {
      title: "Email",
      render: (_, row) => <Typography>{row.email}</Typography>,
    },
    {
      title: "Function",
      width: 150,
      align: "center",
      render: (_, row) => (
        <Space>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip
            title={
              row?.role == "superadmin"
                ? "You can't delete the Superadmin"
                : "Delete"
            }
          >
            <Button
              icon={<DeleteOutlined />}
              disabled={row?.role == "superadmin"}
              danger
              onClick={(e) => {
                e.stopPropagation();
                Modal.confirm({
                  title: "are you sure ?",
                  okText: "Confirm",
                  onOk: () => {
                    (async () => {
                      let { data } = await axios.delete("/api/admin", {
                        params: {
                          id: row?._id,
                        },
                      });
                      if (data?.status == 200) {
                        message.success(data.message);
                        setTrigger(trigger + 1);
                      } else message.error(data?.message);
                    })();
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      setLoader("fetch");
      let { data } = await axios.get("/api/admin");
      if (data.status == 200) setAdmins(data.admins);
      else message.error(data.message);
      setLoader("");
    })();
  }, [trigger]);

  return (
    <div>
      <Button onClick={() => setShowAddAdmin(true)}>Add Admin</Button>
      <Table
        dataSource={admins}
        footer={() => (
          <Typography.Text>Total: {admins?.length ?? 0}</Typography.Text>
        )}
        columns={column}
        onRow={(data) => {
          return {
            onClick: () => setUpdateAdmin({ open: true, data }),
          };
        }}
        pagination={{ pageSize: 10 }}
        rowKey={(row) => row._id}
        loading={loader == "fetch"}
      />
      <AddAdmin
        open={showAddAdmin}
        close={() => setShowAddAdmin(false)}
        refresh={() => setTrigger(trigger + 1)}
      />
      <UpdateAdmin
        open={updateAdmin.open}
        close={() => setUpdateAdmin({ open: false, data: null })}
        data={updateAdmin.data}
        refresh={() => setTrigger(trigger + 1)}
      />
    </div>
  );
};

export default AdminPage;
