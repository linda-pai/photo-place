import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Table, Spin, Space, Button, Tag, Modal, message } from "antd";
import {
  DownloadOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import copyToClipboard from "@/utils/copyToClipboard";
import paymentOptions from "@/utils/paymentOptions";
import downloadImage from "@/utils/downloadImage";
import tableConfig from "./tableConfig";

const PaymentInfo = dynamic(() => import("@/components/PaymentInfoModal"), {
  loading: () => <Spin />,
});

const ImageItemDisplay = dynamic(
  () => import("@/components/orders/ImageItemDisplay"),
  {
    loading: () => <Spin />,
  }
);

interface Order {
  orderId: string;
  totalAmount: number;
  createAt: string;
  paidAt: string;
  paymentMethod: number;
  orderBy: string;
  items: CartDataProps[];
}

const Orders = () => {
  const { data: session }: any = useSession();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [currentOrder, setCurrentOrder] = useState({} as Order);

  const columnsRenderMap = {
    orderId: {
      ellipsis: true,
      render: (text: string, _: any, key: number) => (
        <a
          onClick={() => copyToClipboard(text)}
          className="cursor-pointer"
          key={key}
          title="複製訂單編號"
        >
          <CopyOutlined className="mr-2" />
          {text}
        </a>
      ),
    },
    createAt: {
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text: string, _: any, key: number) => (
        <p key={key}>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },
    items: {
      ellipsis: true,
      render: (_: string, record: any, index: number) => (
        <div key={index}>
          <div className="flex gap-2 overflow-scroll">
            {record.items.map((item: any, key: number) => (
              <ImageItemDisplay
                item={item}
                onClick={() => handleClickImage(record, key)}
                key={key}
              />
            ))}
          </div>
        </div>
      ),
    },
    paymentMethod: {
      render: (text: string, orderInfo: any, key: number) => (
        <p key={key}>
          {paymentOptions.find((option: any) => option.value === text)?.label}
        </p>
      ),
    },
    paidAt: {
      render: (text: string, orderInfo: any, key: number) => (
        <div key={key}>
          {text ? (
            <Tag color="#B0B97A">已付款</Tag>
          ) : (
            <div
              onClick={() => {
                if (orderInfo.paidAt) return;
                showModal();
                setCurrentOrder(orderInfo);
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
    totalAmount: {
      render: (totalAmount: number, _: any, key: number) => (
        <p key={key} className="text-center">
          TWD {totalAmount} 元
        </p>
      ),
    },
    action: {
      render: (_: any, record: any, key: number) => (
        <>
          <Space size="small" key={key}>
            <Button
              onClick={() => getImagesZip(record)}
              className="flex items-center"
              disabled={!record.paidAt}
            >
              <div className="sm:block hidden">
                <DownloadOutlined />
              </div>
              下載全部
            </Button>
          </Space>
        </>
      ),
    },
  };

  const columns = tableConfig(columnsRenderMap);

  useEffect(() => {
    if (session) getOrders();
  }, [session]);

  const getOrders = () => {
    fetch(`${domain}/api/orders/getByUser/${session.id}`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setOrders(data);
        return data;
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const getImagesZip = async (record: any) => {
    setLoading(true);

    try {
      const imageList = await getImageDownloadInfo(record);

      const url = `${
        process.env.NEXT_PUBLIC_APP_URL
      }/api/imageZip?imageList=${JSON.stringify(imageList)}`;

      downloadImage(url);
      setLoading(false);
    } catch {
      message.error("下載失敗");
      setLoading(false);
    }
  };

  const handleOnDownload = async (record: any, key: number) => {
    setLoading(true);
    const imageList = await getImageDownloadInfo(record);

    try {
      const url = imageList[key].url;
      downloadImage(url);
      setLoading(false);
      message.success("下載成功");
    } catch {
      setLoading(false);
      message.error("下載失敗");
    }
  };

  const handleClickImage = (record: Order, key: number) => {
    const { paidAt } = record;
    if (paidAt) return handleOnDownload(record, key);
    modal.confirm({
      title: "照片下載失敗",
      icon: <ExclamationCircleOutlined />,
      content: "訂單尚未付款，請先付款後再下載",
      okText: "確認",
      cancelButtonProps: { style: { display: "none" } },
    });
  };

  const getImageDownloadInfo = async (record: Order) => {
    const { items, orderId } = record;

    const imageIdList = items.map((item: any) => item.id);
    const eventId = items[0].eventId;

    return await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/images/getByEventIdAndImageIds/${orderId}/${eventId}/${imageIdList}`
    )
      .then((res) => res.json())
      .then((result) => result)
      .catch((err) => {
        message.error("下載失敗");
      });
  };

  return !loading ? (
    <div className="text-slate-600 sm:mx-0 mx-4">
      <Table
        dataSource={orders}
        columns={columns}
        pagination={{
          pageSize: 10,
          position: ["bottomCenter"],
        }}
      />
      {contextHolder}
      <PaymentInfo
        handleCancel={handleCancel}
        isModalOpen={isModalOpen}
        confirmBtnText="確認"
        paymentMethod={currentOrder.paymentMethod}
        currentOrder={currentOrder}
        modelDescription="付款完成後即可下載照片，是否要前往付款?"
      />
    </div>
  ) : (
    <div className="flex justify-center items-center h-[80vh]">
      <Spin />
    </div>
  );
};

export default Orders;
