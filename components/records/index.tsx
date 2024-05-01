import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, Button, Tag, Statistic, Col, Modal, Progress } from "antd";
import {
  InfoCircleOutlined,
  ReloadOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import tableConfig from "./tableConfig";
import addWaterMarkAndDetect from "@/lib/upload/addWaterMarkAndDetect";
import debounce from "@/utils/debounce";
import isUploadable from "@/utils/isUploadable";
import { RecordOfUploadProps } from "@/types/interfaces/UploadProps";

const RecordOfUpload = ({
  uploadData,
  showHeader = true,
}: {
  uploadData: RecordOfUploadProps[];
  showHeader?: boolean;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const [uploadDetail, setUploadDetail] = useState(
    uploadData as RecordOfUploadProps[]
  );

  const [isModalOpen, setModalOpen] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    setUploadDetail(uploadData);
  }, [uploadData]);

  const imagesInfoComponent = (record: RecordOfUploadProps) => {
    return (
      <Col className="flex sm:gap-6 gap-2">
        <Link
          href={`/photographer/uploadDetail?eventId=${
            record.eventId
          }&status=ALL&record=${JSON.stringify(record)}`}
          className="hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer"
        >
          <Statistic
            title="已上傳"
            value={record?.allImageLength || 0}
            valueStyle={{ color: "#78350f" }}
            className="cursor-pointer"
          />
        </Link>
        <Link
          href={`/photographer/removed?eventId=${record.eventId}`}
          className={`hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer ${
            record.allImageLength > 0 ? "" : "pointer-events-none"
          }`}
        >
          <Statistic
            title="從相簿移除"
            value={record?.removeImageLength || 0}
            valueStyle={{ color: "#9ca3af" }}
            className="cursor-pointer"
          />
        </Link>
        <Link
          href={`/photographer/soldList?eventId=${record.eventId}`}
          className={`hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer ${
            record.allImageLength > 0 ? "" : "pointer-events-none"
          }`}
        >
          <Statistic
            title="售出張數"
            value={record.soldCount || 0}
            valueStyle={{ color: "#65a30d" }}
            className="cursor-pointer"
          />
        </Link>
        <Link
          href={`/photographer/featured?eventId=${record.eventId}`}
          className={`hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer ${
            record.allImageLength > 0 ? "" : "pointer-events-none"
          }`}
        >
          <Statistic
            title="精選照片"
            value={record?.featuredLength || 0}
            className="cursor-pointer"
            valueStyle={{ color: "#fb923c" }}
          />
        </Link>
      </Col>
    );
  };

  const earningsComponent = (record: RecordOfUploadProps) => {
    const allImageLength = record?.allImageLength || 0;
    const fee = (allImageLength * 0.2).toFixed(2);

    const flattenSoldImages = record.soldImages?.reduce(
      (acc: any, cur: any) => {
        return acc.concat(cur.images);
      },
      []
    );

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
                賣出 {flattenSoldImages?.length || 0} 張
              </p>
            </div>
          );
        },
        dataIndex: "revenue",
        key: "revenue",
        width: 90,
        render: () => (
          <div>
            <p>{revenue || 0} 元</p>
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
                賣出 {revenue || 0} 元 x 3%
              </p>
            </div>
          );
        },
        dataIndex: "thirdPartyFee",
        key: "thirdPartyFee",
        render: () => <div>{thirdPartyFee || 0} 元</div>,
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
                    {Math.round(revenue - Number(fee) - thirdPartyFee) || 0} 元
                  </Tag>
                </h6>
              </div>
            )}
          />
        </Modal>
      </>
    );
  };

  const columnsRenderMap = {
    rwd: {
      responsive: ["xs"],
      render: (_: any, record: RecordOfUploadProps, key: number) => (
        <div className="flex flex-col gap-1">
          <p className="">{record.eventName}</p>

          <p className="">{record.date}</p>
          <p className="">
            號碼布辨識進度：
            {record.detectedImageLength}/{record.allImageLength}
          </p>
          {imagesInfoComponent(record)}
          {earningsComponent(record)}
        </div>
      ),
    },
    eventName: {
      render: (text: string, record: RecordOfUploadProps) => (
        <Link
          href={`/events/${record.eventId}?bib=`}
          className="hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer"
        >
          {text}
        </Link>
      ),
      responsive: ["sm"],
    },
    date: {
      render: (text: string) => <Tag>{text}</Tag>,
      sorter: (a: RecordOfUploadProps, b: RecordOfUploadProps) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      },
      responsive: ["sm"],
    },
    detectProcess: {
      render: (text: string, record: RecordOfUploadProps) => {
        const isProcessing =
          record?.detectedImageLength !== record?.allImageLength;
        return (
          <div className="flex items-center">
            {isProcessing && (
              <Button
                onClick={() => handleReloadDetectProcess(record)}
                className="flex items-center mx-1"
                size="small"
              >
                <ReloadOutlined />
              </Button>
            )}
            <Progress
              percent={
                Math.round(
                  (record?.detectedImageLength / record?.allImageLength) * 100
                ) || 0
              }
              status={
                isProcessing
                  ? "active"
                  : record?.detectedImageLength === 0
                  ? "active"
                  : "success"
              }
              className="w-[80%]"
            />
          </div>
        );
      },
      responsive: ["sm"],
    },
    soldCount: {
      render: (text: number, record: RecordOfUploadProps) =>
        imagesInfoComponent(record),
      responsive: ["sm"],
    },
    earning: {
      render: (_: any, record: any) => earningsComponent(record),
      responsive: ["sm"],
    },
    ...(showHeader && {
      action: {
        render: (_: string, record: RecordOfUploadProps) => (
          <div key={record.eventId}>
            <Link
              href={`/photographer/checkBibs?eventId=${record.eventId}&date=${record.date}`}
              className={`${
                record.allImageLength > 0 ? "" : "pointer-events-none"
              }`}
            >
              <Button
                disabled={record.allImageLength === 0}
                className="flex items-center my-1"
              >
                <EditOutlined />
                編輯
              </Button>
            </Link>
            <Link
              href={`/uploadService/chooseEvent/upload?eventId=${record.eventId}`}
            >
              <Button
                disabled={!isUploadable(record.date)}
                className="flex items-center my-1"
              >
                <UploadOutlined />
                上傳
              </Button>
            </Link>
          </div>
        ),
      },
    }),
  };

  const columns = tableConfig(columnsRenderMap, showHeader);

  const getDetectProcess = debounce((record: RecordOfUploadProps) => {
    const { eventId, author } = record;
    fetch(
      `${domain}/api/photographer/getDetectedImageLength/${eventId}/${author}`
    )
      .then((res) => res.json())
      .then((data) => {
        setUploadDetail((prev) =>
          prev.map((item) =>
            item.eventId === eventId
              ? { ...item, detectedImageLength: data.detectedImageLength }
              : item
          )
        );
      });
  });

  const handleReloadDetectProcess = async (record: RecordOfUploadProps) => {
    const { eventId, author } = record;
    addWaterMarkAndDetect({
      eventId,
      author,
      isAll: false,
    });
    getDetectProcess(record);
  };

  return (
    <div>
      <Table
        columns={columns as any}
        dataSource={uploadDetail}
        showHeader={showHeader}
        pagination={showHeader ? { pageSize: 5 } : false}
      />
    </div>
  );
};

export default RecordOfUpload;
