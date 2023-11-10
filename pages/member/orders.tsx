import { Spin } from "antd";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { Table, Collapse, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import dayjs from "dayjs";

interface Order {
  orderId: number;
  totalAmount: number;
  createAt: string;
  paidAt: string;
  paymentMethod: string;
  orderBy: string;
  items: CartDataProps[];
}

const orders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const columns: ColumnsType<Order> = [
    {
      title: "訂單編號",
      dataIndex: "orderId",
      key: "orderId",
      width: 140,
      ellipsis: true,
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
          <Collapse
            items={items.map((item) => ({
              key: item.id,
              label: item.id,
              children: (
                <>
                  <img src={item.watermarkedUrl} alt="" />
                </>
              ),
            }))}
            ghost
            className="truncate"
          />
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
  ];

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = () => {
    const userId = getCookie("userId");

    fetch(`http://localhost:3001/api/orders/getByUser/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setOrders(data);
        return data;
      });
  };

  console.log("orders", orders);

  return (
    <div className="container mx-auto text-slate-600">
      <h1 className="text-center">orderList</h1>
      <div className="my-20"></div>
      {loading ? (
        <Spin />
      ) : (
        orders.map((order) => (
          <div key={order.orderId} className="text-slate-600">
            <Table dataSource={orders} columns={columns} />
          </div>
        ))
      )}
    </div>
  );
};

export default orders;
