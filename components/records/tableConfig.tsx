import type { ColumnsType } from "antd/es/table";
import { RecordOfUploadProps } from "@/types/interfaces/UploadProps";

const tableConfig = (columnsRenderMap: any, showHeader: boolean) => {
  const columns: ColumnsType<RecordOfUploadProps> = [
    {
      title: "詳細資訊",
      ...columnsRenderMap.rwd,
      width: 200,
    },
    showHeader
      ? {
          title: "活動名稱",
          dataIndex: "eventName",
          key: "eventName",
          width: 220,
          ...columnsRenderMap.eventName,
        }
      : {},
    {
      title: "活動日期",
      dataIndex: "date",
      key: "date",
      width: 130,
      ...columnsRenderMap.date,
    },
    {
      title: "號碼布辨識進度",
      dataIndex: "imagesCount",
      key: "imagesCount",
      width: 150,
      ...columnsRenderMap.detectProcess,
    },
    {
      title: "照片數量資訊",
      dataIndex: "soldCount",
      key: "soldCount",
      width: 340,
      ...columnsRenderMap.soldCount,
    },
    {
      title: "收入試算",
      key: "soldCount",
      width: 110,
      ...columnsRenderMap.earning,
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      ...columnsRenderMap.action,
    },
  ];
  return columns;
};

export default tableConfig;
