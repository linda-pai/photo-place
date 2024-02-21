import type { ColumnsType } from "antd/es/table";

interface CardDataProps {
  eventId: number;
  watermarkedUrl: string;
  id: string;
  price: number;
}

const tableConfig = (columnsRenderMap: any) => {
  const columns: ColumnsType<CardDataProps> = [
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
      width: 100,
      ...columnsRenderMap.watermarkedUrl,
    },
    {
      title: "價格",
      dataIndex: "price",
      key: "price",
      width: 80,
      ...columnsRenderMap.price,
    },
    {
      title: "",
      key: "action",
      width: 80,
      ...columnsRenderMap.action,
    },
  ];
  return columns;
};

export default tableConfig;
