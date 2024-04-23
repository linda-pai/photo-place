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

  const columnsRenderMap = {
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
    },
    images: {
      ellipsis: true,
      render: (_: string, { images }: any, index: number) => (
        <ImageDetail items={images} index={index} />
      ),
    },
    totalAmount: {
      render: (text: number, record: SoldImagesProps, index: number) =>
        record.images.map((item: any) => item.price).reduce((a, b) => a + b),
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
