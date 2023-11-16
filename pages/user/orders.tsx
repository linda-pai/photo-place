import { Spin, message, Button } from "antd";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { Table, Collapse, Tag } from "antd";
import { DownloadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import dayjs from "dayjs";
import PaymentInfo from "@/pages/components/PaymentInfoModal";

interface Order {
  orderId: number;
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

  const handleOnDownload = (orderId: any, item: any) => {
    console.log("item", item);
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
      })
      .catch((err) => {
        message.error("下載失敗");
      });
  };

  const columns: ColumnsType<Order> = [
    {
      title: "訂單編號",
      dataIndex: "orderId",
      key: "orderId",
      width: 140,
      ellipsis: true,
    },
    {
      title: "訂單成立時間",
      dataIndex: "createAt",
      key: "createAt",
      width: 120,
      render: (text) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"}</p>
      ),
    },

    {
      title: "訂購人",
      dataIndex: "orderBy",
      key: "orderBy",
      width: 100,
      ellipsis: true,
    },
    {
      title: "付款方式",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
    },

    {
      title: "訂單明細",
      dataIndex: "items",
      key: "items",
      width: 260,
      ellipsis: true,
      render: (_, { orderId, items, paidAt }, index) => (
        <div>
          <Collapse
            items={items.map((item) => ({
              key: item.id,
              label: item.id,
              children: (
                <>
                  <img src={item.watermarkedUrl} alt="" />
                  <Button
                    className="flex items-center mt-2"
                    onClick={() => handleOnDownload(orderId, item)}
                    disabled={!paidAt}
                  >
                    <p>下載原圖</p>
                    <DownloadOutlined />
                  </Button>
                </>
              ),
            }))}
            ghost
            className="truncate"
          />
        </div>
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
            <Tag color="green">已付款</Tag>
          ) : (
            <>
              <Tag color="volcano">未付款</Tag>
              <InfoCircleOutlined
                style={{ color: "#f46a58" }}
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
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      sortDirections: ["descend"],
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
    <div className="container mx-auto text-slate-600">
      <h1 className="text-center">orderList</h1>
      <div className="my-20"></div>
      {!loading ? (
        <div className="text-slate-600 w-full">
          <Table dataSource={orders} columns={columns} />
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
