import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";
import { Descriptions, Tag, Spin } from "antd";
import dayjs from "dayjs";
import UploadPreview from "@/components/image/UploadPreview";
import userPermission from "@/hooks/usePermission";

const uploadDetail = ({
  eventId,
  record,
  status,
}: {
  eventId: string;
  record: any;
  status: any;
}) => {
  const isAllowed = userPermission();

  const { data: session }: any = useSession();
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [imageLength, setImageLength] = useState({
    allImageLength: 0,
    featuredLength: 0,
  });
  const [toggle, setToggle] = useState({
    ALL: status === "ALL" ? true : false,
  });

  useEffect(() => {
    session &&
      fetch(`${domain}/api/images/getUploadImgDetail/${eventId}/${session.id}`)
        .then((res) => res.json())
        .then(setImageLength);
  }, [eventId, session]);

  const handleOnToggle = (key: "ALL") => {
    setToggle({
      ...toggle,
      [key]: !toggle[key],
    });
  };

  return (
    <>
      <Head>
        <title>攝影師成就詳情</title>
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
            <Descriptions.Item label="最後修改日期">
              {dayjs(record.createAt).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>

            <Descriptions.Item label="已上傳照片">
              <div className="flex items-center">
                <Tag color="green">{imageLength.allImageLength}張</Tag>
                {imageLength.allImageLength > 0 && (
                  <p
                    className="text-blue-500 hover:cursor-pointer"
                    onClick={() => handleOnToggle("ALL")}
                  >
                    {toggle["ALL"] ? "收合" : "展開"}
                  </p>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="已精選照片">
              <div className="flex items-center">
                <Tag color="blue">{imageLength.featuredLength}張</Tag>
                <Link
                  className="text-blue-500 hover:cursor-pointer"
                  href={`/photographer/featured?eventId=${eventId}`}
                >
                  前往查看
                </Link>
              </div>
            </Descriptions.Item>
          </Descriptions>
          <UploadPreview eventId={eventId} toggle={toggle} />
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
