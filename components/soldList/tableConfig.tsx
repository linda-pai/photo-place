import type { ColumnsType } from "antd/es/table";
import { Order } from "@/types/interfaces/CartDataProps";

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
      width: 190,
      ...columnsRenderMap.orderId,
    },
    {
      title: "交易完成時間",
      dataIndex: "soldAt",
      key: "soldAt",
      width: 130,
      ...columnsRenderMap.soldAt,
    },
    {
      title: "訂單明細",
      dataIndex: "images",
      key: "images",
      width: 130,
      ...columnsRenderMap.images,
    },
    {
      title: "訂單金額",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 110,
      ...columnsRenderMap.totalAmount,
    },
  ];
  return columns;
};

export default tableConfig;
