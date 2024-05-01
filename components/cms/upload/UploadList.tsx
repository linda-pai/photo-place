import { Button, Table } from "antd";
import Link from "next/link";

interface Event {
  data: string;
  eventName: string;
  coverImg: string;
  userId: string;
  isShow: boolean;
  eventId: string;
}

const UploadList = ({ events }: any) => {
  const columns = [
    {
      title: "詳細資訊",
      responsive: ["xs"],
      render: (_: string, record: any) => (
        <div className="flex flex-col gap-1">
          <p className="">活動ID：{record.eventId}</p>
          <p className="">活動名稱：{record.eventName}</p>
          <p className="">攝影師數量：{record.photographers.length}</p>
        </div>
      ),
      width: 100,
    },
    {
      title: "活動ID",
      dataIndex: "eventId",
      key: "eventId",
      width: 160,
      render: (text: string) => <Link href={`/events/${text}`}>{text}</Link>,
      responsive: ["sm"],
    },
    {
      title: "活動名稱",
      dataIndex: "eventName",
      key: "eventName",
      width: 340,
      responsive: ["sm"],
    },
    {
      title: "攝影師數量",
      dataIndex: "photographers",
      key: "photographers",
      width: 120,
      render: (photographers: string[]) => photographers.length,
      responsive: ["sm"],
    },

    {
      title: "Action",
      key: "action",
      width: 50,
      render: (_: string, record: Event) => (
        <Button type="primary">
          <Link href={`/cms/uploadManagement?eventId=${record.eventId}`}>
            顯示更多
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto my-24 text-slate-600">
      <h1 className="text-center text-2xl mb-10">攝影師上傳管理</h1>
      <Table columns={columns as any} dataSource={events} />
    </div>
  );
};

export default UploadList;
