import React, { useState, useEffect } from "react";
import { Button, message, Table, Tag, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import axios from "axios";

import { AddAdmin, UpdateAdmin } from "./components";

const AdminPage = () => {
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [updateAdmin, setUpdateAdmin] = useState({ open: false, data: null });
  const [trigger, setTrigger] = useState(0);
  const [load, setLoad] = useState("");

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
      render: (_, row) => <Tag color="blue">{row.role}</Tag>,
    },
    {
      title: "Email",
      render: (_, row) => <Typography>{row.email}</Typography>,
    },
    {
      title: "Function",
      width: 150,
      align: "center",
      render: () => <Button icon={<SettingOutlined />}>Update</Button>,
    },
  ];

  useEffect(() => {
    const loadAdmin = async () => {
      setLoad("fetch");
      let { data } = await axios.get("/api/admin");
      if (data.status == 200) setAdmins(data.admins);
      else message.error(data.message);
      setLoad("");
    };

    loadAdmin();
  }, [trigger]);

  return (
    <div>
      <Button onClick={() => setShowAddAdmin(true)} style={{ marginBottom: 5 }}>
        Add Admin
      </Button>
      <Table
        dataSource={admins}
        columns={column}
        onRow={(data) => {
          return {
            onClick: () => setUpdateAdmin({ open: true, data }),
          };
        }}
        pagination={{ pageSize: 10 }}
        rowKey={(row) => row._id}
        loading={load == "fetch"}
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
