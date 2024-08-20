import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Table, Spin, Space, Button, Tag, Modal, message, Badge } from "antd";
import {
  DownloadOutlined,
  CreditCardOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { sha256 } from "js-sha256";
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

const GenGifModal = dynamic(() => import("@/components/orders/GenGifModal"), {
  loading: () => <Spin />,
});

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
  const [isGenGifModalOpen, setIsGenGifModalOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [currentOrder, setCurrentOrder] = useState({} as Order);

  const columnsRenderMap = {
    rwd: {
      responsive: ["xs"],
      render: (_: any, record: any, key: number) => (
        <div className="flex flex-col gap-1">
          <p className="">訂單編號：{record.orderId}</p>

          <p className="">
            訂單時間：
            {record.createAt
              ? dayjs(record.createAt).format("YYYY-MM-DD HH:mm")
              : "-"}
          </p>

          <p className="">訂單金額：TWD {record.totalAmount} 元</p>

          <div className="flex gap-1 items-center">
            <p>
              付款方式：
              {
                paymentOptions.find(
                  (option: any) => option.value === record.paymentMethod
                )?.label
              }
            </p>
            <div>
              {record.paidAt ? (
                <Tag color="#B0B97A">已付款</Tag>
              ) : (
                <Tag color="#f0cf02">未付款</Tag>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-scroll mt-2">
            {record.items.map((item: any, key: number) => (
              <ImageItemDisplay
                item={item}
                onClick={() => handleClickImage(record, item.id)}
                key={key}
              />
            ))}
          </div>
        </div>
      ),
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateA.getTime() - dateB.getTime();
      },
    },
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
      responsive: ["sm"],
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
      responsive: ["sm"],
    },
    items: {
      ellipsis: true,
      render: (_: string, record: any, index: number) => (
        <div key={index}>
          <div className="flex gap-2 overflow-scroll">
            {record.items.map((item: any, key: number) => (
              <ImageItemDisplay
                item={item}
                onClick={() => handleClickImage(record, item.id)}
                key={key}
              />
            ))}
          </div>
        </div>
      ),
      responsive: ["sm"],
    },
    paymentMethod: {
      render: (text: string, orderInfo: any, key: number) => (
        <p key={key}>
          {paymentOptions.find((option: any) => option.value === text)?.label}
        </p>
      ),
      responsive: ["sm"],
    },
    paidAt: {
      render: (text: string, orderInfo: any, key: number) => (
        <div key={key}>
          {text ? (
            <Tag color="#B0B97A">已付款</Tag>
          ) : (
            <div>
              <Tag color="#f0cf02">未付款</Tag>
            </div>
          )}
        </div>
      ),
      responsive: ["sm"],
    },
    totalAmount: {
      render: (totalAmount: number, _: any, key: number) => (
        <p key={key} className="text-center">
          TWD {totalAmount} 元
        </p>
      ),
      responsive: ["sm"],
    },
    action: {
      render: (_: any, orderInfo: any, key: number) => (
        <>
          {orderInfo.paidAt ? (
            <Space size="small" key={key}>
              <Button
                onClick={() => getImagesZip(orderInfo)}
                className="flex items-center"
                disabled={!orderInfo.paidAt}
              >
                <div className="sm:block hidden">
                  <DownloadOutlined />
                </div>
                下載全部
              </Button>
            </Space>
          ) : (
            <Space size="small" key={key}>
              <Button
                onClick={() => {
                  if (orderInfo.paidAt) return;
                  showModal();
                  setCurrentOrder(orderInfo);
                }}
                className="flex items-center bg-[color:var(--main-color-dark)] text-white"
              >
                <div className="sm:block hidden mr-1">
                  <CreditCardOutlined />
                </div>
                前往付款
              </Button>
            </Space>
          )}
        </>
      ),
    },
  };

  const columns = tableConfig(columnsRenderMap);

  useEffect(() => {
    if (session && orders.length === 0) getOrders();
  }, [session]);

  const getOrders = () => {
    fetch(`${domain}/api/orders/getByUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.id,
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
    })
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

  const handleGenGifCancel = () => {
    setIsGenGifModalOpen(false);
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

  const handleOnDownload = async (record: any, id: string) => {
    setLoading(true);
    const imageList = await getImageDownloadInfo(record);

    try {
      const url = imageList.find((item: any) => item.id === id).url;
      downloadImage(url);
      setLoading(false);
      message.success("下載成功");
    } catch {
      setLoading(false);
      message.error("下載失敗");
    }
  };

  const handleClickImage = (record: Order, id: string) => {
    const { paidAt } = record;
    if (paidAt) return handleOnDownload(record, id);
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
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/getByEventIdAndImageIds`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.id,
          secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
        },
        body: JSON.stringify({ orderId, eventId, imageIdList }),
      }
    )
      .then((res) => res.json())
      .then((result) => result)
      .catch((err) => {
        message.error("下載失敗");
      });
  };

  return !loading ? (
    <div className="text-slate-600 sm:mx-0 mx-2">
      <div className="flex justify-end my-4 mx-5">
        <Badge count="new" offset={[-2, 2]}>
          <Button
            onClick={() => setIsGenGifModalOpen(true)}
            className="flex items-center mt-1"
          >
            <div className="sm:block hidden">
              <PlayCircleOutlined />
            </div>
            &nbsp;製作GIF
          </Button>
        </Badge>
      </div>
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
        currentOrder={currentOrder}
        modelDescription="付款完成後即可下載照片，是否要前往付款?"
      />
      {isGenGifModalOpen && (
        <GenGifModal
          isModalOpen={isGenGifModalOpen}
          handleCancel={handleGenGifCancel}
        />
      )}
    </div>
  ) : (
    <div className="flex justify-center items-center h-[80vh]">
      <Spin />
    </div>
  );
};

export default Orders;
