import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Descriptions, Modal, Tag, Button, message } from "antd";
import dayjs from "dayjs";
import UploadPreview from "@/components/image/UploadPreview";
import imagesRelease from "@/lib/upload/imagesRelease";

const uploadDetail = ({
  eventId,
  record,
}: {
  eventId: string;
  record: any;
}) => {
  const { data: session }: any = useSession();
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [modal, contextHolder] = Modal.useModal();

  const [imageLength, setImageLength] = useState({
    isReleasedLength: 0,
    unReleasedLength: 0,
    featuredLength: 0,
  });
  const [toggle, setToggle] = useState({
    RELEASED: false,
    UNRELEASED: false,
    FEATURED: false,
  });

  useEffect(() => {
    session &&
      fetch(`${domain}/api/images/getUploadImgDetail/${eventId}/${session.id}`)
        .then((res) => res.json())
        .then(setImageLength);
  }, [eventId, session]);

  const handleRelease = () => {
    modal.confirm({
      title: "發布確認",
      content: `確定要發布嗎${imageLength.unReleasedLength}張照片嗎？`,
      onOk: async () => {
        const res = await imagesRelease(eventId);
        if (res.status === 200) {
          message.success("發佈成功");
          setImageLength({
            isReleasedLength:
              imageLength.isReleasedLength + imageLength.unReleasedLength,
            unReleasedLength: 0,
            featuredLength: 0,
          });
        } else {
          message.error("發佈失敗");
        }
      },
    });
  };

  const handleOnToggle = (key: "RELEASED" | "UNRELEASED") => {
    setToggle({
      ...toggle,
      [key]: !toggle[key],
    });
  };

  return (
    <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
      <h1 className="text-center text-2xl mb-8">攝影師上傳紀錄詳情</h1>
      <Descriptions
        bordered
        column={2}
        size="small"
        extra={
          <Button
            type="primary"
            onClick={handleRelease}
            disabled={imageLength.unReleasedLength === 0}
          >
            發布
          </Button>
        }
      >
        <Descriptions.Item label="賽事名稱">
          {record.eventName}
        </Descriptions.Item>
        <Descriptions.Item label="Author">{record.author}</Descriptions.Item>
        <Descriptions.Item label="最後修改日期">
          {dayjs(record.createAt).format("YYYY-MM-DD HH:mm:ss")}
        </Descriptions.Item>

        <Descriptions.Item label="Charge At">
          {record.chargeAt
            ? dayjs(record.chargeAt).format("YYYY-MM-DD HH:mm:ss")
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="已發布照片">
          <div className="flex items-center">
            <Tag color="green">{imageLength.isReleasedLength}張</Tag>
            {imageLength.isReleasedLength > 0 && (
              <p
                className="text-blue-500 hover:cursor-pointer"
                onClick={() => handleOnToggle("RELEASED")}
              >
                {toggle["RELEASED"] ? "收合" : "展開"}
              </p>
            )}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="未發布照片">
          <div className="flex items-center">
            <Tag color="red">{imageLength.unReleasedLength}張</Tag>
            {imageLength.unReleasedLength > 0 && (
              <p
                className="text-blue-500 hover:cursor-pointer"
                onClick={() => handleOnToggle("UNRELEASED")}
              >
                {toggle["UNRELEASED"] ? "收合" : "展開"}
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
      {contextHolder}
    </div>
  );
};

export default uploadDetail;

export async function getServerSideProps(context: any) {
  const eventId = context.query.eventId;
  const record = JSON.parse(context.query.record);

  return {
    props: {
      eventId,
      record,
    },
  };
}
