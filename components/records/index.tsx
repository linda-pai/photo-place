import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Spin, Table, Button } from "antd";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import tableConfig from "./tableConfig";

const ImageDetail = dynamic(
  () => import("@/components/orderList/ImageDetail"),
  {
    loading: () => <Spin />,
  }
);

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
  chargeAt: string;
  uploadId: string;
  isReleased: boolean;
}

const RecordOfUpload = () => {
  const { data: session }: any = useSession();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [uploadDetail, setUploadDetail] = useState([] as RecordOfUploadProps[]);
  const [loading, setLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImg, setCurrImg] = useState(0); // [0, images.length - 1
  const [currList, setCurrList] = useState([]);

  const columnsRenderMap = {
    createAt: {
      render: (text: string, _: any, key: number) => (
        <p key={key}>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },
    sellInfo: {
      render: (_: string, { sellInfo }: any, index: number) => (
        <div
          className="max-w-[200px]"
          onClick={() => {
            sellInfo && setCurrList(sellInfo);
          }}
        >
          <ImageDetail
            items={sellInfo}
            index={index}
            handleImageClick={() => setShowImageViewer(true)}
          />
        </div>
      ),
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
            <Button>號碼布檢查</Button>
          </Link>
        </div>
      ),
    },
  };

  const columns = tableConfig(columnsRenderMap);

  useEffect(() => {
    if (session) getUploadDetail();
  }, [session]);

  const getUploadDetail = async () => {
    fetch(`${domain}/api/images/getUploadInfo/${session.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUploadDetail(data);
        setLoading(false);
      });
  };

  const gotoPrevious = () => {
    currImg > 0 && setCurrImg(currImg - 1);
  };
  const gotoNext = () => {
    currImg + 1 < currList.length && setCurrImg(currImg + 1);
  };

  return !loading ? (
    <div>
      <Table columns={columns as any} dataSource={uploadDetail} />
      {/* TODO:待評估是否要先付款（有收益才扣服務費則不需要） */}
      {/* <PaymentInfo
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
        confirmBtnText="確認"
        paymentMethod={0}
        currentOrder={currentOrder}
        modelDescription="付款完成後即可發佈照片，是否要前往付款?"
      /> */}
      <ImageLightBox
        images={currList}
        isOpen={showImageViewer}
        curIndex={currImg}
        onClose={() => setShowImageViewer(false)}
        onPrev={gotoPrevious}
        onNext={gotoNext}
        customFooter={null}
      />
    </div>
  ) : (
    <div className="flex justify-center items-center h-[80vh]">
      <Spin />
    </div>
  );
};

export default RecordOfUpload;
