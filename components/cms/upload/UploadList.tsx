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
      title: "活動ID",
      dataIndex: "eventId",
      key: "eventId",
      width: 160,
      render: (text: string) => <Link href={`/events/${text}`}>{text}</Link>,
    },
    {
      title: "活動名稱",
      dataIndex: "eventName",
      key: "eventName",
      width: 340,
    },
    {
      title: "攝影師數量",
      dataIndex: "photographers",
      key: "photographers",
      width: 120,
      render: (photographers: string[]) => photographers.length,
    },

    {
      title: "Action",
      key: "action",
      width: 100,
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
      <Table columns={columns} dataSource={events} />
    </div>
  );
};

export default UploadList;
