import Head from "next/head";
import { Descriptions, Spin } from "antd";
import dayjs from "dayjs";
import UploadPreview from "@/components/image/UploadPreview";
import userPermission from "@/hooks/usePermission";

const uploadDetail = ({
  eventId,
  record,
}: {
  eventId: string;
  record: any;
}) => {
  const title = "攝影師成就詳情 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = userPermission();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="攝影師成就詳情" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/photographer/uploadDetail`}
        />
      </Head>

      {isAllowed ? (
        <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
          <h1 className="text-center text-2xl mb-8">攝影師成就詳情</h1>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="賽事名稱">
              {record.eventName}
            </Descriptions.Item>
            <Descriptions.Item label="攝影師">{record.name}</Descriptions.Item>
            <Descriptions.Item label="賽事日期">
              {record.date}
            </Descriptions.Item>
            <Descriptions.Item label="最後修改日期">
              {dayjs(record.createAt).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="總上傳張數">
              {record.allImageLength} 張
            </Descriptions.Item>
          </Descriptions>
          <UploadPreview eventId={eventId} />
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};

export default uploadDetail;

export async function getServerSideProps(context: any) {
  const { eventId, status } = context.query;
  const record = JSON.parse(context.query.record);

  return {
    props: {
      eventId,
      status: status || "",
      record,
    },
  };
}
