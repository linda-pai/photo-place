import React, { useEffect, useState } from "react";
import { Table, Spin } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  SoldImagesProps,
  SoldImageItemProps,
} from "@/types/interfaces/CartDataProps";
import copyToClipboard from "@/utils/copyToClipboard";
import tableConfig from "./tableConfig";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const ImageDetail = dynamic(
  () => import("@/components/orderList/ImageDetail"),
  {
    loading: () => <Spin />,
  }
);

const SoldList = ({ eventId }: { eventId: string }) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const { data: session }: any = useSession();

  const [soldInfoData, setSoldInfoData] = useState<SoldImageItemProps>(
    {} as SoldImageItemProps
  );
  const [loading, setLoading] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState<{
    [key: string]: boolean;
  }>({});
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1

  const handleClickImg = (images: any, orderId: string) => {
    setShowImageViewer((prev) => ({ ...prev, [orderId]: true }));
    setCurrImgIndex(images.findIndex((item: any) => item.id === images[0].id));
  };

  const columnsRenderMap = {
    rwd: {
      responsive: ["xs"],
      render: (text: string, record: SoldImagesProps) => (
        <div className="flex flex-col gap-1">
          <p className="">訂單編號：{record.orderId}</p>

          <p className="">
            交易完成時間
            {record.soldAt
              ? dayjs(record.soldAt).format("YYYY-MM-DD HH:mm")
              : "-"}
          </p>

          <p className="">
            總金額：
            {record.images
              .map((item: any) => item.price)
              .reduce((a, b) => a + b)}{" "}
            元
          </p>
        </div>
      ),
    },

    orderId: {
      ellipsis: true,
      render: (text: string) => (
        <a
          onClick={() => copyToClipboard(text)}
          className="cursor-pointer"
          title="複製訂單編號"
        >
          <CopyOutlined className="mr-2" />
          {text}
        </a>
      ),
      responsive: ["sm"],
    },
    soldAt: {
      sorter: (a: SoldImagesProps, b: SoldImagesProps) => {
        const dateA = new Date(a.soldAt);
        const dateB = new Date(b.soldAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text: string) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
      responsive: ["sm"],
    },
    images: {
      ellipsis: true,
      render: (_: string, { images, orderId }: any, index: number) => (
        <>
          <ImageDetail
            images={images}
            isOpen={showImageViewer[orderId] || false}
            onClose={() =>
              setShowImageViewer((prev) => ({ ...prev, [orderId]: false }))
            }
            currImg={currImgIndex}
            handleClickImg={() => handleClickImg(images, orderId)}
          />
        </>
      ),
    },
    totalAmount: {
      render: (text: number, record: SoldImagesProps, index: number) =>
        record.images.map((item: any) => item.price).reduce((a, b) => a + b),
      responsive: ["sm"],
    },
  };

  const columns = tableConfig(columnsRenderMap);

  const getSoldData = (eventId: string) => {
    fetch(
      `${domain}/api/photographer/getSoldInfoByAuthor/${eventId}/${session.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSoldInfoData(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!session || !eventId) return;
    getSoldData(eventId);
  }, [eventId, session]);

  return (
    <div className="container mx-auto my-24 text-slate-600">
      <h1 className="text-center text-2xl mb-6">售出照片資訊</h1>
      <h2 className="text-center text-xl mb-2">{soldInfoData.date}</h2>
      <h2 className="text-center text-xl mb-10">{soldInfoData.eventName}</h2>

      <div>
        <Table
          dataSource={soldInfoData.soldImages}
          columns={columns as any}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default SoldList;
