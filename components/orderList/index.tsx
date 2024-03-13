import React, { useState } from "react";
import { Table, Space, Button, Tag, Modal, message, Input } from "antd";
import {
  ExclamationCircleOutlined,
  CopyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Order, OrderListProps } from "@/types/interfaces/CartDataProps";
import copyToClipboard from "@/utils/copyToClipboard";
import paymentOptions from "@/utils/paymentOptions";
import updateOrderData from "@/lib/order/updateOrderData";
import tableConfig from "./tableConfig";
import dynamic from "next/dynamic";

const ImageDetail = dynamic(() => import("./ImageDetail"), {
  loading: () => <div>Loading...</div>,
});

const OrderList = ({ orders }: OrderListProps) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [orderData, setOrderData] = useState<Order[]>(orders);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<{ [key: string]: boolean }>({});
  const [modal, contextHolder] = Modal.useModal();

  const columnsRenderMap = {
    orderId: {
      ellipsis: true,
      render: (text: string) => (
        <a
          onClick={() => copyToClipboard(text)}
          className="cursor-pointer"
          title="複製訂單編號"
        >
          <CopyOutlined className="mr-2" />
          {text}
        </a>
      ),
    },
    createAt: {
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text: string) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },
    paidAt: {
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.paidAt);
        const dateB = new Date(b.paidAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text: string) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },
    orderBy: {
      ellipsis: true,
      render: (text: string) => (
        <p onClick={() => copyToClipboard(text)} className="cursor-pointer">
          {text}
        </p>
      ),
    },
    paymentMethod: {
      render: (text: string) => (
        <p>
          {paymentOptions.find((option: any) => option.value === text)?.label}
        </p>
      ),
    },
    items: {
      ellipsis: true,
      render: (_: string, { items }: Order, index: number) => (
        <ImageDetail items={items} index={index} />
      ),
    },
    paymentStatus: {
      render: (text: string) => (
        <p>
          {text ? (
            <Tag color="green">已付款</Tag>
          ) : (
            <Tag color="volcano">未付款</Tag>
          )}
        </p>
      ),
    },
    totalAmount: {
      sorter: (a: Order, b: Order) => a.totalAmount - b.totalAmount,
      sortDirections: ["descend"],
    },
    remark: {
      render: (text: string, record: Order) => (
        <div>
          {/* 可編輯 */}
          <EditOutlined onClick={() => toggle(record.orderId)} />
          {editing[record.orderId] ? (
            <Input
              value={text}
              onChange={(e) => handleRemarkChange(e, record)}
              onPressEnter={() => handleInputConfirm(record.orderId, text)}
            />
          ) : (
            <p>{text}</p>
          )}
        </div>
      ),
    },
    action: {
      render: (_: string, record: Order) => (
        <>
          <Space size="middle">
            <Button type="primary" onClick={() => confirm(record)}>
              確認收款
            </Button>
          </Space>
          <Space size="middle" className="my-2">
            <Button danger onClick={() => deleteOrder(record)}>
              刪除訂單
            </Button>
          </Space>
        </>
      ),
    },
  };

  const handleInputConfirm = (orderId: string, text: string) => {
    setEditing((prev) => ({ ...prev, [orderId]: false }));

    updateOrderData({
      remark: text,
      orderId: orderId,
    });
  };

  const handleRemarkChange = (e: any, record: Order) => {
    const newOrderData = orderData.map((item) => {
      if (item.orderId === record.orderId) {
        return { ...item, remark: e.target.value };
      }
      return item;
    });
    setOrderData(newOrderData);
  };

  const toggle = (orderId: string) => {
    setEditing((prevToggle) => ({
      ...prevToggle,
      [orderId]: !prevToggle[orderId],
    }));
  };

  const columns = tableConfig(columnsRenderMap);

  const handleOnDelete = (record: Order) => {
    setLoading(true);
    fetch(`${domain}/api/orders/delete/${record.orderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(() => {
        getOrderData();
        setLoading(false);
        return message.success("訂單已刪除");
      })
      .catch((err) => {
        setLoading(false);
        return message.error("訂單刪除失敗");
      });
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
    //remove _id
    record._id && delete record._id;
    updateOrderData(record)
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

  const deleteOrder = (record: Order) => {
    modal.confirm({
      title: record.orderId + " 即將刪除訂單 ",
      icon: <ExclamationCircleOutlined />,
      content: "刪除後將無法復原",
      okText: "確認",
      cancelText: "取消",
      onOk: () => handleOnDelete(record),
    });
  };

  return (
    <div className="container mx-auto my-24 text-slate-600">
      <h1 className="text-center text-2xl mb-10">訂單管理中心</h1>
      <div>
        {orderData.length !== 0 && (
          <Table dataSource={orderData} columns={columns} loading={loading} />
        )}
        {contextHolder}
      </div>
    </div>
  );
};

export default OrderList;
