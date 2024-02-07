import { Spin, message, Button } from "antd";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
import downloadImage from "@/utils/downloadImage";
import useAuth from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useIsMobile";
import handleNewebPay from "@/lib/payment/handleNewebPay";
import handleLinePay from "@/lib/payment/handleLinePay";
import dynamic from "next/dynamic";

const PaymentInfo = dynamic(() => import("@/components/PaymentInfoModal"), {
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

const orders = () => {
  const isLogin = useAuth();
  const isMobile = useIsMobile();

  const { data: session }: any = useSession();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [currentOrder, setCurrentOrder] = useState({} as Order);

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
          title="複製訂單編號"
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
            {record.items.map((item, key) => (
              <div
                className="relative group cursor-pointer"
                key={item.id}
                onClick={() => handleClickImage(record, key)}
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
      render: (text, orderInfo, key) => (
        <p key={key}>
          {orderInfo.paidAt
            ? paymentOptions.find((option) => option.value === text)?.label
            : "-"}
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
      width: 120,
      render: (_, record, key) => (
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

  const handleOk = async (paymentValue: number) => {
    setIsModalOpen(false);
    setCurrentOrder((prev) => ({ ...prev, paymentMethod: paymentValue }));

    const { orderId, totalAmount, items } = currentOrder;
    switch (paymentValue) {
      case 2:
        //  LinePay
        const LineData = {
          orderId,
          totalAmount,
          items,
          isMobile,
        };
        const LineRes = await handleLinePay(LineData);
        if (LineRes.status === "success") {
          try {
            if (isMobile) {
              router.push(LineRes.result?.app);
              setTimeout(() => {
                router.push("/user/orders");
              }, 1000);
            } else {
              router.push(LineRes.result?.web);
            }
          } catch (err) {
            message.error("LinePay扣款失敗, 請稍後再試");
          }
        } else {
          message.error("LinePay扣款失敗, 請稍後再試");
        }
        break;
      case 3:
        // 藍新金流
        const orderData = {
          orderId,
          totalAmount,
          items,
          email: session.user.email,
        };
        try {
          await handleNewebPay(orderData);
        } catch (err) {
          message.error("藍新金流扣款失敗, 請稍後再試");
        }
        break;
    }
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
            confirmBtnText="確認"
            paymentMethod={currentOrder.paymentMethod}
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
