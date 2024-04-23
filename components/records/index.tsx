import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Spin, Table, Button, Tag, Statistic, Col, Modal } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import tableConfig from "./tableConfig";

const ImageLightBox = dynamic(
  () => import("@/components/image/ImageLightBox"),
  {
    loading: () => <Spin />,
  }
);

interface RecordOfUploadProps {
  author: string;
  createAt: string;
  eventId: string;
  eventName: string;
  images: any[];
  uploadId: string;
  date: string;
}

const RecordOfUpload = () => {
  const { data: session }: any = useSession();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [uploadDetail, setUploadDetail] = useState([] as RecordOfUploadProps[]);
  const [loading, setLoading] = useState(true);
  const [lengthInfo, setLengthInfo] = useState<{
    [key: string]: {
      allImageLength: number;
      featuredLength: number;
      removeImageLength: number;
    };
  }>({});

  const [isModalOpen, setModalOpen] = useState<{
    [key: string]: boolean;
  }>({});

  //TODO:跳窗 ：目前預設精選照片為時間排序前20張，再請編輯要顯示在首頁的精選照片歐

  const columnsRenderMap = {
    date: {
      render: (text: string) => <Tag>{text}</Tag>,
      sorter: (a: RecordOfUploadProps, b: RecordOfUploadProps) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      },
    },
    lastEditTime: {
      render: (text: string, _: any, key: number) => (
        <p key={key}>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },
    soldCount: {
      render: (text: number, record: RecordOfUploadProps) => (
        <Col className="flex gap-6">
          <Link
            href={`/photographer/uploadDetail?eventId=${
              record.eventId
            }&status=ALL&record=${JSON.stringify(record)}`}
            className="hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer"
          >
            <Statistic
              title="已上傳"
              value={length[record.eventId]?.allImageLength || 0}
              valueStyle={{ color: "#78350f" }}
              className="cursor-pointer"
            />
          </Link>
          <Link
            href={`/photographer/uploadDetail?eventId=${
              record.eventId
            }&status=ALL&record=${JSON.stringify(record)}`}
            className="hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer"
          >
            <Statistic
              title="從相簿移除"
              value={length[record.eventId]?.removeImageLength || 0}
              valueStyle={{ color: "#9ca3af" }}
              className="cursor-pointer"
            />
          </Link>
          <Link
            href={`/photographer/soldList?eventId=${record.eventId}`}
            className="hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer"
          >
            <Statistic
              title="售出張數"
              value={text}
              valueStyle={{ color: "#65a30d" }}
              className="cursor-pointer"
            />
          </Link>
          <Link
            href={`/photographer/featured?eventId=${record.eventId}`}
            className="hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer"
          >
            <Statistic
              title="精選照片"
              value={length[record.eventId]?.featuredLength || 0}
              className="cursor-pointer"
              valueStyle={{ color: "#fb923c" }}
            />
          </Link>
        </Col>
      ),
    },
    earning: {
      render: ({ soldImages }: any, record: any) => {
        const allImageLength = length[record.eventId]?.allImageLength || 0;
        const fee = (allImageLength * 0.2).toFixed(2);

        const flattenSoldImages = soldImages?.reduce((acc: any, cur: any) => {
          return acc.concat(cur.images);
        }, []);

        const revenue = flattenSoldImages
          ?.map((item: any) => item.price || 0)
          .reduce((acc: any, cur: any) => acc + cur, 0);

        const thirdPartyFee = flattenSoldImages
          ?.map((item: any) => {
            return Math.round((item.price || 0) * 0.03);
          })
          .reduce((acc: any, cur: any) => acc + cur, 0);

        const tableColumns = [
          {
            title: () => {
              return (
                <div>
                  <p>照片收益</p>
                  <p className="font-normal text-[#a3a3a3] text-xs">
                    賣出 {flattenSoldImages?.length} 張
                  </p>
                </div>
              );
            },
            dataIndex: "revenue",
            key: "revenue",
            width: 90,
            render: () => (
              <div>
                <p>{revenue} 元</p>
              </div>
            ),
          },
          {
            title: () => {
              return (
                <div>
                  <p>上傳服務費</p>
                  <p className="font-normal text-[#a3a3a3] text-xs">
                    上傳 {allImageLength}張 x 每張 0.2 元
                  </p>
                </div>
              );
            },
            dataIndex: "fee",
            key: "fee",
            render: () => <div>{fee} 元</div>,
          },
          {
            title: () => {
              return (
                <div>
                  <p>第三方金流手續費</p>
                  <p className="font-normal text-[#a3a3a3] text-xs">
                    賣出 {revenue} 元 x 3%
                  </p>
                </div>
              );
            },
            dataIndex: "thirdPartyFee",
            key: "thirdPartyFee",
            render: () => <div>{thirdPartyFee} 元</div>,
          },
        ];

        return (
          <>
            <div
              className="flex gap-2 justify-center hover:cursor-pointer"
              onClick={() =>
                setModalOpen((prev) => ({
                  ...prev,
                  [record.eventId]: true,
                }))
              }
            >
              <Statistic
                title="收入"
                value={Math.round(revenue - Number(fee) - thirdPartyFee) || 0}
                valueStyle={{ color: "#ef4444" }}
              />
              <InfoCircleOutlined className="text-[#06b6d4]" />
            </div>
            <Modal
              title={`收入明細 - ${record.eventName}`}
              onCancel={() =>
                setModalOpen((prev) => ({
                  ...prev,
                  [record.eventId]: false,
                }))
              }
              cancelButtonProps={{ style: { display: "none" } }}
              footer={null}
              onOk={() =>
                setModalOpen((prev) => ({
                  ...prev,
                  [record.eventId]: false,
                }))
              }
              open={isModalOpen[record.eventId]}
              className="w-[20%] mx-auto"
            >
              <Table
                columns={tableColumns as any}
                dataSource={[record]}
                pagination={false}
                className="my-6"
                footer={() => (
                  <div className="text-end">
                    <h6>
                      <Tag color="green">
                        總收益:{" "}
                        {Math.round(revenue - Number(fee) - thirdPartyFee) || 0}{" "}
                        元
                      </Tag>
                    </h6>
                  </div>
                )}
              />
            </Modal>
          </>
        );
      },
    },
    action: {
      render: (_: string, record: RecordOfUploadProps) => (
        <div className="flex gap-1" key={record.eventId}>
          <Link
            href={`/photographer/uploadDetail?eventId=${
              record.eventId
            }&record=${JSON.stringify(record)}`}
          >
            <Button>詳情</Button>
          </Link>
          <Link href={`/photographer/checkBibs?eventId=${record.eventId}`}>
            <Button>編輯照片</Button>
          </Link>
        </div>
      ),
    },
  };

  const columns = tableConfig(columnsRenderMap);

  useEffect(() => {
    if (session) getUploadLength();
  }, [session, uploadDetail]);
  useEffect(() => {
    if (session) getUploadDetail();
  }, [session]);

  const length = useMemo(() => {
    return {
      ...lengthInfo,
    };
  }, [lengthInfo]);

  const getUploadLength = () => {
    uploadDetail.forEach((record) => {
      fetch(
        `${domain}/api/images/getUploadImgDetail/${record.eventId}/${session.id}`
      )
        .then((res) => res.json())
        .then((data) => {
          setLengthInfo((prev) => ({
            ...prev,
            [record.eventId]: data,
          }));
        });
    });
  };

  const getUploadDetail = async () => {
    fetch(`${domain}/api/images/getUploadInfo/${session.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUploadDetail(data);
        setLoading(false);
      });
  };

  return !loading ? (
    <div>
      <Table columns={columns as any} dataSource={uploadDetail} />
    </div>
  ) : (
    <div className="flex justify-center items-center h-[80vh]">
      <Spin />
    </div>
  );
};

export default RecordOfUpload;
