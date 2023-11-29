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
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { getCookie } from "cookies-next";

import { CartDataProps } from "@/types/interfaces/CartDataProps";
import paymentOptions from "@/utils/paymentOptions";
import dynamic from "next/dynamic";

const PaymentInfo = dynamic(
  () => import("@/pages/components/PaymentInfoModal"),
  {
    ssr: false,
  }
);

interface CardDataProps {
  eventId: number;
  watermarkedUrl: string;
  id: string;
  price: number;
}

const checkout = () => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const router = useRouter();

  const [checkoutData, setCheckoutData] = useState([]);
  const [paymentValue, setPaymentValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      render: (url: string, record) => <img className="w-20" src={url} />,
    },
    {
      title: "照片編號",
      dataIndex: "id",
      key: "id",
      width: 100,
      ellipsis: true,
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
    const checkoutData = JSON.parse(
      sessionStorage.getItem("checkoutData") || "{}"
    );
    setCheckoutData(checkoutData);
    setLoading(false);
  }, []);

  const fee =
    paymentOptions.find((option) => option.value === paymentValue)?.fee || 0;

  const total = checkoutData
    .map((item: CartDataProps) => Number(item.price))
    .reduce((a, b) => a + b, 0);

  const onChange = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
    setPaymentValue(e.target.value);
  };

  const createOrder = async () => {
    setLoading(true);
    //成立訂單
    fetch(`${domain}/api/orders/add`, {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: paymentValue,
        totalAmount: total + fee,
        items: checkoutData,
        orderBy: getCookie("userId"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("res", res);
        if (res.status === 200) {
          sessionStorage.removeItem("checkoutData");
          sessionStorage.removeItem("cart");
          setCheckoutData([]);
          message.success("訂單建立成功");
          router.push("/user/orders");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  // const handleOnCheckOut = () => {
  //   setIsModalOpen(true);
  // };

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

  return (
    <>
      <div className="container mx-auto my-24 text-[color:var(--main-color-dark)] w-[70%]">
        <h1 className="text-center text-2xl mb-10">訂單明細</h1>
        {!loading ? (
          <>
            <div>
              <Table
                dataSource={checkoutData}
                columns={columns}
                footer={() => (
                  <div className="flex justify-end">
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

              <div className="flex justify-end">
                <Radio.Group onChange={onChange} value={paymentValue}>
                  <Space direction="vertical">
                    {paymentOptions.map((option: any) => (
                      <Radio value={option.value} disabled={option.disabled}>
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

            <div className="flex justify-center my-4">
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
            />
          </>
        ) : (
          <Spin className="mx-auto my-[40vh] w-full" size="large" />
        )}
      </div>
    </>
  );
};
export default checkout;

export const getServerSideProps = async (context: any) => {
  const previousUrl = context.req.headers.referer || context.req.url;
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
