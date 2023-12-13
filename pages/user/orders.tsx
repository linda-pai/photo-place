import { Spin, message, Button } from "antd";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Table, Modal, Tag, Space } from "antd";
import {
  DownloadOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import dayjs from "dayjs";
import copyToClipboard from "@/utils/copyToClipboard";
import paymentOptions from "@/utils/paymentOptions";
import useAuth from "@/hooks/useAuth";
import dynamic from "next/dynamic";

const PaymentInfo = dynamic(
  () => import("@/pages/components/PaymentInfoModal"),
  {
    ssr: false,
  }
);

interface Order {
  orderId: string;
  totalAmount: number;
  createAt: string;
  paidAt: string;
  paymentMethod: string;
  orderBy: string;
  items: CartDataProps[];
}

const orders = () => {
  const isLogin = useAuth();
  const { data: session }: any = useSession();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [currentOrder, setCurrentOrder] = useState({} as Order);

  const handleOnDownload = (orderId: any, item: any) => {
    fetch(`${domain}/api/images/download/${orderId}/${item.eventId}/${item.id}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.error) return message.error(result.error);
        const link = document.createElement("a");
        const fileName = "phohopacer_img_" + new Date() + ".jpg";

        link.href = result.url;
        link.download = fileName;
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        link.remove();

        message.success("下載成功");
      })
      .catch((err) => {
        message.error("下載失敗");
      });
  };

  const handleConfirm = (record: Order, item: CartDataProps) => {
    const { paidAt, orderId } = record;

    if (paidAt) return handleOnDownload(orderId, item);
    modal.confirm({
      title: "照片下載失敗",
      icon: <ExclamationCircleOutlined />,
      content: "訂單尚未付款，請先付款後再下載",
      okText: "確認",
      cancelButtonProps: { style: { display: "none" } },
    });
  };

  const handleOnDownloadAll = (record: Order) => {
    const { items } = record;
    items.forEach((item: any) => {
      handleConfirm(record, item);
    });
  };

  const columns: ColumnsType<Order> = [
    {
      title: "訂單編號",
      dataIndex: "orderId",
      key: "orderId",
      width: 140,
      ellipsis: true,
      render: (text, _, key) => (
        <a
          onClick={() => copyToClipboard(text)}
          className="cursor-pointer"
          key={key}
        >
          <CopyOutlined className="mr-2" />
          {text}
        </a>
      ),
    },
    {
      title: "訂單成立時間",
      dataIndex: "createAt",
      key: "createAt",
      width: 140,
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text, _, key) => (
        <p key={key}>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },
    {
      title: "訂單明細",
      dataIndex: "items",
      key: "items",
      width: 260,
      ellipsis: true,
      render: (_, record, index) => (
        <div key={index}>
          <div className="flex gap-2 overflow-scroll">
            {record.items.map((item) => (
              <div
                className="relative group cursor-pointer"
                key={item.id}
                onClick={() => handleConfirm(record, item)}
              >
                <div className="w-24">
                  <img
                    src={item.watermarkedUrl}
                    className="w-full object-contain"
                    alt={item.id}
                  />
                </div>
                <div className="group-hover:visible invisible">
                  <div className="bg-black opacity-50 absolute top-0 w-full h-full "></div>
                  <div className="animate-bounce z-20 text-white text-xl absolute top-[40%] left-[40%]">
                    <DownloadOutlined />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "付款方式",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      render: (text, _, key) => (
        <p key={key}>
          {paymentOptions.find((option) => option.value === text)?.label}
        </p>
      ),
    },
    {
      title: "款項狀態",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 120,
      render: (text, orderInfo, key) => (
        <div key={key}>
          {text ? (
            <Tag color="#B0B97A">已付款</Tag>
          ) : (
            <div
              onClick={() => {
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
    {
      title: "訂單金額",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 100,
      render: (totalAmount: number, _, key) => (
        <p key={key} className="text-center">
          TWD {totalAmount} 元
        </p>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 190,
      render: (_, record, key) => (
        // 這邊因為手機的全部下載功能會只下載到最後一張，所以先隱藏
        // 考慮 pharse2 用 zip 方式下載
        <>
          <Space className="sm:block hidden" size="small" key={key}>
            <Button
              onClick={() => handleOnDownloadAll(record)}
              className="flex items-center"
              disabled={!record.paidAt}
            >
              <div className="sm:block hidden">
                <DownloadOutlined />
              </div>
              下載全部
            </Button>
          </Space>
          <div className="sm:hidden block">
            {record.items.map((item) => (
              <Button
                onClick={() => handleConfirm(record, item)}
                className="flex items-center mb-1"
                disabled={!record.paidAt}
              >
                <div className="sm:block hidden">
                  <DownloadOutlined />
                </div>
                <p className="text-xs">
                  下載 {item.watermarkedUrl.split("-watermarked-")[1]}
                </p>
              </Button>
            ))}
          </div>
        </>
      ),
    },
  ];

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

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return isLogin ? (
    <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
      <h1 className="text-center text-2xl mb-8">訂單查詢</h1>
      {!loading ? (
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
            handleOk={handleOk}
            handleCancel={handleCancel}
            isModalOpen={isModalOpen}
            orderId={currentOrder.orderId}
            confirmBtnText="確認"
          />
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </div>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export default orders;
