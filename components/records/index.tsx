import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Table,
  Button,
  Tag,
  Statistic,
  Col,
  Progress,
  message,
  Popover,
  Spin,
} from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { sha256 } from "js-sha256";
import tableConfig from "./tableConfig";
import addWaterMarkAndDetect from "@/lib/upload/addWaterMarkAndDetect";
import debounce from "@/utils/debounce";
import isUploadable from "@/utils/isUploadable";
import { RecordOfUploadProps } from "@/types/interfaces/UploadProps";
import dynamic from "next/dynamic";

const Earnings = dynamic(() => import("./Earnings"), {
  loading: () => <Spin />,
});

const RecordOfUpload = ({
  uploadData,
  showHeader = true,
}: {
  uploadData: RecordOfUploadProps[];
  showHeader?: boolean;
}) => {
  const { data: session }: any = useSession();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const [uploadDetail, setUploadDetail] = useState(
    uploadData as RecordOfUploadProps[]
  );

  useEffect(() => {
    setUploadDetail(uploadData);
  }, [uploadData]);

  const imagesInfoComponent = (record: RecordOfUploadProps) => {
    const recordData = {
      eventName: record.eventName,
      name: record.name,
      date: record.date,
      createAt: record.createAt,
      allImageLength: record.allImageLength,
    };
    return (
      <Col className="flex justify-evenly sm:gap-6 gap-2">
        <Link
          href={`/photographer/uploadDetail?eventId=${
            record.eventId
          }&status=ALL&record=${JSON.stringify(recordData)}`}
          className="hover:bg-[#e7e5e4] p-1 rounded-md cursor-pointer"
        >
          <Statistic
            title="已上傳"
            value={record?.allImageLength || 0}
            valueStyle={{ color: "#78350f" }}
            className="cursor-pointer"
          />
        </Link>
        <Link
          href={`/photographer/noneDetected?eventId=${record.eventId}&date=${record.date}`}
          className="hover:bg-[#e7e5e4] p-1 rounded-md cursor-pointer"
        >
          <Statistic
            title="無法辨識"
            value={record?.emptyPathImageLength || 0}
            valueStyle={{ color: "#b45309" }}
            className="cursor-pointer"
          />
        </Link>
        <Link
          href={`/photographer/removed?eventId=${record.eventId}&date=${record.date}&reportedImageLength=${record.reportedImageLength}`}
          className={`hover:bg-[#e7e5e4] p-1 rounded-md cursor-pointer ${
            record.allImageLength > 0 ? "" : "pointer-events-none"
          }`}
        >
          <Statistic
            title="已移除"
            value={record?.removeImageLength || 0}
            valueStyle={{ color: "#9ca3af" }}
            className="cursor-pointer"
          />
        </Link>
        <Link
          href={`/photographer/soldList?eventId=${record.eventId}`}
          className={`hover:bg-[#e7e5e4] p-1 rounded-md cursor-pointer ${
            record.allImageLength > 0 ? "" : "pointer-events-none"
          }`}
        >
          <Statistic
            title="已售出"
            value={record.soldCount || 0}
            valueStyle={{ color: "#65a30d" }}
            className="cursor-pointer"
          />
        </Link>
        <Link
          href={`/photographer/featured?eventId=${record.eventId}&date=${record.date}`}
          className={`hover:bg-[#e7e5e4] p-1 rounded-md cursor-pointer ${
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

  const popOverContent = (record: any) => (
    <div>
      <div className="mb-2">
        <Link
          href={`/events/${record.eventId}?bib=&photoBy=${record.author}`}
          className="hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer"
        >
          我的照片
        </Link>
      </div>
      <div className="">
        <Link
          href={`/events/${record.eventId}?bib=&photoBy=`}
          className="hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer"
        >
          全部照片
        </Link>
      </div>
    </div>
  );

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
          <Earnings record={record} />
        </div>
      ),
    },
    eventName: {
      render: (text: string, record: RecordOfUploadProps) => (
        <Popover content={popOverContent(record)} trigger="hover">
          <div className="hover:bg-[#e7e5e4] p-2 rounded-md cursor-pointer">
            {text}
          </div>
        </Popover>
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
      render: (_: any, record: any) => <Earnings record={record} />,
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
      `${domain}/api/photographer/getDetectedImageLength/${eventId}/${author}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.id,
          secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
        },
      }
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
        message.success("號碼布辨識進度已更新");
      });
  });

  const handleReloadDetectProcess = async (record: RecordOfUploadProps) => {
    const { eventId, author } = record;
    addWaterMarkAndDetect({
      eventId,
      author,
      isAll: false,
    }).then(() => {
      message.success("號碼布辨識已重新啟動");
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
