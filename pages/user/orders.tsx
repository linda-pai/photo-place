import { Spin, message, Button } from "antd";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
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
import PaymentInfo from "@/pages/components/PaymentInfoModal";
import copyToClipboard from "@/utils/copyToClipboard";
import paymentOptions from "@/utils/paymentOptions";

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
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const handleOnDownload = (orderId: any, item: any) => {
    fetch(`${domain}/api/images/download/${orderId}/${item.eventId}/${item.id}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.error) return message.error(result.error);
        console.log("result", result);
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
      render: (text) => (
        <a onClick={() => copyToClipboard(text)} className="cursor-pointer">
          <CopyOutlined className="mr-2" />
          {text}
        </a>
      ),
    },
    {
      title: "訂單成立時間",
      dataIndex: "createAt",
      key: "createAt",
      width: 120,
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
    },
    {
      title: "訂單明細",
      dataIndex: "items",
      key: "items",
      width: 260,
      ellipsis: true,
      render: (_, record, index) => (
        <div>
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
      render: (text) => (
        <p>{paymentOptions.find((option) => option.value === text)?.label}</p>
      ),
    },
    {
      title: "款項狀態",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 120,
      render: (text) => (
        <p>
          {text ? (
            <Tag color="#B0B97A">已付款</Tag>
          ) : (
            <>
              <Tag color="#F49586">未付款</Tag>
              <InfoCircleOutlined
                style={{ color: "#F49586" }}
                onClick={showModal}
              />
            </>
          )}
        </p>
      ),
    },
    {
      title: "訂單金額",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 100,
      render: (totalAmount: number) => <p>TWD {totalAmount} 元</p>,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => handleOnDownloadAll(record)}
            className="flex items-center"
            disabled={!record.paidAt}
          >
            <DownloadOutlined />
            全部下載
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = () => {
    const userId = getCookie("userId");

    fetch(`${domain}/api/orders/getByUser/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
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

  console.log("orders", orders);

  return (
    <div className="container mx-auto text-slate-600 my-24">
      <h1 className="text-center text-2xl mb-8">訂單查詢</h1>
      {!loading ? (
        <div className="text-slate-600 w-full">
          <Table
            dataSource={orders}
            columns={columns}
            pagination={{
              pageSize: 20,
            }}
          />
          {contextHolder}
          <PaymentInfo
            handleOk={handleOk}
            handleCancel={handleCancel}
            isModalOpen={isModalOpen}
          />
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </div>
  );
};

export default orders;

export const getServerSideProps = async (context: any) => {
  const previousUrl = context.req.headers.referer;
  const isLogin = context.req.cookies["token"];

  if (!isLogin) {
    return {
      redirect: {
        destination: `/login?previousUrl=${previousUrl}`,
        permanent: false,
      },
    };
  } else {
    return {
      props: {},
    };
  }
};
