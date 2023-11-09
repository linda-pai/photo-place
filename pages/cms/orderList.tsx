import React, { useState } from "react";
import { Space, Table, Collapse, Button, Modal, message, Tag } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import dayjs from "dayjs";

interface Order {
  id: number;
  totalAmount: number;
  createAt: string;
  paidAt: string;
  paymentMethod: string;
  orderBy: string;
  items: CartDataProps[];
}

interface OrderListProps {
  orders: Order[];
}

const orderList = ({ orders }: OrderListProps) => {
  console.log("orders", orders);
  const [orderData, setOrderData] = useState<Order[]>(orders);

  const [toggle, setToggle] = useState<{ [key: number]: boolean }>({});
  const [modal, contextHolder] = Modal.useModal();

  const handleOnToggle = (index: number) => {
    console.log("handleToggle");
    setToggle((prevToggle) => ({ ...prevToggle, [index]: !prevToggle[index] }));
  };

  const getOrderData = () => {
    fetch("http://localhost:3001/api/orders")
      .then((res) => res.json())
      .then((data) => setOrderData(data));
  };

  const handleOnConfirm = (record: Order) => {
    console.log("record", record);
    fetch(`http://localhost:3001/api/orders/update/${record.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(() => {
        getOrderData();
        return message.success("訂單已更新付款狀態");
      });
  };

  const confirm = (record: Order) => {
    modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: "是否確認已收款",
      okText: "確認",
      cancelText: "取消",
      onOk: () => handleOnConfirm(record),
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("已複製");
  };

  const columns: ColumnsType<Order> = [
    {
      title: "訂單編號",
      dataIndex: "id",
      key: "id",
      width: 140,
      ellipsis: true,
      render: (text) => (
        <a onClick={() => copyToClipboard(text)} className="cursor-pointer">
          {text}
        </a>
      ),
    },
    {
      title: "訂單成立時間",
      dataIndex: "createAt",
      key: "createAt",
      width: 120,
      render: (text) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"}</p>
      ),
    },

    {
      title: "訂購人",
      dataIndex: "orderBy",
      key: "orderBy",
      width: 100,
      ellipsis: true,
      render: (text) => (
        <p onClick={() => copyToClipboard(text)} className="cursor-pointer">
          {text}
        </p>
      ),
    },
    {
      title: "付款方式",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
    },

    {
      title: "訂單明細",
      dataIndex: "items",
      key: "items",
      width: 260,
      ellipsis: true,
      render: (_, { items }, index) => (
        <div>
          <div
            onClick={() => handleOnToggle(index)}
            className="flex gap-8 items-center"
          >
            <p className="text-end">共 {items.length} 張</p>
            <p className="text-blue-500">{toggle[index] ? "收合" : "展開"}</p>
          </div>

          {toggle[index] && (
            <Collapse
              items={items.map((item) => ({
                key: item.id,
                label: item.id,
                children: (
                  <>
                    <p>TWD {item.price} 元</p>
                    <img src={item.watermarkedUrl} alt="" />
                  </>
                ),
              }))}
              ghost
              className="truncate"
            />
          )}
        </div>
      ),
    },
    {
      title: "款項狀態",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 120,
      render: (text) => (
        <p>
          {text ? (
            <Tag color="green">已付款</Tag>
          ) : (
            <Tag color="volcano">未付款</Tag>
          )}
        </p>
      ),
    },
    {
      title: "訂單金額",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 100,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      sortDirections: ["descend"],
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Button danger onClick={() => confirm(record)}>
            確認收款
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-center">orderList</h1>
      <div className="my-20">
        <Table dataSource={orderData} columns={columns} />
        {contextHolder}
      </div>
    </div>
  );
};
export default orderList;

export async function getServerSideProps() {
  const res = await fetch("http://localhost:3001/api/orders");
  const orders = await res.json();

  return {
    props: { orders },
  };
}
