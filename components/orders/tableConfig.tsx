import type { ColumnsType } from "antd/es/table";
import { CartDataProps } from "@/types/interfaces/CartDataProps";

interface Order {
  orderId: string;
  totalAmount: number;
  createAt: string;
  paidAt: string;
  paymentMethod: number;
  orderBy: string;
  items: CartDataProps[];
}

const tableConfig = (columnsRenderMap: any) => {
  const columns: ColumnsType<Order> = [
    {
      title: "訂單編號",
      dataIndex: "orderId",
      key: "orderId",
      width: 140,
      ...columnsRenderMap.orderId,
    },
    {
      title: "訂單成立時間",
      dataIndex: "createAt",
      key: "createAt",
      width: 140,
      ...columnsRenderMap.createAt,
    },
    {
      title: "訂單明細",
      dataIndex: "items",
      key: "items",
      width: 260,
      ellipsis: true,
      ...columnsRenderMap.items,
    },
    {
      title: "付款方式",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      ...columnsRenderMap.paymentMethod,
    },
    {
      title: "款項狀態",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 120,
      ...columnsRenderMap.paidAt,
    },
    {
      title: "訂單金額",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 100,
      ...columnsRenderMap.totalAmount,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      ...columnsRenderMap.action,
    },
  ];
  return columns;
};

export default tableConfig;
