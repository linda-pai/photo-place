import React, { useState } from "react";
import {
  Space,
  Table,
  Collapse,
  Button,
  Modal,
  message,
  Tag,
  Spin,
} from "antd";
import { ExclamationCircleOutlined, CopyOutlined } from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import dayjs from "dayjs";
import usePermission from "@/hooks/usePermission";
import copyToClipboard from "@/utils/copyToClipboard";
import paymentOptions from "@/utils/paymentOptions";

interface Order {
  orderId: number;
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
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const isAllowed = usePermission();

  const [orderData, setOrderData] = useState<Order[]>(orders);
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState<{ [key: number]: boolean }>({});
  const [modal, contextHolder] = Modal.useModal();

  const handleOnToggle = (index: number) => {
    setToggle((prevToggle) => ({ ...prevToggle, [index]: !prevToggle[index] }));
  };

  const getOrderData = () => {
    fetch(`${domain}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrderData(data);
      });
  };

  const handleOnConfirm = (record: Order) => {
    setLoading(true);
    fetch(`${domain}/api/orders/update/${record.orderId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...record,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(() => {
        getOrderData();
        setLoading(false);
        return message.success("訂單已更新付款狀態");
      })
      .catch((err) => {
        setLoading(false);
        return message.error("訂單更新失敗");
      });
  };

  const confirm = (record: Order) => {
    modal.confirm({
      title: record.orderId + " 即將寄出付款確認信 ",
      icon: <ExclamationCircleOutlined />,
      content: record.paidAt ? "訂單已付款，將再次寄出" : "請確認對帳完成",
      okText: "確認",
      cancelText: "取消",
      onOk: () => handleOnConfirm(record),
    });
  };

  const columns: ColumnsType<Order> = [
    {
      title: "訂單編號",
      dataIndex: "orderId",
      key: "orderId",
      width: 190,
      ellipsis: true,
      render: (text) => (
        <a onClick={() => copyToClipboard(text)} className="cursor-pointer">
          <CopyOutlined className="mr-2" />
          {text}
        </a>
      ),
    },
    {
      title: "訂單成立時間",
      dataIndex: "createAt",
      key: "createAt",
      width: 130,
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },
    {
      title: "完成付款時間",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 130,
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.paidAt);
        const dateB = new Date(b.paidAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },

    {
      title: "訂購人",
      dataIndex: "orderBy",
      key: "orderBy",
      width: 90,
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
      width: 110,
      render: (text) => (
        <p>{paymentOptions.find((option) => option.value === text)?.label}</p>
      ),
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
                    <img src={item.watermarkedUrl} alt={item.watermarkedUrl} />
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
      width: 90,
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

  return isAllowed ? (
    <div className="container mx-auto my-24 text-slate-600">
      <h1 className="text-center text-2xl mb-10">訂單管理中心</h1>
      <div>
        <Table dataSource={orderData} columns={columns} loading={loading} />
        {contextHolder}
      </div>
    </div>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};
export default orderList;

export async function getServerSideProps() {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const res = await fetch(`${domain}/api/orders`);
  const orders = await res.json();

  return {
    props: { orders },
  };
}
