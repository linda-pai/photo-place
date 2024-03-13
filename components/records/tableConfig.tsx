import type { ColumnsType } from "antd/es/table";

interface RecordOfUploadProps {
  author: string;
  createAt: string;
  eventId: string;
  eventName: string;
  imagesCount: number;
  chargeAt: string;
  uploadId: string;
}

const tableConfig = (columnsRenderMap: any) => {
  const columns: ColumnsType<RecordOfUploadProps> = [
    {
      title: "活動名稱",
      dataIndex: "eventName",
      key: "eventName",
    },
    {
      title: "上傳時間",
      dataIndex: "createAt",
      key: "createAt",
      ...columnsRenderMap.createAt,
    },
    {
      title: "上傳張數",
      dataIndex: "images",
      key: "images",
      width: 120,
      ...columnsRenderMap.images,
    },
    {
      title: "已發布",
      dataIndex: "images",
      key: "images",
      width: 120,
      ...columnsRenderMap.released,
    },
    {
      title: "未發布",
      dataIndex: "images",
      key: "images",
      width: 120,
      ...columnsRenderMap.unReleased,
    },
    {
      title: "售出張數",
      dataIndex: "sellInfo",
      key: "sellInfo",
      width: 200,
      ...columnsRenderMap.sellInfo,
    },
    {
      title: "攝影師名稱",
      dataIndex: "name",
      key: "name",
      ...columnsRenderMap.name,
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
