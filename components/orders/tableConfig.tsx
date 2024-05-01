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
      title: "詳細資訊",
      ...columnsRenderMap.rwd,
      width: 100,
    },
    {
      title: "訂單編號",
      dataIndex: "orderId",
      key: "orderId",
      width: 60,
      ...columnsRenderMap.orderId,
    },
    {
      title: "訂單成立時間",
      dataIndex: "createAt",
      key: "createAt",
      width: 50,
      ...columnsRenderMap.createAt,
    },
    {
      title: "訂單明細",
      dataIndex: "items",
      key: "items",
      width: 100,
      ellipsis: true,
      ...columnsRenderMap.items,
    },
    {
      title: "付款方式",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 40,
      ...columnsRenderMap.paymentMethod,
    },
    {
      title: "款項狀態",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 40,
      ...columnsRenderMap.paidAt,
    },
    {
      title: "訂單金額",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 40,
      ...columnsRenderMap.totalAmount,
    },
    {
      title: "Action",
      key: "action",
      width: 40,
      ...columnsRenderMap.action,
    },
  ];
  return columns;
};

export default tableConfig;
