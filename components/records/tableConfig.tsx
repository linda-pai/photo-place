import type { ColumnsType } from "antd/es/table";

interface RecordOfUploadProps {
  author: string;
  createAt: string;
  eventId: string;
  eventName: string;
  imagesCount: number;
  uploadId: string;
}

const tableConfig = (columnsRenderMap: any) => {
  const columns: ColumnsType<RecordOfUploadProps> = [
    {
      title: "活動名稱",
      dataIndex: "eventName",
      key: "eventName",
      width: 220,
    },
    {
      title: "活動日期",
      dataIndex: "date",
      key: "date",
      width: 130,
      ...columnsRenderMap.date,
    },
    {
      title: "最後上傳時間",
      dataIndex: "lastEditTime",
      key: "lastEditTime",
      ...columnsRenderMap.lastEditTime,
    },
    {
      title: "照片數量資訊",
      dataIndex: "soldCount",
      key: "soldCount",
      width: 400,
      ...columnsRenderMap.soldCount,
    },
    {
      title: "收入試算",
      key: "soldCount",
      width: 130,
      ...columnsRenderMap.earning,
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      ...columnsRenderMap.action,
    },
  ];
  return columns;
};

export default tableConfig;
