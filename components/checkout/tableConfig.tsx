import type { ColumnsType } from "antd/es/table";
import { CartDataProps } from "@/types/interfaces/CartDataProps";

const tableConfig = (columnsRenderMap: any) => {
  const columns: ColumnsType<CartDataProps> = [
    {
      title: "活動名稱",
      dataIndex: "eventName",
      key: "eventName",
      width: 120,
      ...columnsRenderMap.eventName,
    },
    {
      title: "預覽",
      dataIndex: "watermarkedUrl",
      key: "watermarkedUrl",
      width: 80,
      ...columnsRenderMap.watermarkedUrl,
    },
    {
      title: "價格",
      dataIndex: "price",
      key: "price",
      width: 100,
      ...columnsRenderMap.price,
    },
  ];
  return columns;
};

export default tableConfig;
