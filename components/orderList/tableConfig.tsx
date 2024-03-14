import type { ColumnsType } from "antd/es/table";
import { Order } from "@/types/interfaces/CartDataProps";

const tableConfig = (columnsRenderMap: any) => {
  const columns: ColumnsType<Order> = [
    {
      title: "訂單編號",
      dataIndex: "orderId",
      key: "orderId",
      width: 190,
      ...columnsRenderMap.orderId,
    },
    {
      title: "訂單成立時間",
      dataIndex: "createAt",
      key: "createAt",
      width: 130,
      ...columnsRenderMap.createAt,
    },
    {
      title: "完成付款時間",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 130,
      ...columnsRenderMap.paidAt,
    },
    {
      title: "訂購人",
      dataIndex: "orderBy",
      key: "orderBy",
      width: 90,
      ...columnsRenderMap.orderBy,
    },
    {
      title: "付款方式",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 110,
      ...columnsRenderMap.paymentMethod,
    },
    {
      title: "訂單明細",
      dataIndex: "items",
      key: "items",
      width: 260,
      ...columnsRenderMap.items,
    },
    {
      title: "款項狀態",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 90,
      ...columnsRenderMap.paymentStatus,
    },
    {
      title: "訂單金額",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 110,
      ...columnsRenderMap.totalAmount,
    },
    {
      title: "備註",
      dataIndex: "remark",
      key: "remark",
      width: 100,
      ...columnsRenderMap.remark,
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 100,
      ...columnsRenderMap.action,
    },
  ];
  return columns;
};

export default tableConfig;
