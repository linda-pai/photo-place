import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Divider,
  Space,
  Radio,
  RadioChangeEvent,
  Button,
  message,
  Spin,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { v4 as uuidv4 } from "uuid";
import ImgsViewer from "react-images-viewer";

import { CartDataProps } from "@/types/interfaces/CartDataProps";
import paymentOptions from "@/utils/paymentOptions";
import useAuth from "@/hooks/useAuth";

const PaymentInfo = dynamic(
  () => import("@/pages/components/PaymentInfoModal"),
  {
    loading: () => <Spin />,
  }
);

interface CardDataProps {
  eventId: number;
  watermarkedUrl: string;
  id: string;
  price: number;
}

const checkout = () => {
  const isLogin = useAuth();
  const { data: session }: any = useSession();

  const orderId = "ord-" + uuidv4().substring(0, 12);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const router = useRouter();

  const [checkoutData, setCheckoutData] = useState([] as any);
  const [paymentValue, setPaymentValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImg, setCurrImg] = useState(0); // [0, images.length - 1

  const columns: ColumnsType<CardDataProps> = [
    {
      title: "活動名稱",
      dataIndex: "eventName",
      key: "eventName",
      width: 120,
    },
    {
      title: "預覽",
      dataIndex: "watermarkedUrl",
      key: "watermarkedUrl",
      width: 80,
      render: (url: string, record) => (
        <img
          className="w-20 cursor-pointer"
          src={url}
          alt={record.id}
          onClick={() => handleClickImg(record.id)}
        />
      ),
    },
    {
      title: "價格",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number) => <p>TWD {price} 元</p>,
    },
  ];

  useEffect(() => {
    const checkoutData = JSON.parse(getCookie("checkoutData") || "[]");
    setCheckoutData(checkoutData);
    setLoading(false);
  }, []);

  const fee =
    paymentOptions.find((option) => option.value === paymentValue)?.fee || 0;

  const total = checkoutData
    ?.map((item: CartDataProps) => Number(item.price))
    .reduce((a: string, b: string) => a + b, 0);

  const onChange = (e: RadioChangeEvent) => {
    setPaymentValue(e.target.value);
  };

  const createOrder = async () => {
    setLoading(true);
    //成立訂單
    if (session)
      fetch(`${domain}/api/orders/add`, {
        method: "POST",
        body: JSON.stringify({
          orderId,
          paymentMethod: paymentValue,
          totalAmount: total + fee,
          items: checkoutData,
          orderBy: session.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.status === 200) {
            message.success("訂單建立成功");

            const currentCart = JSON.parse(getCookie("cart") || "{}");
            setCookie(
              "cart",
              JSON.stringify({
                ...currentCart,
                [checkoutData[0]?.eventId]: Object.values(currentCart)
                  .flat()
                  .filter(
                    (item: any) =>
                      !checkoutData.map((item: any) => item.id).includes(item)
                  ),
              }),
              {
                expires: new Date(
                  new Date().setFullYear(new Date().getFullYear() + 1)
                ),
              }
            );
            deleteCookie("checkoutData");
            router.push("/user/orders");
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log("err", err);
          message.error("訂單建立失敗, 請稍後再試");
        });
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    createOrder();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImg(checkoutData.findIndex((item: any) => item.id === id));
  };

  return isLogin ? (
    <>
      <div className="container sm:px-4 px-0 mx-auto my-24 text-[color:var(--main-color-dark)] sm:w-[70%] w-[90%]">
        <h1 className="text-center text-2xl mb-10">訂單明細</h1>
        <h3 className="text-end my-4 text-sm">
          訂單狀態： <Tag color="gold">尚未建立</Tag>
        </h3>
        {!loading ? (
          <>
            <div>
              <Table
                pagination={false}
                dataSource={checkoutData}
                columns={columns}
                footer={() => (
                  <div className="flex justify-center">
                    <div className=" text-[color:var(--main-color-dark)]">
                      <div className=" text-[color:var(--main-color-light)]">
                        訂購內容：電子檔共 {checkoutData.length} 張
                      </div>
                      <div>
                        付款方式：
                        {
                          paymentOptions.find(
                            (option) => option.value === paymentValue
                          )?.label
                        }
                      </div>
                      <b>總金額：TWD {total + fee} 元</b>
                    </div>
                  </div>
                )}
              />
              <Divider />

              <div className="flex justify-center">
                <Radio.Group onChange={onChange} value={paymentValue}>
                  <Space direction="vertical">
                    {paymentOptions.map((option: any, key: number) => (
                      <Radio
                        value={option.value}
                        disabled={option.disabled}
                        key={key}
                      >
                        {option.label}
                        {option?.extension && paymentValue === option.value
                          ? option?.extension
                          : null}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </div>
            </div>

            <div className="flex justify-center my-8">
              <Button
                onClick={showModal}
                className="text-[color:var(--main-color-dark)]"
              >
                確認結帳
              </Button>
            </div>
            <PaymentInfo
              handleOk={handleOk}
              handleCancel={handleCancel}
              isModalOpen={isModalOpen}
              orderId={orderId}
              confirmBtnText="建立訂單"
            />
            <ImgsViewer
              imgs={checkoutData.map((item: any) => ({
                src: item.watermarkedUrl,
              }))}
              isOpen={showImageViewer}
              currImg={currImg}
              onClickPrev={() => setCurrImg((prev) => prev - 1)}
              onClickNext={() => setCurrImg((prev) => prev + 1)}
              onClose={() => setShowImageViewer(false)}
              onClickThumbnail={(index: number) => setCurrImg(index)}
              showThumbnails={true}
            />
          </>
        ) : (
          <Spin className="mx-auto my-[40vh] w-full" size="large" />
        )}
      </div>
    </>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};
export default checkout;
