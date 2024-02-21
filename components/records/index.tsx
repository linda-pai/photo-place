import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Spin, Table, Tag } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { CHARGE_PERCENTAGE } from "@/constants";
import tableConfig from "./tableConfig";

const PaymentInfo = dynamic(() => import("@/components/PaymentInfoModal"), {
  loading: () => <Spin />,
});

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
  imagesCount: number;
  chargeAt: string;
  uploadId: string;
}

const RecordOfUpload = () => {
  const { data: session }: any = useSession();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [uploadDetail, setUploadDetail] = useState([] as RecordOfUploadProps[]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({} as RecordOfUploadProps);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImg, setCurrImg] = useState(0); // [0, images.length - 1
  const [currList, setCurrList] = useState([]);

  const columnsRenderMap = {
    createAt: {
      render: (text: string, _: any, key: number) => (
        <p key={key}>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },
    imagesCount: {
      render: (text: string, uploadInfo: any, key: number) => (
        <>
          <p>{text}張</p>
          <a
            href={`/events/${uploadInfo.eventId}?uploadId=${uploadInfo.uploadId}`}
            key={key}
          >
            預覽
          </a>
        </>
      ),
    },
    sellInfo: {
      render: (_: string, { sellInfo }: any, index: number) => (
        <div
          className="max-w-[200px]"
          onClick={() => {
            setCurrList(sellInfo);
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
    chargeAt: {
      render: (text: string, uploadInfo: any, key: number) => (
        <div key={key}>
          {text ? (
            <Tag color="#B0B97A">已付款</Tag>
          ) : (
            <div
              onClick={() => {
                showModal();
                const refinedUploadInfo = {
                  ...uploadInfo,
                  eventName: uploadInfo.eventName,
                  orderId: uploadInfo.uploadId,
                  totalAmount: Math.ceil(
                    uploadInfo.imagesCount *
                      uploadInfo.price *
                      CHARGE_PERCENTAGE
                  ),
                  items: [
                    {
                      eventName: uploadInfo.eventName,
                      author: uploadInfo.author,
                      price: Math.ceil(
                        uploadInfo.imagesCount *
                          uploadInfo.price *
                          CHARGE_PERCENTAGE
                      ),
                      id: "uploadId" + "_" + uploadInfo.uploadId,
                    },
                  ],
                };
                setCurrentOrder(refinedUploadInfo);
              }}
              className="hover:cursor-pointer"
            >
              <Tag color="#f0cf02">未付款</Tag>
              <InfoCircleOutlined style={{ color: "#f0cf02" }} />
            </div>
          )}
        </div>
      ),
    },
  };

  const columns = tableConfig(columnsRenderMap);

  useEffect(() => {
    if (session) getUploadDetail();
  }, [session]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const getUploadDetail = async () => {
    fetch(`${domain}/api/images/getUploadInfo/${session.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUploadDetail(data);
        setLoading(false);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const gotoPrevious = () => {
    currImg > 0 && setCurrImg(currImg - 1);
  };
  const gotoNext = () => {
    currImg + 1 < currList.length && setCurrImg(currImg + 1);
  };

  return !loading ? (
    <div>
      <Table columns={columns} dataSource={uploadDetail} />
      <PaymentInfo
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
        confirmBtnText="確認"
        paymentMethod={0}
        currentOrder={currentOrder}
        modelDescription="付款完成後即可發布照片，是否要前往付款?"
      />
      <ImageLightBox
        images={currList}
        isOpen={showImageViewer}
        curIndex={currImg}
        onClose={() => setShowImageViewer(false)}
        onPrev={gotoPrevious}
        onNext={gotoNext}
      />
    </div>
  ) : (
    <div className="flex justify-center items-center h-[80vh]">
      <Spin />
    </div>
  );
};

export default RecordOfUpload;
